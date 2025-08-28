// backend/src/routes/workTypeRoutes.js
const express = require('express');
const router = express.Router();
const workTypeController = require('../controllers/workTypeController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', workTypeController.getAllWorkTypes);
router.post(
  '/',
  protect,
  authorize('admin'),
  workTypeController.createWorkType
);
router.get('/:slug', workTypeController.getWorkTypeBySlug);

module.exports = router;
