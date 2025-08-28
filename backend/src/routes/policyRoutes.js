// backend/src/routes/policyRoutes.js
const express = require('express');
const router = express.Router();
const { getPrivacyPolicy } = require('../controllers/policyController');

router.get('/privacy-policy', getPrivacyPolicy);

module.exports = router;
