// backend/src/routes/exampleRoutes.js
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');

router.get('/by-category/:category', exampleController.getExamplesByCategory);
router.get('/related', exampleController.getRelatedExamples);
router.get('/search', exampleController.searchExamples);
router.get('/subjects', exampleController.getSubjectsByLevel);

router.get('/', exampleController.getAllExamples);

// Najpierw bardziej szczegółowe ścieżki
router.get(
  '/:locale/:level/:workType/:subject/:slug',
  exampleController.getExampleBySlug
);

// Potem ścieżki dla subject i workType
router.get(
  '/:locale/:level/:workType',
  exampleController.getExamplesByWorkType
);
router.get('/:locale/:level/:subject', exampleController.getExamplesBySubject);

// Na końcu najogólniejsza ścieżka
router.get('/:locale/:level', exampleController.getExamplesByLevel);

module.exports = router;
