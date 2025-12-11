// backend/src/routes/abandonedCartRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getAbandonedOrder,
  applyAbandonedCartDiscount,
  dismissAbandonedOrder,
} = require('../controllers/abandonedCartController');

// Wszystkie endpointy wymagają autoryzacji
router.use(protect);

// GET /api/abandoned-cart/check - sprawdź czy jest porzucone zamówienie
router.get('/check', getAbandonedOrder);

// POST /api/abandoned-cart/apply - zastosuj rabat i utwórz płatność
router.post('/apply', applyAbandonedCartDiscount);

// POST /api/abandoned-cart/dismiss - odrzuć ofertę (usuń zamówienie)
router.post('/dismiss', dismissAbandonedOrder);

module.exports = router;
