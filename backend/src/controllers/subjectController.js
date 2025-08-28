// backend/src/controllers/subjectController.js
const Subject = require('../models/Subject');
const createError = require('http-errors');

exports.getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({});
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const { name, nameEn } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const slugEn = nameEn
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const subject = new Subject({
      name,
      nameEn,
      slug,
      slugEn,
    });

    const savedSubject = await subject.save();
    res.status(201).json(savedSubject);
  } catch (error) {
    next(error);
  }
};

exports.getSubjectBySlug = async (req, res, next) => {
  try {
    const { slugEn } = req.params;

    const subject = await Subject.findOne({ slugEn });

    if (!subject) {
      console.log('Nie znaleziono subjectu!');
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Błąd:', error);
    next(error);
  }
};
