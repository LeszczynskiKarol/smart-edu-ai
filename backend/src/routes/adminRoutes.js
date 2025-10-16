// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const adminUserController = require('../controllers/adminUserController'); // NOWY
const auth = require('../middlewares/auth');

router.use(auth.protect);
router.use(auth.authorize('admin'));

// ==================== ZAMÓWIENIA ====================
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

// ==================== UŻYTKOWNICY ====================
router.get('/users', adminUserController.getAllUsers);
router.get('/users/:id', adminUserController.getUserById);
router.put('/users/:id', adminUserController.updateUser);
router.delete('/users/:id', adminUserController.deleteUser);
router.post('/users/:id/balance', adminUserController.adjustUserBalance);
router.post('/users/:id/reset-password', adminUserController.resetUserPassword);
router.get('/users/:id/orders', adminUserController.getUserOrders);

// ==================== STATYSTYKI ====================
router.get('/stats', adminOrderController.getAdminStats);

module.exports = router;
