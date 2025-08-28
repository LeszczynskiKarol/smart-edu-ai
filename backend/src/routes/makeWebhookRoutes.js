// backend/src/routes/makeWebhookRoutes.js
const express = require('express');
const router = express.Router();
const { handleImportPost } = require('../controllers/makeWebhookController');

router.post('/import-post', handleImportPost);

// Dodaj endpoint testowy
router.get('/import-post', (req, res) => {
  res.json({
    message: 'Endpoint is working',
    method: 'GET',
  });
});

module.exports = router;
