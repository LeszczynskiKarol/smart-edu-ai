// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');

// Wszystkie route'y wymagają autoryzacji jako admin
router.use(auth.protect);
router.use(auth.authorize('admin'));

// Zamówienia
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:orderId', adminController.getOrderById);
router.put('/orders/:orderId/status', adminController.updateOrderStatus);
router.post('/orders/:orderId/attach', adminController.attachFileToOrder);
router.delete(
  '/orders/:orderId/attachments/:fileType/:fileIndex',
  adminController.deleteOrderAttachment
);

// Komentarze do zamówień
router.get('/orders/:orderId/comments', adminController.getOrderComments);
router.post('/orders/:orderId/comments', adminController.addOrderComment);

// Statystyki
router.get('/stats', adminController.getAdminStats);

module.exports = router;
