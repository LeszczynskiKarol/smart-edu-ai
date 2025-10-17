// backend/src/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const {
  generatePDF,
  generateDOCX,
} = require('../controllers/documentController');
const { parseHTML } = require('../utils/htmlParser');

// ✅ PUBLICZNE - bez protect middleware!
router.post('/generate-pdf', generatePDF);
router.post('/generate-docx', generateDOCX);

// ✅ To też może być publiczne, jeśli chcesz
router.post('/parse-html', (req, res) => {
  const { html } = req.body;
  const parsedHTML = parseHTML(html);
  res.json(parsedHTML);
});

module.exports = router;
