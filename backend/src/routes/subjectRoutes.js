// backend/src/routes/subjectRoutes.js

const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const subjectController = require('../controllers/subjectController');
const { protect, authorize } = require('../middlewares/auth');
router.get('/debug', async (req, res) => {
  const subjects = await Subject.find({});
  res.json({
    count: subjects.length,
    subjects: subjects,
  });
});
router.get('/:slugEn', subjectController.getSubjectBySlug);
router.get('/', subjectController.getAllSubjects);
router.post('/', protect, authorize('admin'), subjectController.createSubject);

module.exports = router;
