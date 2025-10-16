// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const auth = require('../middlewares/auth');

// Wszystkie route'y wymagają autoryzacji jako admin
router.use(auth.protect);
router.use(auth.authorize('admin'));

// Zamówienia
router.get('/orders', adminOrderController.getAllOrders);
router.delete('/orders/:orderId', adminOrderController.deleteOrder);
router.get('/orders/:orderId', adminOrderController.getOrderById);
router.put('/orders/:orderId/status', adminOrderController.updateOrderStatus);
router.post('/orders/:orderId/attach', adminOrderController.attachFileToOrder);
router.delete(
  '/orders/:orderId/attachments/:fileType/:fileIndex',
  adminOrderController.deleteOrderAttachment
);

// Komentarze do zamówień
router.get('/orders/:orderId/comments', adminOrderController.getOrderComments);
router.post('/orders/:orderId/comments', adminOrderController.addOrderComment);

// Statystyki
router.get('/stats', adminOrderController.getAdminStats);

module.exports = router;
