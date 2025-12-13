// backend/src/controllers/abandonedCartController.js
const Order = require('../models/Order');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getExchangeRate } = require('../utils/exchangeRateUtils');
const { convertPLNtoUSD } = require('../utils/currencyUtils');

// Stały rabat dla porzuconych koszyków
const ABANDONED_CART_DISCOUNT = 20; // 20%
const OFFER_DURATION_MINUTES = 15; // Czas trwania oferty w minutach

/**
 * Pobiera ostatnie porzucone zamówienie użytkownika
 */
exports.getAbandonedOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const force = req.query.force === 'true'; // Pozwala wymusić pobranie nawet po dismiss

    // Znajdź ostatnie zamówienie ze statusem 'pending'
    let abandonedOrder = await Order.findOne({
      user: userId,
      paymentStatus: 'pending',
      status: 'oczekujące',
    }).sort({ createdAt: -1 });

    if (!abandonedOrder) {
      return res.status(404).json({
        success: false,
        message: 'No abandoned order found',
      });
    }

    // Sprawdź czy zamówienie nie jest starsze niż 24h
    const orderAge = Date.now() - new Date(abandonedOrder.createdAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 godziny

    if (orderAge > maxAge) {
      return res.status(404).json({
        success: false,
        message: 'Abandoned order expired',
      });
    }

    // Jeśli nie ma abandonedCartOfferedAt, ustaw go teraz (pierwsze pokazanie oferty)
    if (!abandonedOrder.abandonedCartOfferedAt) {
      abandonedOrder.abandonedCartOfferedAt = new Date();
      await abandonedOrder.save();
    }

    // Oblicz expiresAt na podstawie czasu pierwszego pokazania
    const offeredAt = new Date(abandonedOrder.abandonedCartOfferedAt);
    const expiresAt = new Date(
      offeredAt.getTime() + OFFER_DURATION_MINUTES * 60 * 1000
    );

    // Sprawdź czy oferta nie wygasła
    if (Date.now() > expiresAt.getTime()) {
      return res.status(404).json({
        success: false,
        message: 'Offer expired',
      });
    }

    // CRITICAL FIX: Prepare items array for response - ALWAYS include it!
    const itemsArray = abandonedOrder.items.map((item) => ({
      topic: item.topic,
      length: item.length,
      contentType: item.contentType,
    }));

    // Oblicz cenę z rabatem
    const originalPrice = abandonedOrder.totalPriceOriginal;
    const discountedPrice = originalPrice * (1 - ABANDONED_CART_DISCOUNT / 100);

    // Jeśli było dismissed i nie wymuszamy - nie pokazuj automatycznie
    // Ale zwróć info że zamówienie istnieje
    if (abandonedOrder.abandonedCartDismissedAt && !force) {
      return res.status(200).json({
        success: true,
        dismissed: true,
        canReactivate: true,
        data: {
          orderId: abandonedOrder._id,
          orderNumber: abandonedOrder.orderNumber,
          originalPrice: originalPrice,
          discountedPrice: Number(discountedPrice.toFixed(2)),
          discount: ABANDONED_CART_DISCOUNT,
          currency: abandonedOrder.currency,
          itemsCount: abandonedOrder.items.length,
          items: itemsArray, // CRITICAL FIX: ALWAYS include items!
          expiresAt: expiresAt.toISOString(),
        },
      });
    }

    res.status(200).json({
      success: true,
      dismissed: false,
      data: {
        orderId: abandonedOrder._id,
        orderNumber: abandonedOrder.orderNumber,
        originalPrice: originalPrice,
        discountedPrice: Number(discountedPrice.toFixed(2)),
        discount: ABANDONED_CART_DISCOUNT,
        currency: abandonedOrder.currency,
        itemsCount: abandonedOrder.items.length,
        items: itemsArray,
        createdAt: abandonedOrder.createdAt,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error getting abandoned order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * Aplikuje rabat i tworzy nową sesję płatności
 */
exports.applyAbandonedCartDiscount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, analyticalSessionId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      paymentStatus: 'pending',
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or already paid',
      });
    }

    // Sprawdź czy oferta nie wygasła
    if (order.abandonedCartOfferedAt) {
      const offeredAt = new Date(order.abandonedCartOfferedAt);
      const expiresAt = new Date(
        offeredAt.getTime() + OFFER_DURATION_MINUTES * 60 * 1000
      );

      if (Date.now() > expiresAt.getTime()) {
        return res.status(400).json({
          success: false,
          message: 'Offer expired',
        });
      }
    }

    const exchangeRate = order.exchangeRate || (await getExchangeRate());
    const currency = order.currency || 'PLN';

    // Oblicz nową cenę z rabatem
    const originalPrice = order.totalPriceOriginal;
    const discountedPrice = originalPrice * (1 - ABANDONED_CART_DISCOUNT / 100);

    // Oblicz kwotę do zapłaty
    const orderAmountInUSD =
      currency === 'PLN'
        ? await convertPLNtoUSD(discountedPrice, exchangeRate)
        : discountedPrice;

    const currentBalance = Math.max(0, user.accountBalance || 0);
    const missingAmount =
      currentBalance >= orderAmountInUSD
        ? 0
        : orderAmountInUSD - currentBalance;

    // Jeśli użytkownik ma wystarczające saldo - opłać z salda
    if (missingAmount <= 0) {
      // Aktualizuj zamówienie
      order.totalPrice = discountedPrice;
      order.appliedDiscount = ABANDONED_CART_DISCOUNT;
      order.paymentStatus = 'paid';
      order.status = 'w trakcie';

      // Aktualizuj statusy itemów
      order.items = order.items.map((item) => ({
        ...item.toObject(),
        status: 'w trakcie',
        startTime: new Date(),
        progress: 0,
      }));

      await order.save();

      // Odejmij z salda
      user.accountBalance -= orderAmountInUSD;
      await user.save();

      // Uruchom generowanie (podobnie jak w orderController)
      await triggerTextGeneration(order, user);

      return res.status(200).json({
        success: true,
        paidFromBalance: true,
        order: {
          orderNumber: order.orderNumber,
          totalPrice: discountedPrice,
          discount: ABANDONED_CART_DISCOUNT,
        },
        remainingBalance: user.accountBalance,
      });
    }

    const locale = user.locale || 'pl';
    const successUrl = `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&type=payment&orderNumber=${order.orderNumber}&totalPrice=${discountedPrice}&itemsCount=${order.items.length}&abandoned_discount=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types:
        currency === 'PLN' ? ['blik', 'card', 'paypal'] : ['card', 'paypal'],
      line_items: order.items.map((item) => {
        const itemOriginalPrice = parseFloat(item.price);
        const itemDiscountedPrice =
          itemOriginalPrice * (1 - ABANDONED_CART_DISCOUNT / 100);

        // Formatuj długość tekstu
        const lengthLabel =
          item.length >= 1000
            ? `${(item.length / 1000).toFixed(0)}k znaków`
            : `${item.length} znaków`;

        return {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: item.topic || item.contentType,
              description: `${item.contentType} | ${lengthLabel} | -${ABANDONED_CART_DISCOUNT}%`,
            },
            unit_amount: Math.round(itemDiscountedPrice * 100),
          },
          quantity: 1,
        };
      }),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?order_canceled=true`,
      customer_email: user.email,
      locale: locale === 'pl' ? 'pl' : 'auto',
      metadata: {
        userId: user._id.toString(),
        type: 'order_payment',
        orderId: order._id.toString(),
        currency: currency,
        exchangeRate: exchangeRate?.toString(),
        totalPrice: discountedPrice.toString(),
        originalPrice: originalPrice.toString(),
        appliedDiscount: ABANDONED_CART_DISCOUNT.toString(),
        isAbandonedCartDiscount: 'true',
        missingAmountUSD: missingAmount.toString(),
        userToken: req.headers.authorization.split(' ')[1],
        analyticalSessionId: analyticalSessionId || '',
      },
    });

    // Aktualizuj zamówienie z nowym rabatem
    order.appliedDiscount = ABANDONED_CART_DISCOUNT;
    order.totalPrice = discountedPrice;
    await order.save();

    res.status(200).json({
      success: true,
      paymentUrl: session.url,
      order: {
        orderNumber: order.orderNumber,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        discount: ABANDONED_CART_DISCOUNT,
      },
    });
  } catch (error) {
    console.error('Error applying abandoned cart discount:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * Usuwa porzucone zamówienie (jeśli user nie chce skorzystać z rabatu)
 */
exports.dismissAbandonedOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    // Zamiast usuwać - oznacz jako dismissed
    const result = await Order.findOneAndUpdate(
      {
        _id: orderId,
        user: userId,
        paymentStatus: 'pending',
      },
      {
        $set: { abandonedCartDismissedAt: new Date() },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      dismissed: !!result,
    });
  } catch (error) {
    console.error('Error dismissing abandoned order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Helper function do uruchamiania generowania
async function triggerTextGeneration(order, user) {
  const OrderedText = require('../models/OrderedText');
  const textGenerationService = require('../services/textGenerationService');
  const academicWorkService = require('../services/academicWorkService');

  const mapTextLangToSearchLang = (textLang) => {
    const mapping = {
      pol: 'pl',
      eng: 'en',
      ger: 'de',
      ukr: 'uk',
      fra: 'fr',
      esp: 'es',
      ros: 'ru',
      por: 'pt',
    };
    return mapping[textLang] || 'en';
  };

  const languageMap = {
    pol: 'polski',
    eng: 'angielski',
    ger: 'niemiecki',
    ukr: 'ukraiński',
    fra: 'francuski',
    esp: 'hiszpański',
    ros: 'rosyjski',
    por: 'portugalski',
  };

  const filteredItems = order.items.filter(
    (item) => item.contentType !== 'post_social_media'
  );

  const orderedTextsToSave = filteredItems.map((item) => ({
    temat: item.topic,
    idZamowienia: order._id.toString(),
    itemId: item._id.toString(),
    cena: parseFloat(item.price),
    cenaZamowienia: parseFloat(order.totalPrice),
    rodzajTresci: item.contentType,
    dlugoscTekstu: item.length,
    liczbaZnakow: item.length,
    wytyczneIndywidualne: item.guidelines,
    tonIStyl: item.tone,
    jezyk: languageMap[item.language] || item.language,
    jezykWyszukiwania:
      item.searchLanguage || mapTextLangToSearchLang(item.language),
    countryCode: languageMap[item.language] || item.language,
    model: 'Claude 2.0',
    bibliografia: item.bibliography,
    faq: item.includeFAQ,
    tabele: item.includeTable,
    boldowanie: false,
    listyWypunktowane: true,
    frazy: (item.keywords || []).join(', '),
    link1: item.sourceLinks?.[0] || '',
    link2: item.sourceLinks?.[1] || '',
    link3: item.sourceLinks?.[2] || '',
    link4: item.sourceLinks?.[3] || '',
    status: 'Oczekujące',
    startDate: new Date(),
    email: user.email,
    userId: user._id,
    originalOrderId: order._id,
    originalItemId: item._id,
  }));

  const savedTexts = await OrderedText.insertMany(orderedTextsToSave);

  for (const orderedText of savedTexts) {
    const isAcademicWork =
      orderedText.rodzajTresci.toLowerCase().includes('magister') ||
      orderedText.rodzajTresci.toLowerCase().includes('licencjack');

    if (isAcademicWork) {
      academicWorkService
        .generateAcademicWork(orderedText._id)
        .catch((err) => console.error('Błąd:', err));
    } else {
      textGenerationService
        .processOrderedText(orderedText._id)
        .catch((err) => console.error('Błąd:', err));
    }
  }
}

module.exports = exports;
