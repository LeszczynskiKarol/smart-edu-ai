// backend/src/controllers/orderController.js
const https = require('https');
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
      if (item.contentType === 'post_social_media') {
        return new Date(Date.now() + 45 * 1000);
      } else {
        const baseTime = 30 * 1000;
        const additionalTime =
          (Math.max(0, item.length - 100) / 1000) * 30 * 1000;
        return new Date(Date.now() + baseTime + additionalTime);
      }
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
            item.bibliography && item.searchLanguage
              ? item.searchLanguage
              : item.bibliography
                ? mapTextLangToSearchLang(item.language)
                : searchLanguage,
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

      const orderDescription =
        currency === 'PLN'
          ? `Zamówienie za ${preliminaryTotalPrice.toFixed(2)} PLN`
          : `Order payment $${preliminaryTotalPrice.toFixed(2)}`;

      const analyticalSessionId =
        req.body.analyticalSessionId || req.query.analyticalSessionId;

      const session = await stripe.checkout.sessions.create({
        payment_method_types:
          currency === 'PLN' ? ['blik', 'card', 'paypal'] : ['card', 'paypal'],

        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: orderDescription,
                description:
                  locale === 'pl'
                    ? `Płatność za zamówienie w Smart-Edu.ai`
                    : `Pay for order`,
              },
              unit_amount: Math.round(paymentInOriginalCurrency * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard?order_canceled=true`,
        customer_email: user.email,
        locale: 'pl',
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
        await sendDataToMake(order, user);
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

// Funkcja do wysyłania danych do Make.com
const sendDataToMake = async (order, user) => {
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
};

const determineContentTypeAndSearchLanguage = async (
  guidelines,
  userSelectedLanguage
) => {
  try {
    const contentTypeMsg = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Na podstawie poniższych wytycznych usera, określ najbardziej odpowiedni rodzaj treści. Odpowiedz jednym słowem lub frazą, wybierając ją spośród (musisz DOKŁADNIE PRZEPISAĆ TE RODZAJE TREŚCI - bez polskich znaków ani cudzysłowów - trzeba je 100% je odzworować, a więc np. "reportaz", a nie reportaż: wypracowanie, praca licencjacka, praca magisterska, esej, referat, rozprawka, charakterystyka, opowiadanie, list, recenzja, przemowienie, reportaz, zaproszenie, streszczenie, interpretacja. Jeśli żadna z tych opcji nie pasuje, możesz zaproponować inny, bardziej odpowiedni rodzaj treści. Przykłaodwo, jeśli pojawiają się wytyczne o wniosku, oferty, zapytania, oficjalnym pismie czy innego rodzaju treści, to ją napisz, np. "wniosek" (oczywiście bez cudzysłowów), zapytanie, reportaż, oferta, przemówienie itd. - wszystko, co nie pasuje do wymienionych rodzajów na początku. Unikaj przyporządkowywania "na siłę" wytycznych do wymienionych na początku rodzajów - jeśli jakieś wytyczyne czy tematy nie pasują do tych początków wymienionych rodzajów, śmiało dopasuj coś spoza tego zbioru. POZA NAZWĄ RODZAJU TREŚCI NIE MASZ PRAWA PISAĆ NIC INNEGO!!!!

Wytyczne usera:
${guidelines}`,
        },
      ],
    });

    const searchLanguageMsg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Na podstawie podanych wytycznych oraz docelowego języka wybranego przez usera określ język wyszukiwania w google search api, wybierając spośród tych wartości: en (angielski), cs (czeski), de (niemiecki), es (hiszpański), pl (polski), uk (ukraiński), pt (portugalski), ru (rosyjski). Najważniejszym kryterium, którym powinieneś się kierować, jest tematyka wytycznyc/zapytania usera: jeśli ma ona charakter ogólny i uznasz, że najlepsze wyniki uda się uzyskać w wyszukiwaniu w angielskim internecie, który jest najbogatszy, napisz: en - to będzie oznaczało wyszikuwanie w języku angielskim, potencjalnie najlepszym dla ogólnych zapytań, które nie wiążą się z danym krajem czy językiem. Jeśli jednak widzisz, że zapytanie ma charakter bardziej lokalny, a więc dotyczy np. prawa, wydarzeń krajowych, przepisów, ubezpieczeń czy innych kwestii, na temat których lepiej szukać informacji w krajowym internecie, napisz odpowiedni skrót spośród wskazanych. BARDZO WAŻNE - Twoja wypowiedzieć NIE MOŻE MIEĆ WIĘCEJ NIŻ 2 litery wpisanego skrótu!!!! POZA SAMYM SKRÓTEM NIE MASZ PRAWO PISAĆ ANI SŁOWA WIĘCEJ!!!!

Wytyczne usera:
${guidelines}

Język wybrany przez użytkownika:
${userSelectedLanguage}`,
        },
      ],
    });

    if (
      !contentTypeMsg.content ||
      !Array.isArray(contentTypeMsg.content) ||
      contentTypeMsg.content.length === 0 ||
      !searchLanguageMsg.content ||
      !Array.isArray(searchLanguageMsg.content) ||
      searchLanguageMsg.content.length === 0
    ) {
      console.error('Nieoczekiwana struktura odpowiedzi API');
      return { contentType: 'artykul', searchLanguage: 'en' };
    }

    const contentType = contentTypeMsg.content[0].text.trim().toLowerCase();
    const searchLanguage = searchLanguageMsg.content[0].text
      .trim()
      .toLowerCase();

    return { contentType, searchLanguage };
  } catch (error) {
    console.error(
      'Błąd podczas określania rodzaju treści i języka wyszukiwania:',
      error
    );
    console.error('Szczegóły błędu:', JSON.stringify(error, null, 2));
    return { contentType: 'artykul', searchLanguage: 'en' };
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
      model: 'claude-3-5-sonnet-20240620',
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

    const user = await User.findById(order.user);
    const locale = user?.locale || 'pl';
    i18n.setLocale(locale);

    item.content = content;
    item.status = 'zakończone';

    const allItemsCompleted = order.items.every(
      (item) => item.status === 'zakończone'
    );

    if (allItemsCompleted) {
      order.status = 'zakończone';
    }

    await order.save();

    // WYSYŁKA EMAILA
    if (user && user.email && item.status === 'zakończone') {
      const emailContent = `
    <h2>${i18n.__('orders.itemCompletion.title')}</h2>
    <p>${i18n.__mf('orders.itemCompletion.greeting', { name: user.name })}</p>
    <p>${i18n.__mf('orders.itemCompletion.mainMessage', { topic: item.topic })}</p>
    <div class="card">
      <p class="card-title">${i18n.__('orders.itemCompletion.detailsTitle')}</p>
      <ul>
        <li><strong>${i18n.__('orders.itemCompletion.orderNumber')}</strong> #${order.orderNumber}</li>
        <li><strong>${i18n.__('orders.itemCompletion.topic')}</strong> ${item.topic}</li>
        <li><strong>${i18n.__('orders.itemCompletion.contentType')}</strong> ${item.contentType}</li>
      </ul>
    </div>
    <p>${i18n.__('orders.itemCompletion.viewMessage')}</p>
    <p style="text-align: center; margin-top: 30px;">
      <a href="${process.env.FRONTEND_URL}/dashboard/orders/${order._id}" class="button">
        ${i18n.__('orders.itemCompletion.buttonText')}
      </a>
    </p>
    <p>${i18n.__('orders.itemCompletion.thanks')}</p>
  `;

      const emailData = {
        title: i18n.__mf('orders.itemCompletion.subject', {
          orderNumber: order.orderNumber,
          topic: item.topic,
        }),
        headerTitle: 'Smart-Edu.ai',
        content: emailContent,
      };

      const emailHtml = generateEmailTemplate(emailData);

      try {
        await sendEmail({
          email: user.email,
          subject: `✅ ${i18n.__mf('orders.itemCompletion.subject', {
            orderNumber: order.orderNumber,
            topic: item.topic,
          })}`,
          message: emailHtml,
          isHtml: true,
        });
      } catch (emailError) {
        console.error('Błąd podczas wysyłania emaila:', emailError);
      }
    }

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
