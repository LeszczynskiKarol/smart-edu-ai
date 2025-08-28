// backend/src/routes/workTypePageRoutes.js
const express = require('express');
const router = express.Router();
const workTypePageController = require('../controllers/workTypePageController');
const { protect: auth } = require('../middlewares/auth');
const { upload, uploadSingle } = require('../utils/s3Upload');

// Trasy dla CRUD operacji
router.get('/work-types', auth, workTypePageController.getWorkTypes);
router.post('/work-types', auth, workTypePageController.addWorkType);
router.get('/list', auth, workTypePageController.getAllPages); // zmieniamy /all na /list
router.post('/new', auth, workTypePageController.createPage); // zmieniamy / na /new
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'Nie przesłano pliku' });
    }

    // Zmieniony format URL
    const url = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.NEXT_AWS_BUCKET_NAME}/${file.key}`;

    res.json({ url });
  } catch (error) {
    console.error('Błąd podczas uploadu:', error);
    res.status(500).json({ message: 'Błąd podczas uploadu pliku' });
  }
});
router.put(
  '/:id',
  auth,
  (req, res, next) => {
    console.log('Request body w middleware:', req.body);
    console.log(
      'sectionsVisibility w middleware:',
      req.body.sectionsVisibility
    );
    next();
  },
  workTypePageController.updatePage
);

router.delete('/:id', auth, workTypePageController.deletePage);
router.get('/details/:id', auth, workTypePageController.getPageById);

// Trasy dla wyświetlania stron
router.get('/:workType', workTypePageController.getMainWorkTypePage);
router.get(
  '/:workType/:subject',
  workTypePageController.getWorkTypeSubjectPage
);
router.get(
  '/:workType/:subject/:specialization',
  workTypePageController.getWorkTypeSpecializationPage
);

module.exports = router;
