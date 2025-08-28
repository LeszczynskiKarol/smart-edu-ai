// backend/src/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  generatePDF,
  generateDOCX,
} = require('../controllers/documentController');
const { parseHTML } = require('../utils/htmlParser');

router.post('/generate-pdf', protect, generatePDF);
router.post('/parse-html', protect, (req, res) => {
  const { html } = req.body;
  const parsedHTML = parseHTML(html);
  res.json(parsedHTML);
});
router.post('/generate-docx', protect, generateDOCX);

module.exports = router;
