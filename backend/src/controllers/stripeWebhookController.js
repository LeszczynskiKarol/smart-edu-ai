// backend/src/controllers/stripeWebhookController.js
const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const sendEmail = require('../utils/sendEmail');
const https = require('https');
const { getExchangeRate } = require('../utils/exchangeRateUtils');
const { convertPLNtoUSD, convertUSDtoPLN } = require('../utils/currencyUtils');
const UserActivity = require('../models/UserActivity');
const ConversionService = require('../services/ConversionService');
const TikTokEventService = require('../services/TikTokEventService');
const Anthropic = require('@anthropic-ai/sdk');
const { mapReferrerToSource } = require('../utils/referrerMapping');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function handleOrderPaymentAndTopUp(session) {
  const amount = session.amount_total / 100;
  const userId = session.metadata.userId;
  const orderId = session.metadata.orderId;
  const paidAmount = session.amount_total / 100;
  const currency = session.metadata.currency || 'PLN';
  const appliedDiscount = parseFloat(session.metadata.appliedDiscount) || 0;
  const originalAmount = parseFloat(session.metadata.totalPrice) || paidAmount;

  // Pobranie kursu wymiany
  let exchangeRate;
  try {
    const rateFromMetadata = session.metadata.exchangeRate
      ? parseFloat(session.metadata.exchangeRate)
      : null;

    exchangeRate =
      !isNaN(rateFromMetadata) && rateFromMetadata > 0
        ? rateFromMetadata
        : await getExchangeRate();
  } catch (err) {
    console.error('Błąd podczas pobierania kursu wymiany:', err);
    exchangeRate = await getExchangeRate();
  }

  const missingAmountUSD = parseFloat(session.metadata.missingAmountUSD);
  const extraTopUp = parseFloat(session.metadata.extraTopUp || 0);
  const totalPrice = parseFloat(session.metadata.totalPrice);

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`Nie znaleziono użytkownika o ID ${userId}`);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(`Nie znaleziono zamówienia o ID ${orderId}`);
    }

    // Przeliczanie kwot na USD
    const orderAmountInUSD =
      currency === 'PLN'
        ? await convertPLNtoUSD(totalPrice, exchangeRate)
        : totalPrice;

    const paidAmountInUSD =
      currency === 'PLN'
        ? await convertPLNtoUSD(paidAmount, exchangeRate)
        : paidAmount;

    // Aktualizacja salda użytkownika - TYLKO nadwyżka
    const surplusInUSD = paidAmountInUSD - orderAmountInUSD;
    user.accountBalance = (user.accountBalance || 0) + surplusInUSD;

    // Aktualizacja statusu zamówienia
    order.paymentStatus = 'paid';
    order.status = 'w trakcie';

    // Aktualizacja statusów wszystkich elementów zamówienia
    order.items = order.items.map((item) => ({
      ...item,
      status: 'w trakcie',
      startTime: new Date(),
      progress: 0,
    }));

    await Promise.all([user.save(), order.save()]);

    // Sprawdzamy, czy to zamówienie na post social media
    //if (order.items[0].contentType === 'post_social_media') {
    // Asynchronicznie generujemy post
    //generateSocialMediaPostAsync(order._id);
    //} else {
    // Dla innych typów treści, wysyłamy dane do Make.com
    //      await sendOrderToMake(order, user);
    //}

    // Wysyłanie danych do Make.com
    await sendOrderToMake(order, user);

    // Tworzenie faktury w Stripe
    const stripeInvoice = await createStripeInvoice(
      user,
      totalPrice,
      paidAmount,
      currency,
      appliedDiscount
    );
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      stripeInvoice.id
    );
    const invoicePdfUrl = finalizedInvoice.invoice_pdf;
    if (isNaN(originalAmount)) {
      throw new Error('Nieprawidłowa kwota płatności');
    }

    const validatedAmount = parseFloat(originalAmount);
    if (!validatedAmount || validatedAmount <= 0) {
      throw new Error('Kwota płatności musi być większa od zera');
    }

    // Tworzenie rekordu płatności
    const payment = await Payment.create({
      user: userId,
      amount: originalAmount || paidAmount,
      paidAmount: paidAmount,
      type: 'order_payment',
      status: 'completed',
      stripeSessionId: session.id,
      stripeInvoiceId: finalizedInvoice.id,
      currency: session.metadata.currency || 'PLN',
      amountPLN: currency === 'USD' ? totalPrice * exchangeRate : totalPrice,
      amountUSD: currency === 'PLN' ? totalPrice / exchangeRate : totalPrice,
      relatedOrder: orderId,
      metadata: {
        stripePaymentIntentId: session.payment_intent,
        originalOrderTotal: totalPrice,
        extraTopUp: extraTopUp,
        orderNumber: order.orderNumber,
        itemsCount: order.items.length,
      },
    });

    // Tworzenie lokalnej faktury
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = new Invoice({
      invoiceNumber,
      order: order._id,
      user: userId,
      payment: payment._id,
      amount: paidAmount,
      paidAmount: paidAmount,
      status: 'paid',
      paidDate: new Date(),
      stripeInvoiceId: finalizedInvoice.id,
      pdfUrl: invoicePdfUrl,
    });
    await invoice.save();

    if (session.metadata.analyticalSessionId) {
      const deviceData = await UserActivity.findOne(
        {
          sessionId: session.metadata.analyticalSessionId,
          deviceInfo: { $exists: true },
        },
        {
          deviceInfo: 1,
          _id: 0,
        }
      ).lean();

      const sessionActivity = await UserActivity.findOne(
        {
          sessionId: session.metadata.analyticalSessionId,
          sessionData: { $exists: true },
        },
        {
          'sessionData.firstReferrer': 1,
          'sessionData.referrer': 1,
          deviceInfo: 1,
        }
      ).lean();

      // Pobieramy informacje o metodzie płatności
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );
      const paymentMethod = paymentIntent?.latest_charge
        ? (await stripe.charges.retrieve(paymentIntent.latest_charge))
            ?.payment_method_details?.type
        : 'unknown';

      await ConversionService.trackConversion(
        session.metadata.analyticalSessionId,
        userId,
        'conversion_payment_order', // zawsze order dla handleOrderPaymentAndTopUp
        {
          component: 'Stripe',
          action: 'payment_success',
          path: '/dashboard',
          value: amount,
          status: 'completed',
          source: sessionActivity?.sessionData?.firstReferrer
            ? mapReferrerToSource(sessionActivity.sessionData.firstReferrer)
            : 'unknown',
          firstReferrer: session.metadata.firstReferrer,
          referrer: session.metadata.originalReferrer,
          deviceInfo: sessionActivity?.deviceInfo,
          metadata: {
            amount: amount,
            paidAmount: paidAmount,
            currency: session.metadata.currency,
            stripeSessionId: session.id,
            paymentMethod: paymentMethod,
            orderId: session.metadata.orderId,
          },
        }
      );
      if (sessionActivity?.sessionData?.firstReferrer) {
        const source = mapReferrerToSource(
          sessionActivity.sessionData.firstReferrer
        );

        if (source === 'tiktok') {
          await TikTokEventService.trackEvent('CompletePayment', {
            currency: session.metadata.currency,
            value: amount,
            content_type: 'order',
            content_name: `Order #${order.orderNumber}`,
            content_id: order._id.toString(),
            url: process.env.FRONTEND_URL + '/dashboard/orders',
            source: 'tiktok',
            referrer: sessionActivity.sessionData.referrer,
            email: user.email,
            external_id: user._id.toString(),
          });
        }
      }
    }

    //const adminUser = await User.findOne({ role: 'admin' });
    //if (adminUser && adminUser.email) {
    //      try {
    //await sendOrderToMake(order, user);

    //await sendEmail({
    //email: adminUser.email,
    //subject: 'Nowe zamówienie opłacone',
    //message: `Zamówienie nr ${order.orderNumber} zostało opłacone przez użytkownika ${user.name}. Zaloguj się do panelu administracyjnego, aby zobaczyć szczegóły.`,
    //});
    //} catch (emailError) {
    //        console.error('Błąd podczas wysyłania e-maila do admina:', emailError);
    //}
    //}

    // Wysyłanie e-maila do klienta
    // const emailContent = `
    // <h2>Potwierdzenie opłacenia zamówienia #${order.orderNumber}</h2>
    // <p>Dziękujemy za opłacenie zamówienia nr ${order.orderNumber}.</p>
    // <h3>Szczegóły zamówienia:</h3>
    // <ul>
    // <li>Całkowita cena: ${order.totalPrice.toFixed(2)} zł</li>
    // <li>Liczba zamówionych artykułów: ${order.items.length}</li>
    // <li>Przewidywana data realizacji: ${new Date(order.declaredDeliveryDate).toLocaleDateString()}</li>
    // </ul>
    // <p>Możesz śledzić status swojego zamówienia <a href="${process.env.FRONTEND_URL}/dashboard/orders/${order._id}" class="button">logując się do panelu klienta</a>.</p>
    // <p>W razie jakichkolwiek pytań prosimy o kontakt.</p>
    // <p>Pozdrawiamy,<br>Zespół eCopywriting.pl</p>
    // `;

    // const emailData = {
    // title: 'eCopywriting.pl',
    // headerTitle: 'eCopywriting.pl',
    // content: emailContent,
    // };

    // const emailHtml = generateEmailTemplate(emailData);

    // try {
    // await sendEmail({
    // email: user.email,
    // subject: `eCopywriting.pl - potwierdzenie opłacenia zamówienia #${order.orderNumber}`,
    // message: emailHtml,
    // isHtml: true,
    // });
    // } catch (emailError) {
    // console.error(
    // 'Błąd podczas wysyłania e-maila do użytkownika:',
    // emailError
    // );
    // }
  } catch (error) {
    console.error('Szczegóły błędu:', {
      message: error.message,
      originalAmount,
      metadata: session.metadata,
      validationErrors: error.errors,
    });
    throw error;
  }
}

async function handleAccountTopUp(session) {
  const userId = session.metadata.userId;
  const analyticalSessionId = session.metadata.analyticalSessionId;
  const amount = session.amount_total / 100;
  const originalAmount = parseFloat(session.metadata.originalAmount);
  const paidAmount = session.amount_total / 100;
  const currency = session.metadata.currency || 'USD';
  const exchangeRate = session.metadata.exchangeRate
    ? parseFloat(session.metadata.exchangeRate)
    : await getExchangeRate();

  try {
    const existingPayment = await Payment.findOne({
      stripeSessionId: session.id,
    });

    if (existingPayment) {
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Przeliczanie kwot w zależności od waluty
    const amountInUSD =
      currency === 'PLN'
        ? await convertPLNtoUSD(originalAmount, exchangeRate)
        : originalAmount;

    const amountInPLN =
      currency === 'USD'
        ? await convertUSDtoPLN(originalAmount, exchangeRate)
        : originalAmount;

    if (isNaN(originalAmount)) {
      throw new Error('Nieprawidłowa kwota płatności');
    }

    const validatedAmount = parseFloat(originalAmount);
    if (!validatedAmount || validatedAmount <= 0) {
      throw new Error('Kwota płatności musi być większa od zera');
    }

    // Aktualizacja salda - dodajemy kwotę w USD
    const previousBalance = user.accountBalance || 0;
    user.accountBalance = previousBalance + amountInUSD;

    await user.save();

    // Tworzenie faktury w Stripe
    const stripeInvoice = await createStripeInvoice(
      user,
      originalAmount,
      paidAmount,
      currency,
      parseFloat(session.metadata.appliedDiscount)
    );
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      stripeInvoice.id
    );
    // Tworzenie płatności z prawidłowymi kwotami
    const payment = await Payment.create({
      user: userId,
      amount: originalAmount || paidAmount,
      paidAmount: paidAmount,
      type: 'top_up', // dla doładowania zawsze top_up
      status: 'completed',
      stripeSessionId: session.id,
      stripeInvoiceId: finalizedInvoice.id,
      currency: session.metadata.currency || 'PLN',
      // Dla doładowania używamy tylko originalAmount/paidAmount
      amountPLN: currency === 'USD' ? paidAmount * exchangeRate : paidAmount,
      amountUSD: currency === 'PLN' ? paidAmount / exchangeRate : paidAmount,
      metadata: {
        stripePaymentIntentId: session.payment_intent,
        appliedDiscount: session.metadata.appliedDiscount,
        originalAmount: originalAmount,
      },
    });
    // Aktualizacja płatności o ID faktury
    payment.stripeInvoiceId = finalizedInvoice.id;
    await payment.save();

    // Tworzenie lokalnej faktury
    const invoiceNumber = await generateInvoiceNumber();
    const localInvoice = await Invoice.create({
      invoiceNumber,
      user: userId,
      payment: payment._id,
      amount: originalAmount,
      paidAmount: originalAmount,
      currency: currency,
      exchangeRate: exchangeRate,
      amountPLN: amountInPLN,
      amountUSD: amountInUSD,
      status: 'paid',
      paidDate: new Date(),
      stripeInvoiceId: finalizedInvoice.id,
      pdfUrl: finalizedInvoice.invoice_pdf,
      metadata: {
        taxId: user.companyDetails?.nip || '',
        taxIdLabel: currency === 'USD' ? 'Tax ID' : 'NIP',
        currencySymbol: currency === 'USD' ? '$' : 'zł',
      },
    });
    if (analyticalSessionId) {
      const deviceData = await UserActivity.findOne(
        {
          sessionId: session.metadata.analyticalSessionId,
          deviceInfo: { $exists: true },
        },
        {
          deviceInfo: 1,
          _id: 0,
        }
      ).lean();

      const sessionActivity = await UserActivity.findOne(
        {
          sessionId: session.metadata.analyticalSessionId,
          sessionData: { $exists: true },
        },
        {
          'sessionData.firstReferrer': 1,
          'sessionData.referrer': 1,
          deviceInfo: 1,
        }
      ).lean();

      // Pobieramy informacje o metodzie płatności
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );
      const paymentMethod = paymentIntent?.latest_charge
        ? (await stripe.charges.retrieve(paymentIntent.latest_charge))
            ?.payment_method_details?.type
        : 'unknown';

      // Teraz możemy użyć tych danych
      await ConversionService.trackConversion(
        session.metadata.analyticalSessionId,
        userId,
        session.metadata.type === 'order_payment'
          ? 'conversion_payment_order'
          : 'conversion_payment_top_up',
        {
          component: 'Stripe',
          action: 'payment_success',
          path: '/dashboard',
          value: amount,
          status: 'completed',
          source: sessionActivity?.sessionData?.firstReferrer
            ? mapReferrerToSource(sessionActivity.sessionData.firstReferrer)
            : 'unknown',

          firstReferrer: session.metadata.firstReferrer,
          referrer: session.metadata.originalReferrer,
          deviceInfo: sessionActivity?.deviceInfo,
          metadata: {
            amount: amount,
            paidAmount: paidAmount,
            currency: session.metadata.currency,
            stripeSessionId: session.id,
            paymentMethod: paymentMethod,
            orderId: session.metadata.orderId,
          },
        }
      );

      if (sessionActivity?.sessionData?.firstReferrer) {
        const source = mapReferrerToSource(
          sessionActivity.sessionData.firstReferrer
        );

        if (source === 'tiktok') {
          await TikTokEventService.trackEvent('CompletePayment', {
            currency: currency,
            value: amount,
            content_type: 'top_up',
            content_name: 'Account Top-up',
            content_id: session.id,
            url: process.env.FRONTEND_URL + '/dashboard',
            source: 'tiktok',
            referrer: sessionActivity.sessionData.referrer,
            email: user.email,
            external_id: user._id.toString(),
          });
        }
      }

      await UserActivity.updateOne(
        {
          sessionId: analyticalSessionId,
          'eventData.action': 'payment_pending',
        },
        {
          $set: {
            'eventData.action': 'payment_success',
            'eventData.conversionData': {
              type: 'payment',
              subtype: 'top_up',
              value: originalAmount,
              status: 'completed',
              source: 'stripe',
            },
          },
        }
      );
    }
  } catch (error) {
    console.error('Błąd w handleAccountTopUp:', {
      error: error.message,
      stack: error.stack,
      sessionId: session.id,
      metadata: session.metadata,
    });
    throw error;
  }
}

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.metadata.type === 'account_top_up') {
        await handleAccountTopUp(session);
      } else if (session.metadata.type === 'order_payment') {
        await handleOrderPaymentAndTopUp(session);
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;

      if (session.metadata.analyticalSessionId) {
        await UserActivity.create({
          userId: session.metadata.userId,
          sessionId: session.metadata.analyticalSessionId,
          eventType: 'payment',
          eventData: {
            component: 'Stripe',
            action: 'payment_canceled',
            path: '/pl/dashboard',
            metadata: {
              timestamp: new Date().toISOString(),
              type: 'order_payment',
              conversionType: 'order_payment',
              orderId: session.metadata.orderId,
            },
          },
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

async function updateStripeCustomer(user) {
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.companyDetails?.companyName || user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });
    user.stripeCustomerId = customer.id;
    await user.save();
  }

  await stripe.customers.update(user.stripeCustomerId, {
    name: user.companyDetails?.companyName || user.name,
    email: user.email,
    address: {
      line1: `${user.companyDetails?.nip || ''}`,
      line2: `${user.companyDetails?.address || ''} ${user.companyDetails?.buildingNumber || ''}`,
      postal_code: user.companyDetails?.postalCode || '',
      city: user.companyDetails?.city || '',
      country: 'PL',
    },
  });
}

async function createStripeInvoice(
  user,
  amount,
  discountedAmount,
  currency = 'PLN',
  appliedDiscount = 0
) {
  await updateStripeCustomer(user);

  const isUSD = currency.toUpperCase() === 'USD';
  const description = isUSD
    ? 'Account Top-up at Smart-Edu.AI'
    : 'Doładowanie konta w Smart-Edu.AI';

  const stripeInvoice = await stripe.invoices.create({
    customer: user.stripeCustomerId,
    auto_advance: true,
    collection_method: 'charge_automatically',
    currency: currency.toLowerCase(),
    custom_fields: [
      {
        name: isUSD ? 'Tax ID:' : 'NIP sprzedawcy:',
        value: '9562203948',
      },
    ],
  });

  // Jeśli jest rabat, dodajemy go jako osobną pozycję ze znakiem minus
  if (appliedDiscount > 0) {
    const discountAmount = amount - discountedAmount;
    await stripe.invoiceItems.create({
      customer: user.stripeCustomerId,
      amount: -Math.round(discountAmount * 100), // minus przed kwotą rabatu
      currency: currency.toLowerCase(),
      invoice: stripeInvoice.id,
      description: `Rabat ${appliedDiscount}%`,
    });
  }
  const invoiceItem = await stripe.invoiceItems.create({
    customer: user.stripeCustomerId,
    amount: Math.round(discountedAmount * 100), // Używamy discountedAmount (zapłacona kwota)
    currency: currency.toLowerCase(),
    invoice: stripeInvoice.id,
    description: description,
  });

  return stripeInvoice;
}

async function generateInvoiceNumber() {
  const currentYear = new Date().getFullYear();
  const lastInvoice = await Invoice.findOne(
    {},
    {},
    { sort: { invoiceNumber: -1 } }
  );
  let lastNumber = 0;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('/');
    if (parts.length === 3 && parts[1] === currentYear.toString()) {
      lastNumber = parseInt(parts[2], 10);
    }
  }
  return `FV/${currentYear}/${(lastNumber + 1).toString().padStart(6, '0')}`;
}

exports.getSessionDetails = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const user = await User.findById(session.metadata.userId);

    // Pobierz płatność wraz z powiązanym zamówieniem
    const payment = await Payment.findOne({
      stripeSessionId: sessionId,
    }).populate('relatedOrder');

    // Przygotuj odpowiedź w zależności od typu płatności
    let responseData = {
      success: true,
      token: jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      ),
      amount: payment ? payment.amount : 0,
      paidAmount: payment ? payment.paidAmount : 0,
      discount: payment ? payment.appliedDiscount : 0,
      newBalance: user.accountBalance,
    };

    // Jeśli to płatność za zamówienie, dodaj szczegóły zamówienia
    if (payment?.type === 'order_payment' && payment.relatedOrder) {
      responseData.orderDetails = {
        orderNumber: payment.relatedOrder.orderNumber,
        items: payment.relatedOrder.items.map((item) => ({
          _id: item._id,
          topic: item.topic,
          length: item.length,
          contentType: item.contentType,
          price: item.price,
          language: item.language,
          guidelines: item.guidelines,
        })),
        totalPrice: payment.relatedOrder.totalPrice,
        currency: payment.relatedOrder.currency,
      };
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSessionToken = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata.userId) {
      const user = await User.findById(session.metadata.userId);
      if (user) {
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );
        res.cookie('auth_token', token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
        res.json({ success: true, token });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(404).json({ message: 'User ID not found in session' });
    }
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFullLanguageName = (shortCode) => {
  const languageMap = {
    en: 'angielski',
    cs: 'czeski',
    de: 'niemiecki',
    es: 'hiszpański',
    pl: 'polski',
    uk: 'ukraiński',
    pt: 'portugalski',
    ru: 'rosyjski',
  };
  return languageMap[shortCode] || shortCode;
};

async function sendOrderToMake(order, user) {
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

  // Formatowanie danych do JSON
  const formatForJSON = (text) => {
    return text
      .replace(/[\n\r\t\\"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const filteredItems = order.items.filter(
    (item) => item.contentType !== 'post_social_media'
  );

  const makeData = [
    {
      User_ID: user._id.toString(),
      Imie: user.name,
      Faktura: user.companyDetails?.nip ? 'TAK' : 'NIE',
      NazwaFirmy: user.companyDetails?.companyName || '',
      NIPFirmy: user.companyDetails?.nip || '',
      Miejscowosc: user.companyDetails?.city || '',
      KodPocztowy: user.companyDetails?.postalCode || '',
      Ulica: user.companyDetails?.address || '',
      LiczbaZamowien: filteredItems.length,
      LacznaKwotaZamowienia: parseFloat(order.totalPrice).toFixed(2),
      Szyfr: order._id.toString(),
      Zamowienia: filteredItems.map((item) => ({
        ItemID: item._id.toString(),
        Temat: JSON.stringify(formatForJSON(item.topic)),
        RodzajTresci: item.contentType,
        DlugoscTekstu: item.length.toString(),
        Wytyczne: JSON.stringify(formatForJSON(item.guidelines)),
        SlowaKluczowe: JSON.stringify(item.keywords.join(', ')),
        Link1: item.sourceLinks[0] || '',
        Link2: item.sourceLinks[1] || '',
        Link3: item.sourceLinks[2] || '',
        Link4: item.sourceLinks[3] || '',
        JezykTekstu: languageMap[item.language] || item.language,
        JezykWyszukiwania: item.searchLanguage || 'en',
        PelnyJezykWyszukiwania:
          getFullLanguageName(item.searchLanguage) || 'angielski',
        includeFAQ: item.includeFAQ.toString(),
        includeTable: item.includeTable.toString(),
        tone: item.tone,
        CenaTegoTekstu: parseFloat(item.price).toFixed(2),
        bibliography: item.bibliography.toString(),
      })),
      LacznaLiczbaZnakow: filteredItems.reduce(
        (sum, item) => sum + item.length,
        0
      ),
      LiczbaTextow: filteredItems.length,
      LacznaCenaTextow: filteredItems
        .reduce((sum, item) => sum + item.price, 0)
        .toFixed(2),
      CenaZamowienia: parseFloat(order.totalPrice).toFixed(2),
      Email: user.email,
      attachments: order.userAttachments.map(
        (att) => `${process.env.FRONTEND_URL}/upload/${att.url}`
      ),
    },
  ];

  const makeDataString = JSON.stringify(makeData);

  const MAKE_WEBHOOK_URL =
    'https://hook.eu2.make.com/pjv1wmn4i77ov4xu074yazji8y7mc6wb';

  const options = {
    hostname: new URL(MAKE_WEBHOOK_URL).hostname,
    path: new URL(MAKE_WEBHOOK_URL).pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(makeDataString),
    },
  };

  return new Promise((resolve, reject) => {
    const makeRequest = https.request(options, (makeResponse) => {
      let responseData = '';

      makeResponse.on('data', (chunk) => {
        responseData += chunk;
      });

      makeResponse.on('end', () => {
        if (makeResponse.statusCode === 200) {
          resolve(responseData);
        } else {
          console.error('Error response from Make.com:', responseData);
          reject(new Error('Error response from Make.com'));
        }
      });
    });

    makeRequest.on('error', (error) => {
      console.error('Error sending data to Make.com:', error);
      reject(error);
    });

    makeRequest.write(makeDataString);
    makeRequest.end();
  });
}

async function generateSocialMediaPostAsync(orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Nie znaleziono zamówienia:', orderId);
      return;
    }

    const generatedContent = await generateSocialMediaPost(order.items[0]);
    order.items[0].content = generatedContent;
    order.status = 'zakończone';
    await order.save();

    // Powiadomienie użytkownika emailem
    const user = await User.findById(order.user);
    if (user && user.email) {
      const locale = user.locale || 'pl'; // Używamy locale użytkownika lub domyślnego
      i18n.setLocale(locale);

      const emailContent = i18n.__('orders.completion.message', {
        orderNumber: order.orderNumber,
      });
      const emailSubject = i18n.__('orders.completion.subject', {
        orderNumber: order.orderNumber,
      });

      await sendEmail({
        email: user.email,
        subject: emailSubject,
        message: emailContent,
      });
    }
  } catch (error) {
    console.error('Błąd podczas generowania postu social media:', error);
  }
}

async function generateSocialMediaPost(orderItem) {
  try {
    const reducedLength = Math.max(orderItem.length - 1000, 100);

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Napisz post do social media zgodnie z poniższymi wytycznymi. Użyj kilku odpowiednio dobranych emotikon. Post powinien mieć długość około ${reducedLength} znaków i być napisany w języku ${orderItem.language}. CAŁY POST ZAPISZ JAKO KOD HTML!!!!

Wytyczne:
${orderItem.guidelines}

Post:`,
        },
      ],
    });

    return msg.content[0].text.trim();
  } catch (error) {
    console.error('Błąd podczas generowania posta do social media:', error);
    throw error;
  }
}
