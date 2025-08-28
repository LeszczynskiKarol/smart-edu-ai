// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const { protect, authorize } = require('../middlewares/auth');
const analyticsController = require('../controllers/analyticsController');
const userController = require('../controllers/userController');
const workTypePageController = require('../controllers/workTypePageController');

// Helper dla mock endpointów
const mockResponse = (req, res) =>
  res.status(200).json({ message: 'Mock endpoint' });

// Publiczny endpoint logowania
router.post('/login', userController.adminLogin);

// Middleware sprawdzający uprawnienia admina
router.use(protect, authorize('admin'));

router
  .route('/work-type-pages')
  .get(workTypePageController.getAllPages)
  .post(workTypePageController.createPage);

router
  .route('/work-type-pages/:id')
  .get(workTypePageController.getPageById)
  .put(workTypePageController.updatePage)
  .delete(workTypePageController.deletePage);

// Examples Routes
router
  .route('/examples')
  .get(exampleController.getAllExamples)
  .post(exampleController.createExample);

router
  .route('/examples/:id')
  .get(exampleController.getExampleById)
  .put(exampleController.updateExample)
  .delete(exampleController.deleteExample);

// Analytics Routes
router.get(
  '/analytics/dashboard-metrics',
  analyticsController.getDashboardMetrics
);
router.get('/analytics/events', analyticsController.getEvents);
router.get('/analytics/sessions', analyticsController.getSessions);
router.get('/analytics/overview', analyticsController.getAnalytics);
router.get(
  '/analytics/conversion-analytics',
  analyticsController.getConversionAnalytics
);
router.get(
  '/analytics/conversion-sessions',
  analyticsController.getConversionSessions
);

// Articles Routes
router.route('/articles').get(mockResponse).post(mockResponse);

router
  .route('/articles/:id')
  .get(mockResponse)
  .put(mockResponse)
  .delete(mockResponse);

// Categories Routes
router.route('/categories').get(mockResponse).post(mockResponse);

router
  .route('/categories/:id')
  .get(mockResponse)
  .put(mockResponse)
  .delete(mockResponse);

// Users Routes
router.route('/users').get(mockResponse);

router
  .route('/users/:id')
  .get(mockResponse)
  .put(mockResponse)
  .delete(mockResponse);

// Orders Routes
router.route('/orders').get(mockResponse);

router
  .route('/orders/:id')
  .get(mockResponse)
  .put(mockResponse)
  .delete(mockResponse);

// Threads Routes
router.route('/threads').get(mockResponse);

router
  .route('/threads/:id')
  .get(mockResponse)
  .put(mockResponse)
  .delete(mockResponse);

module.exports = router;
