// backend/src/routes/thesisExampleRoutes.js
const express = require('express');
const router = express.Router();
const thesisExampleController = require('../controllers/thesisExampleController');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ NAJPIERW trasy z /admin (bardziej specyficzne)
router.get(
  '/admin/all',
  authMiddleware.isAdmin,
  thesisExampleController.getAllExamples
);
router.get(
  '/admin/:id',
  authMiddleware.isAdmin,
  thesisExampleController.getExampleById
);
router.post(
  '/admin',
  authMiddleware.isAdmin,
  thesisExampleController.createExample
);
router.put(
  '/admin/:id',
  authMiddleware.isAdmin,
  thesisExampleController.updateExample
);
router.delete(
  '/admin/:id',
  authMiddleware.isAdmin,
  thesisExampleController.deleteExample
);

// ✅ POTEM publiczne trasy (mniej specyficzne)
router.get('/search', thesisExampleController.searchExamples);
router.get('/related', thesisExampleController.getRelatedExamples);

// ✅ NA KOŃCU trasy z parametrami (najbardziej ogólne)
router.get('/:category', thesisExampleController.getExamplesByCategory);
router.get('/:category/:slug', thesisExampleController.getExampleBySlug);

module.exports = router;
