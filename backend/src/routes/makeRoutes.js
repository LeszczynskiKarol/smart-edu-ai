// backend/src/routes/makeRoutes.js
const express = require('express');
const router = express.Router();
const makeController = require('../controllers/makeController');

// Middleware do weryfikacji Make.com webhook (opcjonalne, ale zalecane)
const verifyMakeWebhook = (req, res, next) => {
  const makeSecret = process.env.MAKE_WEBHOOK_SECRET;

  // Jeśli nie ustawiono sekretu, pomijamy weryfikację (tylko development)
  if (!makeSecret) {
    console.warn('⚠️  MAKE_WEBHOOK_SECRET nie jest ustawiony!');
    return next();
  }

  // Sprawdź header autoryzacji
  const authHeader =
    req.headers['x-make-webhook-secret'] || req.headers['authorization'];

  if (!authHeader || authHeader !== makeSecret) {
    console.error('❌ Nieprawidłowy sekret webhook Make.com');
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid webhook secret',
    });
  }

  next();
};

// Endpoint testowy (bez autoryzacji dla łatwego testowania)
router.get('/test', makeController.testConnection);

// Główne endpointy dla Make.com (z weryfikacją)
router.post(
  '/ordered-texts',
  verifyMakeWebhook,
  makeController.receiveOrderedTexts
);
router.post(
  '/generated-texts',
  verifyMakeWebhook,
  makeController.receiveGeneratedText
);

// Endpointy pomocnicze
router.put(
  '/ordered-texts/:id/status',
  verifyMakeWebhook,
  makeController.updateOrderedTextStatus
);
router.get('/ordered-texts', makeController.getOrderedTexts);
router.get('/generated-texts', makeController.getGeneratedTexts);

module.exports = router;
