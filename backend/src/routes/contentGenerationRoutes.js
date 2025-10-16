// backend/src/routes/contentGenerationRoutes.js
const express = require('express');
const router = express.Router();
const contentGenerationController = require('../controllers/contentGenerationController');
const auth = require('../middlewares/auth');

router.post(
  '/generate',
  auth.protect,
  contentGenerationController.generateThesisContent
);

router.get(
  '/logs',
  auth.protect,
  auth.authorize('admin'),
  contentGenerationController.getGenerationLogs
);

router.get(
  '/logs/:logId',
  auth.protect,
  auth.authorize('admin'),
  contentGenerationController.getGenerationLog
);

module.exports = router;
