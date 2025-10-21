// backend/src/controllers/makeController.js
const OrderedText = require('../models/OrderedText');
const GeneratedText = require('../models/GeneratedText');
const Order = require('../models/Order');
const User = require('../models/User');

// Mapowanie języków z skrótów na pełne nazwy
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

/**
 * Endpoint do odbierania danych z Make.com - zamówione teksty
 * POST /api/make/ordered-texts
 */
exports.receiveOrderedTexts = async (req, res) => {
  try {
    console.log(
      '📥 Otrzymano dane z Make.com:',
      JSON.stringify(req.body, null, 2)
    );

    const data = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];
    const errors = [];

    for (const item of data) {
      try {
        // Walidacja wymaganych pól
        if (!item.IDzamowienia || !item.ItemID || !item.email) {
          errors.push({
            itemId: item.ItemID || 'unknown',
            error: 'Brak wymaganych pól: IDzamowienia, ItemID lub email',
          });
          continue;
        }

        // Sprawdź czy użytkownik istnieje
        const user = await User.findOne({ email: item.email });

        // Tworzenie dokumentu OrderedText
        const orderedText = new OrderedText({
          temat: item.Temat || '',
          idZamowienia: item.IDzamowienia,
          itemId: item.ItemID,
          cena: parseFloat(item.cena) || 0,
          cenaZamowienia: parseFloat(item.cenaZamowienia) || 0,
          rodzajTresci: item['Rodzaj treści'] || item.RodzajTresci || 'artykul',
          dlugoscTekstu:
            parseInt(item['Długość tekstu']) ||
            parseInt(item.DlugoscTekstu) ||
            0,
          liczbaZnakow:
            parseInt(item['Liczba znaków']) || parseInt(item.LiczbaZnakow) || 0,
          wytyczneIndywidualne:
            item['wytyczne indywidualne'] || item.wytyczne || '',
          tonIStyl: item['Ton i styl'] || item.tone || 'nieformalny',
          jezyk: item['Język'] || item.JezykTekstu || 'polski',
          jezykWyszukiwania:
            item['Język wyszukiwania'] || item.JezykWyszukiwania || 'pl',
          countryCode: item.countryCode || 'polski',
          model: item.Model || 'Claude 2.0',
          bibliografia:
            item.Bibliografia === 'true' || item.Bibliografia === true || false,
          faq: item.FAQ === 'true' || item.FAQ === true || false,
          tabele: item.Tabele === 'true' || item.Tabele === true || false,
          boldowanie:
            item.Boldowanie === 'true' || item.Boldowanie === true || false,
          listyWypunktowane:
            item['Listy wypunktowane'] === 'true' ||
            item['Listy wypunktowane'] === true ||
            true,
          frazy: item.Frazy || '',
          link1: item.link1 || '',
          link2: item.link2 || '',
          link3: item.link3 || '',
          link4: item.link4 || '',
          status: item.Status || 'Oczekujące',
          startDate:
            item['Start date'] || item.StartDate
              ? new Date(item['Start date'] || item.StartDate)
              : new Date(),
          email: item.email,
          userId: user ? user._id : null,
          ileTekstow: parseInt(item.ileTekstow) || 1,
          lacznaLiczbaZnakow: parseInt(item.lacznaLiczbaZnakow) || 0,
          idTekstu: parseInt(item.IDtekstu) || null,
        });

        // Próba znalezienia oryginalnego zamówienia w Order
        const originalOrder = await Order.findById(item.IDzamowienia);
        if (originalOrder) {
          orderedText.originalOrderId = originalOrder._id;
          const orderItem = originalOrder.items.id(item.ItemID);
          if (orderItem) {
            orderedText.originalItemId = orderItem._id;
          }
        }

        await orderedText.save();

        results.push({
          success: true,
          itemId: item.ItemID,
          orderedTextId: orderedText._id,
          message: 'Tekst zapisany pomyślnie',
        });

        console.log(`✅ Zapisano OrderedText: ${orderedText._id}`);
      } catch (itemError) {
        console.error(`❌ Błąd przetwarzania itemu ${item.ItemID}:`, itemError);
        errors.push({
          itemId: item.ItemID || 'unknown',
          error: itemError.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Dane przetworzone',
      processed: results.length,
      errors: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ Błąd globalny w receiveOrderedTexts:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd serwera podczas przetwarzania danych',
      error: error.message,
    });
  }
};

/**
 * Endpoint do odbierania wygenerowanych tekstów z Make.com
 * POST /api/make/generated-texts
 */
exports.receiveGeneratedText = async (req, res) => {
  try {
    console.log('📥 Otrzymano wygenerowany tekst z Make.com');

    const {
      idZamowienia,
      itemId,
      content,
      status = 'Zakończone',
      errorMessage,
    } = req.body;

    // Walidacja
    if (!idZamowienia || !itemId || (!content && status !== 'Błąd')) {
      return res.status(400).json({
        success: false,
        message: 'Brak wymaganych pól: idZamowienia, itemId lub content',
      });
    }

    // Znajdź odpowiedni OrderedText
    const orderedText = await OrderedText.findOne({
      idZamowienia,
      itemId,
    });

    if (!orderedText) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono zamówionego tekstu',
      });
    }

    // Tworzenie GeneratedText
    const generatedText = new GeneratedText({
      orderedTextId: orderedText._id,
      idZamowienia,
      itemId,
      content: content || '',
      temat: orderedText.temat,
      rodzajTresci: orderedText.rodzajTresci,
      dlugoscTekstu: orderedText.dlugoscTekstu,
      jezyk: orderedText.jezyk,
      email: orderedText.email,
      userId: orderedText.userId,
      model: orderedText.model,
      status,
      errorMessage,
      completionDate: status === 'Zakończone' ? new Date() : null,
    });

    await generatedText.save();

    // Aktualizuj status w OrderedText
    orderedText.status = status === 'Błąd' ? 'Anulowane' : 'Zakończone';
    await orderedText.save();

    // Aktualizuj również w oryginalnym Order, jeśli istnieje
    if (orderedText.originalOrderId && orderedText.originalItemId) {
      const order = await Order.findById(orderedText.originalOrderId);
      if (order) {
        const orderItem = order.items.id(orderedText.originalItemId);
        if (orderItem) {
          orderItem.content = content;
          orderItem.status = status === 'Błąd' ? 'oczekujące' : 'zakończone';

          // Sprawdź czy wszystkie itemy są zakończone
          const allCompleted = order.items.every(
            (item) => item.status === 'zakończone'
          );
          if (allCompleted) {
            order.status = 'zakończone';
          }

          await order.save();
          console.log(`✅ Zaktualizowano Order ${order._id}`);
        }
      }
    }

    // Oznacz jako dostarczony
    generatedText.delivered = true;
    generatedText.deliveredAt = new Date();
    await generatedText.save();

    console.log(`✅ Zapisano GeneratedText: ${generatedText._id}`);

    res.status(200).json({
      success: true,
      message: 'Wygenerowany tekst zapisany pomyślnie',
      generatedTextId: generatedText._id,
    });
  } catch (error) {
    console.error('❌ Błąd w receiveGeneratedText:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd serwera podczas zapisywania wygenerowanego tekstu',
      error: error.message,
    });
  }
};

/**
 * Endpoint do aktualizacji statusu tekstu
 * PUT /api/make/ordered-texts/:id/status
 */
exports.updateOrderedTextStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderedText = await OrderedText.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!orderedText) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono tekstu',
      });
    }

    res.status(200).json({
      success: true,
      data: orderedText,
    });
  } catch (error) {
    console.error('Błąd w updateOrderedTextStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd serwera',
      error: error.message,
    });
  }
};

/**
 * Endpoint do pobierania zamówionych tekstów
 * GET /api/make/ordered-texts
 */
exports.getOrderedTexts = async (req, res) => {
  try {
    const { status, email, idZamowienia, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (email) query.email = email;
    if (idZamowienia) query.idZamowienia = idZamowienia;

    const orderedTexts = await OrderedText.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email');

    const total = await OrderedText.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orderedTexts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Błąd w getOrderedTexts:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd serwera',
      error: error.message,
    });
  }
};

/**
 * Endpoint do pobierania wygenerowanych tekstów
 * GET /api/make/generated-texts
 */
exports.getGeneratedTexts = async (req, res) => {
  try {
    const { status, email, idZamowienia, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (email) query.email = email;
    if (idZamowienia) query.idZamowienia = idZamowienia;

    const generatedTexts = await GeneratedText.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email')
      .populate('orderedTextId');

    const total = await GeneratedText.countDocuments(query);

    res.status(200).json({
      success: true,
      data: generatedTexts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Błąd w getGeneratedTexts:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd serwera',
      error: error.message,
    });
  }
};

/**
 * Webhook do testowania połączenia
 * GET /api/make/test
 */
exports.testConnection = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Połączenie z API działa poprawnie',
    timestamp: new Date(),
  });
};

module.exports = exports;
