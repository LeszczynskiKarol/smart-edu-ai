// backend/src/routes/exampleRoutes.js
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');

// WAŻNE: Kolejność ma znaczenie! Bardziej szczegółowe ścieżki na górze

// Nowy endpoint dla metadata - category/slug
router.get(
  '/thesis-examples/:category/:slug',
  exampleController.getExampleByCategoryAndSlug
);

router.get('/by-category/:category', exampleController.getExamplesByCategory);
router.get('/related', exampleController.getRelatedExamples);
router.get('/search', exampleController.searchExamples);
router.get('/subjects', exampleController.getSubjectsByLevel);

router.get('/', exampleController.getAllExamples);

// Pozostałe endpointy
router.get(
  '/:locale/:level/:workType/:subject/:slug',
  exampleController.getExampleBySlug
);
router.get(
  '/:locale/:level/:workType',
  exampleController.getExamplesByWorkType
);
router.get('/:locale/:level/:subject', exampleController.getExamplesBySubject);
router.get('/:locale/:level', exampleController.getExamplesByLevel);

module.exports = router;
