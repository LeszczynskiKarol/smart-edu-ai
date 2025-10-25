// backend/src/routes/paperRoutes.js
const express = require('express');
const router = express.Router();
const { getPaper } = require('../controllers/paperController');

router.get('/student-writer-report-generator', getPaper);
router.get('/bachelors-thesis', getPaper);
router.get('/masters-thesis', getPaper);

module.exports = router;
