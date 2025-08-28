// backend/src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middlewares/auth');
const analyticsController = require('../controllers/analyticsController');
router.post('/track', optionalProtect, analyticsController.trackActivity);
module.exports = router;
