// backend/src/routes/termsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPrivacyPolicy,
  getTermsOfService,
} = require('../controllers/termsController');

// Publiczne trasy dla dokumentów
router.get('/privacy-policy', getPrivacyPolicy);
router.get('/terms-of-service', getTermsOfService);

module.exports = router;
