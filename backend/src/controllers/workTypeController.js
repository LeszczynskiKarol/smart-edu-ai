// backend/src/controllers/workTypeController.js
const WorkType = require('../models/WorkType');

exports.getAllWorkTypes = async (req, res, next) => {
  try {
    const workTypes = await WorkType.find({});
    res.json(workTypes);
  } catch (error) {
    next(error);
  }
};

exports.createWorkType = async (req, res, next) => {
  try {
    const { name, nameEn } = req.body;
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const slugEn = nameEn // dodajemy generowanie slugEn
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const workType = new WorkType({
      name,
      nameEn,
      slug,
      slugEn, // dodajemy do obiektu
    });

    const savedWorkType = await workType.save();
    res.status(201).json(savedWorkType);
  } catch (error) {
    next(error);
  }
};
exports.getWorkTypeBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const workType = await WorkType.findOne({
      $or: [{ slug }, { slugEn: slug }],
    });

    if (!workType) {
      return res.status(404).json({ message: 'Work type not found' });
    }

    res.json(workType);
  } catch (error) {
    next(error);
  }
};
