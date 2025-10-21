// backend/src/routes/automationRoutes.js
const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');
const auth = require('../middlewares/auth');

// Wszystkie endpointy wymagają autoryzacji admina
router.use(auth.protect);
router.use(auth.authorize('admin'));

// ==================== STATYSTYKI ====================
router.get('/stats', automationController.getAutomationStats);
router.get('/logs', automationController.getSystemLogs);
router.post('/test-connection', automationController.testMakeConnection);

// ==================== ORDERED TEXTS ====================
router.get('/ordered-texts', automationController.getOrderedTexts);
router.get('/ordered-texts/:id', automationController.getOrderedTextById);
router.put(
  '/ordered-texts/:id/status',
  automationController.updateOrderedTextStatus
);
router.delete('/ordered-texts/:id', automationController.deleteOrderedText);

// ==================== GENERATED TEXTS ====================
router.get('/generated-texts', automationController.getGeneratedTexts);

module.exports = router;
