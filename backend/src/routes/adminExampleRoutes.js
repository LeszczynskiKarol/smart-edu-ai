// backend/src/routes/adminExampleRoutes.js
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(exampleController.getAllExamples)
  .post(exampleController.createExample);

router
  .route('/:id')
  .get(exampleController.getExampleById)
  .put(exampleController.updateExample)
  .delete(exampleController.deleteExample);

module.exports = router;
