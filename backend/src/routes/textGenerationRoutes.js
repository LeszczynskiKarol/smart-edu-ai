// backend/src/routes/textGenerationRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminProtect } = require('../middlewares/auth');
const textGenerationController = require('../controllers/textGenerationController');

router.post(
  '/start',
  protect,
  adminProtect,
  textGenerationController.startTextGeneration
);
router.post(
  '/batch-start',
  protect,
  adminProtect,
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
  adminProtect,
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
