// backend/src/controllers/orderController.js
const https = require('https');
const OrderedText = require('../models/OrderedText');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const sendEmail = require('../utils/sendEmail');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { generateEmailTemplate } = require('../utils/emailTemplate');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const OrderComment = require('../models/OrderComment');
const Anthropic = require('@anthropic-ai/sdk');
const { convertUSDtoPLN, convertPLNtoUSD } = require('../utils/currencyUtils');
const { getExchangeRate } = require('../utils/exchangeRateUtils');
const i18n = require('../../src/config/i18n');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Mapowanie języków tekstów na języki wyszukiwania
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

exports.createOrder = async (req, res) => {
  try {
    const handleOrderAmount = async (amount, currency, providedRate = null) => {
      const rate = providedRate || (await getExchangeRate());

      return {
        amount,
        exchangeRate: rate,
        amountPLN: currency === 'USD' ? amount * rate : amount,
        amountUSD: currency === 'PLN' ? amount / rate : amount,
      };
    };

    // Pozostałe funkcje pomocnicze bez zmian
    const calculatePriceInPLN = (length) => length * 0.003988;

    const calculatePrice = async (
      length,
      currency,
      contentType,
      providedRate = null
    ) => {
      // Specjalne przypadki dla prac licencjackich i magisterskich
      if (contentType === 'licencjacka') {
        if (currency === 'USD') {
          const rate = providedRate || (await getExchangeRate());
          return Number((199 / rate).toFixed(2));
        }
        return 199;
      }

      if (contentType === 'magisterska') {
        if (currency === 'USD') {
          const rate = providedRate || (await getExchangeRate());
          return Number((249 / rate).toFixed(2));
        }
        return 249;
      }

      // Standardowe obliczanie ceny dla pozostałych typów
      const pricePLN = calculatePriceInPLN(length);
      const rate = providedRate || (await getExchangeRate());
      if (currency === 'USD') {
        return Number((pricePLN / rate).toFixed(2));
      }
      return Number(pricePLN.toFixed(2));
    };

    const calculateEstimatedTime = (item) => {
      // Prace licencjackie i magisterskie
      if (item.contentType === 'licencjacka') {
        return new Date(Date.now() + 60 * 60 * 1000); // 60 minut
      }
      if (item.contentType === 'magisterska') {
        return new Date(Date.now() + 90 * 60 * 1000); // 90 minut
      }

      // Social media
      if (item.contentType === 'post_social_media') {
        return new Date(Date.now() + 45 * 1000); // 45 sekund
      }

      // Pozostałe teksty - 1 minuta na 1000 znaków
      const minutesPerThousand = 1;
      const estimatedMinutes =
        Math.ceil(item.length / 1000) * minutesPerThousand;
      return new Date(Date.now() + estimatedMinutes * 60 * 1000);
    };

    const {
      orderItems,
      appliedDiscount,
      declaredDeliveryDate,
      userAttachments,
      currency = 'PLN',
      exchangeRate = null,
    } = req.body;
    const userId = req.user.id;
    // Walidacje początkowe bez zmian
    if (currency === 'USD' && (!exchangeRate || exchangeRate <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exchange rate for USD transaction',
      });
    }

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowe dane zamówienia',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony',
      });
    }

    // Obliczanie wstępnej ceny całkowitej
    const preliminaryTotalPrice = await orderItems.reduce(
      async (sumPromise, item) => {
        const sum = await sumPromise;
        const price = await calculatePrice(
          parseInt(item.length, 10),
          currency,
          item.contentType,
          exchangeRate
        );
        return sum + price;
      },
      Promise.resolve(0)
    );

    const orderAmounts = await handleOrderAmount(
      preliminaryTotalPrice,
      currency,
      exchangeRate
    );

    // NOWA LOGIKA SPRAWDZANIA SALDA I PŁATNOŚCI
    // 1. Obliczamy kwotę zamówienia w USD
    const orderAmountInUSD =
      currency === 'PLN'
        ? await convertPLNtoUSD(
            preliminaryTotalPrice,
            orderAmounts.exchangeRate
          )
        : preliminaryTotalPrice;

    // 2. Sprawdzamy saldo (zawsze w USD)
    const currentBalance = Math.max(0, user.accountBalance || 0);

    // 3. Decydujemy o płatności
    const missingAmount =
      currentBalance >= orderAmountInUSD
        ? 0
        : orderAmountInUSD - currentBalance;

    const startTime = missingAmount > 0 ? null : new Date();

    // Pozostała logika validatedOrderItems bez zmian
    const validatedOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        let contentType = item.contentType;
        let searchLanguage; // Usuwamy domyślną wartość

        try {
          // Zawsze wykonujemy zapytanie o język wyszukiwania
          const result = await determineContentTypeAndSearchLanguage(
            item.guidelines,
            item.language
          );

          // Aktualizujemy contentType tylko jeśli jest pusty
          if (!contentType || contentType === '') {
            contentType = result.contentType;
          }

          // Zawsze przypisujemy searchLanguage z wyniku
          searchLanguage = result.searchLanguage;
        } catch (error) {
          console.error('Błąd podczas określania parametrów:', error);
          contentType = contentType || 'artykul';
          searchLanguage = 'en';
        }

        // Czekamy na wynik calculatePrice
        const price = await calculatePrice(
          parseInt(item.length, 10),
          currency,
          exchangeRate
        );

        const pricePLN = currency === 'USD' ? price * exchangeRate : price;
        const estimatedCompletionTime = calculateEstimatedTime(item);

        return {
          ...item,
          length: parseInt(item.length, 10),
          price: Number(price), // Upewnij się, że to jest liczba
          pricePLN: Number(pricePLN), // Upewnij się, że to jest liczba
          contentType,
          searchLanguage:
            item.searchLanguage || mapTextLangToSearchLang(item.language),
          keywords: item.frazy || [],
          sourceLinks: [item.link1, item.link2, item.link3, item.link4].filter(
            Boolean
          ),
          includeFAQ: item.includeFAQ || false,
          includeTable: item.includeTable || false,
          tone: item.tone || 'nieformalny',
          status: missingAmount > 0 ? 'oczekujące' : 'w trakcie',
          startTime: missingAmount > 0 ? null : startTime,
          estimatedCompletionTime: estimatedCompletionTime,
          progress: 0,
        };
      })
    );

    // Teraz możemy użyć validatedOrderItems
    const totalPrice = await validatedOrderItems.reduce(
      async (sumPromise, item) => {
        const sum = await sumPromise;
        const price = await calculatePrice(
          parseInt(item.length, 10),
          currency,
          item.contentType,
          exchangeRate
        );
        return sum + price;
      },
      Promise.resolve(0)
    );

    const order = new Order({
      user: userId,
      items: validatedOrderItems,
      totalPrice: preliminaryTotalPrice,
      totalPriceOriginal: preliminaryTotalPrice,
      totalPricePLN: orderAmounts.amountPLN,
      currency: currency,
      exchangeRate: orderAmounts.exchangeRate,
      appliedDiscount,
      status: missingAmount > 0 ? 'oczekujące' : 'w trakcie',
      paymentStatus: missingAmount > 0 ? 'pending' : 'paid',
      declaredDeliveryDate: new Date(declaredDeliveryDate),
      userAttachments,
    });

    await order.save();

    // Obsługa płatności jeśli potrzebna
    if (missingAmount > 0) {
      const paymentInOriginalCurrency =
        currency === 'PLN'
          ? await convertUSDtoPLN(missingAmount, orderAmounts.exchangeRate)
          : missingAmount;

      const successUrl = `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&type=payment&orderNumber=${order.orderNumber}&totalPrice=${order.totalPrice}&itemsCount=${orderItems.length}`;

      const analyticalSessionId =
        req.body.analyticalSessionId || req.query.analyticalSessionId;
      const locale = user.locale || 'pl';

      // Helper do formatowania długości
      const formatLength = (length) => {
        if (locale === 'pl') {
          return length >= 1000
            ? `${Math.round(length / 1000)}k znaków`
            : `${length} znaków`;
        }
        return length >= 1000
          ? `${Math.round(length / 1000)}k chars`
          : `${length} chars`;
      };

      // Helper do nazwy typu treści
      const getContentTypeLabel = (contentType) => {
        const labels = {
          licencjacka:
            locale === 'pl' ? 'Praca licencjacka' : 'Bachelor thesis',
          magisterska: locale === 'pl' ? 'Praca magisterska' : 'Master thesis',
          wypracowanie: locale === 'pl' ? 'Wypracowanie' : 'Essay',
          esej: locale === 'pl' ? 'Esej' : 'Essay',
          referat: locale === 'pl' ? 'Referat' : 'Report',
        };
        return labels[contentType] || contentType;
      };

      // Oblicz współczynnik płatności (jeśli część pokryta z salda)
      const totalItemsPrice = validatedOrderItems.reduce(
        (sum, item) => sum + item.price,
        0
      );
      const paymentRatio =
        totalItemsPrice > 0 ? paymentInOriginalCurrency / totalItemsPrice : 1;

      const session = await stripe.checkout.sessions.create({
        payment_method_types:
          currency === 'PLN' ? ['blik', 'card', 'paypal'] : ['card', 'paypal'],

        line_items: validatedOrderItems.map((item) => {
          const adjustedPrice = item.price * paymentRatio;

          return {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: item.topic || getContentTypeLabel(item.contentType),
                description: `${getContentTypeLabel(item.contentType)} | ${formatLength(item.length)}`,
              },
              unit_amount: Math.round(adjustedPrice * 100),
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
          totalPrice: preliminaryTotalPrice.toString(),
          appliedDiscount: appliedDiscount.toString(),
          missingAmountUSD: missingAmount.toString(),
          userToken: req.headers.authorization.split(' ')[1],
          analyticalSessionId: analyticalSessionId,
          firstReferrer: req.body.firstReferrer || '',
          originalReferrer: req.body.originalReferrer || '',
        },
      });

      if (missingAmount > 0 && analyticalSessionId) {
        await UserActivity.create({
          userId: userId,
          sessionId: analyticalSessionId,
          eventType: 'payment',
          eventData: {
            component: 'OrderForm',
            action: 'payment_pending',
            path: '/pl/dashboard',
            metadata: {
              amount: preliminaryTotalPrice,
              currency: currency,
              discountApplied: appliedDiscount,
              conversionType: 'order_payment',
              type: 'order_payment',
              orderId: order._id.toString(),
            },
          },
          timestamp: new Date(),
          sessionData: {
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
            isActive: true,
            lastActivity: new Date(),
          },
        });
      }

      return res.status(200).json({
        success: true,
        paymentUrl: session.url,
        order: {
          ...order.toObject(),
          orderNumber: order.orderNumber,
          userAttachments: order.userAttachments,
        },
      });
    }

    // Jeśli nie potrzeba płatności, finalizujemy zamówienie
    if (missingAmount <= 0) {
      // Aktualizacja salda użytkownika
      user.accountBalance -= orderAmountInUSD;
      await user.save();

      // Obsługa postów social media i webhooków
      let hasSocialMediaPosts = false;
      let hasOtherContent = false;

      for (const item of order.items) {
        if (item.contentType === 'post_social_media') {
          hasSocialMediaPosts = true;
          this.generateSocialMediaPostAsync(order._id, item);
        } else {
          hasOtherContent = true;
        }
      }

      if (hasOtherContent) {
        // Zapisz do MongoDB (BEZ Make.com)
        // Mapowanie języków
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

        const orderedTextsToSave = order.items
          .filter((item) => item.contentType !== 'post_social_media')
          .map((item) => ({
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
        console.log(`✅ Zapisano ${savedTexts.length} tekstów do MongoDB`);

        const textGenerationService = require('../services/textGenerationService');
        const academicWorkService = require('../services/academicWorkService');

        // Uruchom proces generowania
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
    }

    // Wysyłka e-maila do admina
    // const adminUser = await User.findOne({ role: 'admin' });
    //if (adminUser && adminUser.email) {
    //      try {
    //await sendEmail({
    //          email: adminUser.email,
    //        subject: 'Nowe zamówienie utworzone',
    //      message: `Nowe zamówienie nr ${order.orderNumber} zostało utworzone przez użytkownika ${user.name}. Zaloguj się do panelu administracyjnego, aby zobaczyć szczegóły.`,
    //    });
    //      } catch (emailError) {
    //console.error('Błąd podczas wysyłania e-maila do admina:', emailError);
    //}
    //} else {
    //      console.error('Nie można wysłać e-maila: brak adresu e-mail admina');
    //}

    {
      /*const locale = req.locale || req.body.locale || 'pl';
    i18n.setLocale(locale);

    // Wysyłka e-maila do użytkownika
    const emailContent =
      i18n.__mf('orders.orderConfirmation.title', {
        orderNumber: order.orderNumber,
      }) +
      `<h2>${i18n.__mf('orders.orderConfirmation.title', { orderNumber: order.orderNumber })}</h2>
<p>${i18n.__mf('orders.orderConfirmation.thankYou', { orderNumber: order.orderNumber })}</p>
<h3>${i18n.__('orders.orderConfirmation.orderDetails')}</h3>
<ul>
  <li>${i18n.__mf('orders.orderConfirmation.totalPrice', {
    price: order.totalPrice.toFixed(2),
    currency: order.currency === 'PLN' ? 'zł' : '$',
  })}</li>
  <li>${i18n.__mf('orders.orderConfirmation.articlesCount', { count: order.items.length })}</li>
  <li>${i18n.__mf('orders.orderConfirmation.estimatedDate', {
    date: new Date(order.declaredDeliveryDate).toLocaleDateString(locale),
  })}</li>
</ul>
<p>${i18n.__('orders.orderConfirmation.trackOrder')} 
<a href="${process.env.FRONTEND_URL}/dashboard/orders/${order._id}" class="button">
${i18n.__('orders.orderConfirmation.loginPanel')}</a>.</p>
<p>${i18n.__('orders.orderConfirmation.questions')}</p>
<p>${i18n.__('orders.orderConfirmation.regards')},<br>${i18n.__('orders.orderConfirmation.team')}</p>`;

    const emailData = {
      title: 'Smart-Copy.ai',
      headerTitle: 'Smart-Copy.ai',
      content: emailContent,
    };

    const emailHtml = generateEmailTemplate(emailData);

    try {
      await sendEmail({
        email: user.email,
        subject: `Smart-Copy.ai - potwierdzenie zamówienia #${order.orderNumber}`,
        message: emailHtml,
        isHtml: true,
      });
    } catch (emailError) {
      console.error(
        'Błąd podczas wysyłania e-maila do użytkownika:',
        emailError
      );
    }*/
    }

    res.status(201).json({
      success: true,
      message: 'Zamówienie utworzone i opłacone z salda konta',
      order: {
        ...order.toObject(),
        orderNumber: order.orderNumber,
        userAttachments: order.userAttachments,
      },
      remainingBalance: user.accountBalance,
      shouldShowOrderStatus: true,
    });
  } catch (error) {
    console.error('Błąd podczas tworzenia zamówienia:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas tworzenia zamówienia',
      error: error.message,
    });
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

const determineContentTypeAndSearchLanguage = async (
  guidelines,
  userSelectedLanguage
) => {
  try {
    // Określ typ treści przez Claude
    const contentTypeMsg = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Określ rodzaj treści. Odpowiedz JEDNYM słowem.
Wytyczne: ${guidelines}`,
        },
      ],
    });

    const contentType = contentTypeMsg.content[0].text.trim().toLowerCase();

    // KRYTYCZNE - mapowanie języka tekstów frontend->backend
    const frontendToBackendMap = {
      polish: 'pol',
      english: 'eng',
      german: 'ger',
      ukrainian: 'ukr',
      french: 'fra',
      spanish: 'esp',
      russian: 'ros',
      portuguese: 'por',
    };

    // Konwertuj z formatu frontend na backend
    const backendLang =
      frontendToBackendMap[userSelectedLanguage] || userSelectedLanguage;

    // Użyj istniejącej funkcji mapowania
    const searchLanguage = mapTextLangToSearchLang(backendLang);

    console.log(`
🔍 MAPOWANIE JĘZYKÓW:
   Frontend otrzymał: ${userSelectedLanguage}
   Backend format: ${backendLang}
   Język wyszukiwania: ${searchLanguage}
    `);

    return { contentType, searchLanguage };
  } catch (error) {
    console.error('Błąd podczas określania parametrów:', error);
    const backendLang = frontendToBackendMap[userSelectedLanguage] || 'pol';
    const searchLang = mapTextLangToSearchLang(backendLang);
    return { contentType: 'artykul', searchLanguage: searchLang };
  }
};

exports.generateSocialMediaPostAsync = async (orderId, orderItem) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Nie znaleziono zamówienia:', orderId);
      return;
    }

    const user = await User.findById(order.user);
    const locale = user?.locale || 'pl';
    i18n.setLocale(locale);

    const generatedContent = await generateSocialMediaPost(orderItem);
    const itemIndex = order.items.findIndex(
      (item) => item._id.toString() === orderItem._id.toString()
    );
    if (itemIndex !== -1) {
      order.items[itemIndex].content = generatedContent;
      order.items[itemIndex].status = 'zakończone';
      await order.save();
    }

    // Sprawdź, czy wszystkie elementy zamówienia są zakończone
    const allItemsCompleted = order.items.every(
      (item) => item.status === 'zakończone'
    );
    if (allItemsCompleted) {
      order.status = 'zakończone';
      await order.save();

      if (user && user.email) {
        await sendEmail({
          email: user.email,
          subject: i18n.__('orders.completion.subject', {
            orderNumber: order.orderNumber,
          }),
          message: i18n.__('orders.completion.message', {
            orderNumber: order.orderNumber,
          }),
        });
      }
    }
  } catch (error) {
    console.error('Błąd podczas generowania postu social media:', error);
  }
};

exports.updateActualDeliveryDate = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { actualDeliveryDate } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        actualDeliveryDate: new Date(actualDeliveryDate),
        status: 'zakończone',
      },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Błąd podczas aktualizacji daty dostarczenia:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd serwera',
      error: error.message,
    });
  }
};

exports.payForOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { amount, currency = 'PLN' } = req.body;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Użytkownik nie znaleziony' });
    }

    // Ustal dostępne metody płatności w zależności od waluty
    const paymentMethods =
      currency.toUpperCase() === 'PLN'
        ? ['blik', 'card', 'paypal']
        : ['card', 'paypal'];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,

      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name:
                currency === 'PLN' ? 'Opłata za zamówienie' : 'Order Payment',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?order_canceled=true`,
      customer_email: user.email,
      locale: 'pl',
      metadata: {
        userId: user._id.toString(),
        orderId: order._id.toString(),
        userToken: req.headers.authorization.split(' ')[1],
        type: 'order_payment',
        currency: currency,
      },
    });

    res.status(200).json({
      success: true,
      paymentUrl: session.url,
    });
  } catch (error) {
    console.error('Błąd podczas tworzenia sesji płatności:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas przetwarzania płatności',
      error: error.message,
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    const unreadNotifications = await Notification.find({
      user: req.user.id,
      isRead: false,
    }).distinct('order');

    const ordersWithNotificationInfo = orders.map((order) => ({
      ...order.toObject(),
      orderNumber: order.orderNumber,
      hasUnreadNotifications: unreadNotifications.some((id) =>
        id.equals(order._id)
      ),
      userAttachments: order.userAttachments,
    }));

    res.json({ success: true, data: ordersWithNotificationInfo });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania zamówień',
      error: error.message,
    });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    // Sprawdź nieprzeczytane powiadomienia
    const unreadNotificationsExist = await Notification.exists({
      order: orderId,
      user: userId,
      isRead: false,
    });

    // Przekształć itemy, aby zawierały progress
    const itemsWithProgress = order.items.map((item) => ({
      ...item.toObject(),
      progress: item.progress || 0,
      startTime: item.startTime || null,
      estimatedCompletionTime: item.estimatedCompletionTime || null,
    }));

    // Przygotuj obiekt zamówienia z dodatkowymi informacjami
    const orderWithNotificationInfo = {
      ...order.toObject(),
      items: itemsWithProgress, // Podmień itemy na wersję z progress
      hasUnreadNotifications: !!unreadNotificationsExist,
      content: order.items[0].content,
    };

    res.json({ success: true, data: orderWithNotificationInfo });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania szczegółów zamówienia',
      error: error.message,
    });
  }
};

exports.getOrderInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId || orderId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Brak lub nieprawidłowy identyfikator zamówienia',
      });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user.id });

    if (!order) {
      console.log('Zamówienie nie znalezione');
      return res
        .status(404)
        .json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    const invoice = await Invoice.findOne({ order: orderId });
    if (!invoice) {
      console.log('Faktura nie znaleziona');
      return res
        .status(404)
        .json({ success: false, message: 'Faktura nie znaleziona' });
    }

    if (order.paymentStatus !== 'paid') {
      console.log('Zamówienie nie zostało opłacone');
      return res
        .status(400)
        .json({ success: false, message: 'Zamówienie nie zostało opłacone' });
    }

    if (!invoice.pdfUrl) {
      // Jeśli nie mamy zapisanego URL PDF, pobieramy go ze Stripe
      const stripeInvoice = await stripe.invoices.retrieve(
        invoice.stripeInvoiceId
      );
      invoice.pdfUrl = stripeInvoice.invoice_pdf;
      await invoice.save();
    }

    res.json({
      success: true,
      invoiceUrl: invoice.pdfUrl,
    });
  } catch (error) {
    console.error('Błąd podczas pobierania linku do faktury:', error);
    res
      .status(500)
      .json({ success: false, message: 'Błąd serwera', error: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ order: req.params.id }).populate(
      'order'
    );
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Faktura nie znaleziona' });
    }

    // Tutaj możesz dodać logikę generowania PDF z faktury
    // Dla przykładu zwracamy dane faktury
    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Błąd podczas pobierania faktury:', error);
    res
      .status(500)
      .json({ success: false, message: 'Błąd serwera', error: error.message });
  }
};

exports.resumePayment = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'To zamówienie nie oczekuje na płatność',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Użytkownik nie znaleziony' });
    }

    // Tworzenie nowej sesji Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'paypal'],
      customer: user.stripeCustomerId,
      client_reference_id: order._id.toString(),
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: 'Zamówienie treści',
            },
            unit_amount: Math.round(order.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/orders?canceled=true`,
      metadata: {
        orderId: order._id.toString(),
        userToken: req.headers.authorization.split(' ')[1],
      },
    });

    res.status(200).json({
      success: true,
      message: 'Nowa sesja płatności utworzona',
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error) {
    console.error('Błąd podczas wznawiania płatności:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas wznawiania płatności',
      error: error.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Można usunąć tylko zamówienia oczekujące na płatność',
      });
    }

    await Order.deleteOne({ _id: req.params.id });

    res
      .status(200)
      .json({ success: true, message: 'Zamówienie zostało usunięte' });
  } catch (error) {
    console.error('Błąd podczas usuwania zamówienia:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas usuwania zamówienia',
    });
  }
};

exports.getLatestOrder = async (req, res) => {
  try {
    const latestOrder = await Order.findOne({ user: req.user.id }).sort(
      '-createdAt'
    );
    if (!latestOrder) {
      return res
        .status(404)
        .json({ success: false, message: 'Nie znaleziono żadnych zamówień' });
    }

    const payment = await Payment.findOne({ relatedOrder: latestOrder._id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono płatności dla zamówienia',
      });
    }

    res.json({
      success: true,
      orderId: latestOrder._id,
      totalPrice: latestOrder.totalPrice,
      paidAmount: payment.paidAmount,
      appliedDiscount: latestOrder.appliedDiscount,
      remainingBalance: req.user.accountBalance,
      stripeSessionId: payment.stripeSessionId, // Dodajemy to pole
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Błąd serwera', error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    const comment = new OrderComment({
      order: orderId,
      user: userId,
      content,
      isAdminComment: false,
    });

    if (req.files && req.files.length > 0) {
      comment.attachments = req.files.map((file) => ({
        filename: file.originalname,
        url: file.location,
        uploadDate: new Date(),
      }));
    }

    await comment.save();

    // Notify admin
    //const adminUser = await User.findOne({ role: 'admin' });
    //if (adminUser) {
    // Send email to admin
    //      await sendEmail({
    //email: adminUser.email,
    //subject: `Nowy komentarz do zamówienia #${order.orderNumber}`,
    //message: `Użytkownik dodał nowy komentarz do zamówienia #${order.orderNumber}. Zaloguj się do panelu administracyjnego, aby zobaczyć szczegóły.`,
    //});
    //}

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Błąd podczas dodawania komentarza:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { orderId } = req.params;
    const comments = await OrderComment.find({ order: orderId })
      .sort('createdAt')
      .populate('user', 'name');

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Błąd podczas pobierania komentarzy:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(3)
      .select('items.topic totalPrice status createdAt');

    res.status(200).json({ success: true, data: recentOrders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Nie udało się pobrać ostatnich zamówień',
      error: error.message,
    });
  }
};

exports.getOrderBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' });
    }
    const order = await Order.findById(payment.relatedOrder);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }
    res.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      paidAmount: payment.paidAmount,
      appliedDiscount: order.appliedDiscount,
      items: order.items,
      paymentId: payment._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

const generateSocialMediaPost = async (orderItem) => {
  try {
    const reducedLength = Math.max(orderItem.length - 1000, 100);

    // Mapowanie skrótów języków na pełne nazwy
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

    // Przygotowanie wytycznych z uwzględnieniem tonu
    let enhancedGuidelines = orderItem.guidelines;
    switch (orderItem.tone) {
      case 'nieformalny':
        enhancedGuidelines +=
          "\n\nTon wypowiedzi: Użyj nieformalnego, przyjaznego tonu. Zwracaj się do czytelnika bezpośrednio, używając formy 'Ty'. Stosuj potoczne wyrażenia i lekki humor, gdy to odpowiednie.";
        break;
      case 'oficjalny':
        enhancedGuidelines +=
          "\n\nTon wypowiedzi: Zachowaj formalny, profesjonalny ton. Używaj formy 'Państwo' przy zwracaniu się do czytelnika. Unikaj kolokwializmów i żargonu.";
        break;
      case 'bezosobowy':
        enhancedGuidelines +=
          '\n\nTon wypowiedzi: Użyj bezosobowego stylu, unikając bezpośrednich zwrotów do czytelnika. Skup się na faktach i obiektywnych informacjach.';
        break;
    }

    // Dodanie informacji o słowach kluczowych, jeśli są dostępne
    if (orderItem.keywords && orderItem.keywords.length > 0) {
      enhancedGuidelines += `\n\nSłowa kluczowe do uwzględnienia: ${orderItem.keywords.join(', ')}`;
    }

    // Dodanie informacji o FAQ i tabeli, jeśli są wymagane
    if (orderItem.includeFAQ) {
      enhancedGuidelines +=
        '\n\nUwzględnij w poście krótką sekcję FAQ (1-2 pytania i odpowiedzi).';
    }
    if (orderItem.includeTable) {
      enhancedGuidelines +=
        '\n\nJeśli to możliwe, przedstaw część informacji w formie krótkiej, przejrzystej tabeli.';
    }

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Napisz post do social media zgodnie z poniższymi wytycznymi. Użyj kilku odpowiednio dobranych emotikon. Post powinien mieć długość około ${reducedLength} znaków i być napisany w języku ${languageMap[orderItem.language] || orderItem.language}. CAŁY POST ZAPISZ JAKO KOD HTML!!!!

Wytyczne:
${enhancedGuidelines}

Post:`,
        },
      ],
    });

    return msg.content[0].text.trim();
  } catch (error) {
    console.error('Błąd podczas generowania posta do social media:', error);
    throw error;
  }
};

exports.getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Zamówienie nie znalezione' });
    }
    res.json({
      success: true,
      status: order.status,
      items: order.items.map((item) => ({
        _id: item._id,
        status: item.status,
        topic: item.topic,
        contentType: item.contentType,
        length: item.length,
      })),
    });
  } catch (error) {
    console.error('Błąd podczas pobierania statusu zamówienia:', error);
    res.status(500).json({ success: false, message: 'Wystąpił błąd serwera' });
  }
};

exports.updateOrderContent = async (req, res) => {
  try {
    const { orderId, itemId, content } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Zamówienie nie znalezione',
      });
    }

    // ✅ TUTAJ JEST FIX - dodaj tę linię:
    const item = order.items.find((item) => item._id.toString() === itemId);

    // Sprawdź czy item został znaleziony
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Element zamówienia nie znaleziony',
      });
    }

    const user = await User.findById(order.user);
    const locale = user?.locale || 'pl';
    i18n.setLocale(locale);

    // Teraz możesz bezpiecznie użyć zmiennej 'item'
    item.content = content;
    item.status = 'zakończone';

    const allItemsCompleted = order.items.every(
      (item) => item.status === 'zakończone'
    );
    if (allItemsCompleted) {
      order.status = 'zakończone';
    }
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Treść zamówienia została zaktualizowana',
      order: {
        id: order._id,
        status: order.status,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji treści zamówienia:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd serwera',
    });
  }
};

exports.getActiveOrders = async (req, res) => {
  try {
    // Najpierw pobieramy wszystkie zamówienia
    const orders = await Order.find({
      user: req.user.id,
    }).sort('-createdAt');

    // Następnie filtrujemy itemy w każdym zamówieniu
    const activeOrders = orders
      .map((order) => ({
        ...order.toObject(),
        items: order.items.filter(
          (item) =>
            !item.hiddenByUser && // tylko nieukryte itemy
            (item.status === 'w trakcie' || item.status === 'zakończone')
        ),
      }))
      // Zostawiamy tylko zamówienia, które mają jakieś widoczne itemy
      .filter((order) => order.items.length > 0);

    res.json({ success: true, data: activeOrders });
  } catch (error) {
    console.error('Error in getActiveOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania zamówień',
    });
  }
};

exports.updateOrderProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const { itemId } = req.params;

    const order = await Order.findOne({
      'items._id': itemId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Order item not found',
      });
    }

    item.progress = progress;

    await order.save();

    res.json({
      success: true,
      data: {
        progress: item.progress,
      },
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order progress',
    });
  }
};

exports.hideOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Zamówienie nie znalezione',
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item nie znaleziony',
      });
    }

    item.hiddenByUser = true;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Item ukryty',
    });
  } catch (error) {
    console.error('Błąd podczas ukrywania itemu:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd serwera',
    });
  }
};

// Zapis danych strony tytułowej
exports.updateTitlePageData = async (req, res) => {
  try {
    const { orderId } = req.params;
    const titlePageData = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Zamówienie nie znalezione',
      });
    }

    // Zapisz dane strony tytułowej
    order.titlePageData = titlePageData;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Dane strony tytułowej zostały zapisane',
      data: order.titlePageData,
    });
  } catch (error) {
    console.error('Błąd podczas zapisywania danych strony tytułowej:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd serwera',
    });
  }
};

// Pobieranie danych strony tytułowej
exports.getTitlePageData = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Zamówienie nie znalezione',
      });
    }

    res.status(200).json({
      success: true,
      data: order.titlePageData || null,
    });
  } catch (error) {
    console.error('Błąd podczas pobierania danych strony tytułowej:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd serwera',
    });
  }
};

// backend/src/controllers/orderController.js
exports.getOrderBibliography = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    console.log('\n========== POBIERANIE BIBLIOGRAFII ==========');
    console.log('📦 OrderId:', orderId);
    console.log('📄 ItemId:', itemId);

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      console.log('❌ Zamówienie nie znalezione');
      return res.status(404).json({
        success: false,
        message: 'Zamówienie nie znalezione',
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      console.log('❌ Item nie znaleziony');
      return res.status(404).json({
        success: false,
        message: 'Item nie znaleziony',
      });
    }

    console.log('✅ Item znaleziony');
    console.log('📚 item.bibliography:', item.bibliography);
    console.log(
      '📄 item.bibliographyContent długość:',
      item.bibliographyContent?.length || 0
    );
    console.log(
      '📄 item.bibliographyContent (początek):',
      item.bibliographyContent?.substring(0, 100) || 'BRAK'
    );
    console.log('========================================\n');

    res.status(200).json({
      success: true,
      data: {
        hasBibliography: item.bibliography,
        bibliographyContent: item.bibliographyContent || '',
      },
    });
  } catch (error) {
    console.error('❌ Błąd:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
