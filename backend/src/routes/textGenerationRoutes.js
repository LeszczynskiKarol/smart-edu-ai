// backend/src/routes/textGenerationRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware'); // ZMIENIONE
const textGenerationController = require('../controllers/textGenerationController');

router.post(
  '/start',
  protect,
  isAdmin, // ZMIENIONE z adminProtect na isAdmin
  textGenerationController.startTextGeneration
);
router.post(
  '/batch-start',
  protect,
  isAdmin, // ZMIENIONE z adminProtect na isAdmin
  textGenerationController.batchStartTextGeneration
);
router.get(
  '/search-results/:orderedTextId',
  protect,
  textGenerationController.getSearchResults
);
router.get(
  '/search-results',
  protect,
  isAdmin, // ZMIENIONE z adminProtect na isAdmin
  textGenerationController.getAllSearchResults
);
router.get(
  '/scraped-content/:orderedTextId',
  protect,
  textGenerationController.getScrapedContent
);
router.get(
  '/processing-status/:orderedTextId',
  protect,
  textGenerationController.getProcessingStatus
);

module.exports = router;
