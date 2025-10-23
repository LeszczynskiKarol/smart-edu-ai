// backend/src/routes/userRoutes.js
const express = require('express');
const {
  register,
  login,
  logout,
  verifyAccount,
  getMe,
  forgotPassword,
  handleGoogleLogin,
  handleTikTokCallback,
  resetPassword,
  updateProfile,
  changePassword,
  updateNotificationPermissions,
  topUpAccount,
  refreshSession,
  getLatestTopUp,
  getUserStats,
  adminLogin,
  markTutorialComplete,
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Publiczne trasy
router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/verify-account', verifyAccount);
router.post('/google-login', handleGoogleLogin);
router.get('/tiktok-callback', handleTikTokCallback);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Chronione trasy
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.put('/update-profile', protect, updateProfile);
router.put(
  '/update-notification-permissions',
  protect,
  updateNotificationPermissions
);
router.get('/refresh-session', protect, refreshSession);
router.post('/top-up', protect, topUpAccount);
router.get('/latest-top-up', protect, getLatestTopUp);
router.get('/stats', protect, getUserStats);
router.post('/logout', protect, logout);
router.put('/tutorial-complete', protect, markTutorialComplete);

module.exports = router;
