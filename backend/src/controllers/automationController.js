// backend/src/controllers/automationController.js
const OrderedText = require('../models/OrderedText');
const GeneratedText = require('../models/GeneratedText');
const Order = require('../models/Order');
const mongoose = require('mongoose');

/**
 * Pobierz statystyki automation flow
 * GET /api/admin/automation/stats
 */
exports.getAutomationStats = async (req, res) => {
  try {
    // Statystyki OrderedTexts
    const orderedTextsStats = await OrderedText.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // Statystyki GeneratedTexts
    const generatedTextsStats = await GeneratedText.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          delivered: [{ $match: { delivered: true } }, { $count: 'count' }],
          errors: [{ $match: { status: 'Błąd' } }, { $count: 'count' }],
          pending: [
            { $match: { delivered: false, status: { $ne: 'Błąd' } } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    // Ostatnia aktywność (20 najnowszych)
    const recentOrdered = await OrderedText.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('idZamowienia itemId status createdAt email')
      .lean();

    const recentGenerated = await GeneratedText.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('idZamowienia itemId status createdAt email')
      .lean();

    // Połącz i posortuj aktywność
    const recentActivity = [
      ...recentOrdered.map((item) => ({ ...item, type: 'ordered' })),
      ...recentGenerated.map((item) => ({ ...item, type: 'generated' })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    // System health check
    const mongoConnected = mongoose.connection.readyState === 1;
    const lastOrderedText = await OrderedText.findOne().sort({ createdAt: -1 });
    const makeConnected = lastOrderedText
      ? Date.now() - new Date(lastOrderedText.createdAt).getTime() < 3600000
      : false; // Make connection OK jeśli było zamówienie w ciągu ostatniej godziny

    // Przygotuj odpowiedź
    const orderedByStatus = {};
    orderedTextsStats[0].byStatus.forEach((item) => {
      orderedByStatus[item._id] = item.count;
    });

    const response = {
      orderedTexts: {
        total: orderedTextsStats[0].total[0]?.count || 0,
        pending: orderedByStatus['Oczekujące'] || 0,
        inProgress: orderedByStatus['W trakcie'] || 0,
        completed: orderedByStatus['Zakończone'] || 0,
        cancelled: orderedByStatus['Anulowane'] || 0,
      },
      generatedTexts: {
        total: generatedTextsStats[0].total[0]?.count || 0,
        delivered: generatedTextsStats[0].delivered[0]?.count || 0,
        pending: generatedTextsStats[0].pending[0]?.count || 0,
        errors: generatedTextsStats[0].errors[0]?.count || 0,
      },
      recentActivity,
      systemHealth: {
        makeConnection: makeConnected,
        mongoConnection: mongoConnected,
        lastSync: lastOrderedText?.createdAt || new Date(),
      },
    };

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching automation stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania statystyk',
      error: error.message,
    });
  }
};

/**
 * Pobierz listę zamówionych tekstów
 * GET /api/admin/automation/ordered-texts
 */
exports.getOrderedTexts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      email,
      idZamowienia,
      search,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (email) query.email = email;
    if (idZamowienia) query.idZamowienia = idZamowienia;
    if (search) {
      query.$or = [
        { temat: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { idZamowienia: { $regex: search, $options: 'i' } },
      ];
    }

    const orderedTexts = await OrderedText.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email')
      .lean();

    const total = await OrderedText.countDocuments(query);

    return res.status(200).json({
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
    console.error('Error fetching ordered texts:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania zamówionych tekstów',
      error: error.message,
    });
  }
};

/**
 * Pobierz listę wygenerowanych tekstów
 * GET /api/admin/automation/generated-texts
 */
exports.getGeneratedTexts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      email,
      idZamowienia,
      delivered,
      search,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (email) query.email = email;
    if (idZamowienia) query.idZamowienia = idZamowienia;
    if (delivered !== undefined) query.delivered = delivered === 'true';
    if (search) {
      query.$or = [
        { temat: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { idZamowienia: { $regex: search, $options: 'i' } },
      ];
    }

    const generatedTexts = await GeneratedText.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email')
      .populate('orderedTextId')
      .lean();

    const total = await GeneratedText.countDocuments(query);

    return res.status(200).json({
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
    console.error('Error fetching generated texts:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania wygenerowanych tekstów',
      error: error.message,
    });
  }
};

/**
 * Pobierz szczegóły zamówionego tekstu
 * GET /api/admin/automation/ordered-texts/:id
 */
exports.getOrderedTextById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderedText = await OrderedText.findById(id)
      .populate('userId', 'name email')
      .populate('originalOrderId')
      .lean();

    if (!orderedText) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono zamówionego tekstu',
      });
    }

    // Znajdź powiązany wygenerowany tekst
    const generatedText = await GeneratedText.findOne({
      orderedTextId: id,
    }).lean();

    return res.status(200).json({
      success: true,
      data: {
        orderedText,
        generatedText,
      },
    });
  } catch (error) {
    console.error('Error fetching ordered text:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania szczegółów',
      error: error.message,
    });
  }
};

/**
 * Aktualizuj status zamówionego tekstu
 * PUT /api/admin/automation/ordered-texts/:id/status
 */
exports.updateOrderedTextStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'Oczekujące',
      'W trakcie',
      'Zakończone',
      'Anulowane',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowy status',
      });
    }

    const orderedText = await OrderedText.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!orderedText) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono zamówionego tekstu',
      });
    }

    return res.status(200).json({
      success: true,
      data: orderedText,
      message: 'Status zaktualizowany',
    });
  } catch (error) {
    console.error('Error updating ordered text status:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji statusu',
      error: error.message,
    });
  }
};

/**
 * Usuń zamówiony tekst
 * DELETE /api/admin/automation/ordered-texts/:id
 */
exports.deleteOrderedText = async (req, res) => {
  try {
    const { id } = req.params;

    const orderedText = await OrderedText.findByIdAndDelete(id);

    if (!orderedText) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono zamówionego tekstu',
      });
    }

    // Usuń również powiązany wygenerowany tekst
    await GeneratedText.deleteMany({ orderedTextId: id });

    return res.status(200).json({
      success: true,
      message: 'Zamówiony tekst usunięty',
    });
  } catch (error) {
    console.error('Error deleting ordered text:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania',
      error: error.message,
    });
  }
};

/**
 * Pobierz logi systemowe
 * GET /api/admin/automation/logs
 */
exports.getSystemLogs = async (req, res) => {
  try {
    const { limit = 100, type, level } = req.query;

    // TO DO: Implementacja systemu logowania
    // Na razie zwracamy ostatnie aktywności jako logi

    const query = {};
    if (type) query.type = type;

    const logs = [
      ...(await OrderedText.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) / 2)
        .select('createdAt status idZamowienia email')
        .lean()
        .then((items) =>
          items.map((item) => ({
            timestamp: item.createdAt,
            level: 'info',
            type: 'ordered_text',
            message: `Nowe zamówienie: ${item.idZamowienia}`,
            data: item,
          }))
        )),
      ...(await GeneratedText.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) / 2)
        .select('createdAt status idZamowienia email')
        .lean()
        .then((items) =>
          items.map((item) => ({
            timestamp: item.createdAt,
            level: item.status === 'Błąd' ? 'error' : 'success',
            type: 'generated_text',
            message: `Wygenerowano tekst: ${item.idZamowienia}`,
            data: item,
          }))
        )),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({
      success: true,
      data: logs.slice(0, parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania logów',
      error: error.message,
    });
  }
};

/**
 * Test połączenia z Make.com
 * POST /api/admin/automation/test-connection
 */
exports.testMakeConnection = async (req, res) => {
  try {
    // Sprawdź czy są jakieś zamówienia w ostatnich 24h
    const recentOrders = await OrderedText.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const mongoConnected = mongoose.connection.readyState === 1;

    return res.status(200).json({
      success: true,
      data: {
        mongoConnection: mongoConnected,
        makeConnection: recentOrders > 0,
        recentOrdersLast24h: recentOrders,
        timestamp: new Date(),
      },
      message: 'Test połączenia zakończony',
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas testowania połączenia',
      error: error.message,
    });
  }
};

module.exports = exports;
