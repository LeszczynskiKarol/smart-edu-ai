// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const auth = require('../middlewares/auth');

router.use(auth.protect);
router.use(auth.authorize('admin'));

// Zamówienia
router.get('/orders', adminOrderController.getAllOrders);
router.get('/orders/:orderId', adminOrderController.getOrderById);
router.put('/orders/:orderId/status', adminOrderController.updateOrderStatus);
router.delete('/orders/:orderId', adminOrderController.deleteOrder);
router.post('/orders/:orderId/attach', adminOrderController.attachFileToOrder);
router.delete(
  '/orders/:orderId/attachments/:fileType/:fileIndex',
  adminOrderController.deleteOrderAttachment
);

// Treść itemów
router.put(
  '/orders/:orderId/items/:itemId/content',
  adminOrderController.updateItemContent
);

// Statystyki
router.get('/stats', adminOrderController.getAdminStats);

module.exports = router;
