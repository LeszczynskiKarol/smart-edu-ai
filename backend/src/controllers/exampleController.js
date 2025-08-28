// backend/src/controllers/exampleController.js
const Subject = require('../models/Subject');
const WorkType = require('../models/WorkType');
const Example = require('../models/Example');
const createError = require('http-errors');

const cleanHtml = (html) => {
  return html
    .replace(/&lt;p&gt;\s*&nbsp;\s*&lt;\/p&gt;/g, '') // usuwa puste paragrafy z &nbsp;
    .replace(/&lt;p&gt;&nbsp;&lt;\/p&gt;/g, '') // usuwa puste paragrafy z &nbsp;
    .replace(/(<p>\s*&nbsp;\s*<\/p>)/g, '') // usuwa puste paragrafy z &nbsp;
    .replace(/(<p>&nbsp;<\/p>)/g, '') // usuwa puste paragrafy z &nbsp;
    .replace(/&lt;h2&gt;/g, '<h2>') // naprawia znaczniki h2
    .replace(/&lt;\/h2&gt;/g, '</h2>')
    .replace(/&lt;p&gt;/g, '<p>') // naprawia znaczniki p
    .replace(/&lt;\/p&gt;/g, '</p>')
    .replace(/&lt;ul&gt;/g, '<ul>') // naprawia znaczniki ul
    .replace(/&lt;\/ul&gt;/g, '</ul>')
    .replace(/&lt;li&gt;/g, '<li>') // naprawia znaczniki li
    .replace(/&lt;\/li&gt;/g, '</li>')
    .replace(/\s*<\/h2>\s*<p>/g, '</h2><p>') // usuwa odstępy między h2 a p
    .replace(/\s*<\/p>\s*<h2>/g, '</p><h2>') // usuwa odstępy między p a h2
    .replace(/\s{2,}/g, ' ') // usuwa wielokrotne spacje
    .trim(); // usuwa białe znaki z początku i końca
};

exports.getSubjectsByLevel = async (req, res, next) => {
  try {
    const { level, workType } = req.query;
    if (!['primary', 'secondary', 'university'].includes(level)) {
      throw createError(400, 'Invalid education level');
    }

    let matchQuery = { level };
    if (workType) {
      const workTypeDoc = await WorkType.findOne({ slugEn: workType });
      if (!workTypeDoc) {
        throw createError(404, 'WorkType not found');
      }
      matchQuery.workType = workTypeDoc._id;
    }

    const examples = await Example.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subjectData',
        },
      },
      { $unwind: '$subjectData' },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          name: { $first: '$subjectData.name' },
          nameEn: { $first: '$subjectData.nameEn' },
          slug: { $first: '$subjectData.slug' },
          slugEn: { $first: '$subjectData.slugEn' },
        },
      },
      {
        $project: {
          _id: 1,
          id: '$_id',
          name: 1,
          nameEn: 1,
          slug: 1,
          slugEn: 1,
          count: 1,
        },
      },
    ]);

    res.json(examples);
  } catch (error) {
    next(error);
  }
};

exports.getExamplesBySubject = async (req, res, next) => {
  try {
    const { locale, level, subject } = req.params;

    const subjectDoc = await Subject.findOne({ slugEn: subject });
    if (!subjectDoc) {
      console.log('Nie znaleziono przedmiotu:', subject);
      throw createError(404, 'Subject not found');
    }

    const examples = await Example.find({
      level,
      subject: subjectDoc._id,
    }).populate(['subject', 'workType']);

    res.json(examples);
  } catch (error) {
    console.error('Błąd w getExamplesBySubject:', error);
    next(error);
  }
};
exports.getExampleBySlug = async (req, res, next) => {
  try {
    const { locale, level, workType, subject, slug } = req.params;

    const workTypeDoc = await WorkType.findOne({ slugEn: workType });
    const subjectDoc = await Subject.findOne({ slugEn: subject });

    if (!workTypeDoc || !subjectDoc) {
      throw createError(404, 'Invalid workType or subject');
    }

    const example = await Example.findOne({
      level,
      workType: workTypeDoc._id,
      subject: subjectDoc._id,
      slugEn: slug,
    }).populate(['subject', 'workType']);

    if (!example) {
      throw createError(404, 'Example not found');
    }

    // Dekodujemy HTML przed wysłaniem
    const decodedExample = {
      ...example.toObject(),
      content: example.content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&'),
      contentEn: example.contentEn
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&'),
    };

    await Example.findByIdAndUpdate(example._id, { $inc: { views: 1 } });

    res.json(decodedExample);
  } catch (error) {
    next(error);
  }
};

exports.searchExamples = async (req, res, next) => {
  try {
    const { query } = req.query;

    const examples = await Example.find(
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { titleEn: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      },
      'title titleEn level subject slug tags'
    );

    res.json(examples);
  } catch (error) {
    next(error);
  }
};

exports.createExample = async (req, res, next) => {
  try {
    const {
      title,
      titleEn,
      content,
      contentEn,
      level,
      subject,
      workType,
      tags,
      length,
      metaTitlePl,
      metaTitleEn,
      metaDescriptionPl,
      metaDescriptionEn,
    } = req.body;

    // Najpierw czyścimy HTML
    const cleanedContent = cleanHtml(content);
    const cleanedContentEn = cleanHtml(contentEn);

    const subjectDoc = await Subject.findById(subject);
    const workTypeDoc = await WorkType.findById(workType);

    if (!subjectDoc || !workTypeDoc) {
      throw createError(400, 'Invalid subject or workType');
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slugEn = titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const example = new Example({
      title,
      titleEn,
      content: cleanedContent, // używamy wyczyszczonej wersji
      contentEn: cleanedContentEn, // używamy wyczyszczonej wersji
      level,
      subject: subjectDoc._id,
      workType: workTypeDoc._id,
      length,
      slug,
      slugEn,
      tags: tags || [],
      metaTitlePl,
      metaTitleEn,
      metaDescriptionPl,
      metaDescriptionEn,
    });

    const savedExample = await example.save();
    const populatedExample = await savedExample.populate([
      'subject',
      'workType',
    ]);
    res.status(201).json(populatedExample);
  } catch (error) {
    next(error);
  }
};

exports.getAllExamples = async (req, res, next) => {
  try {
    const examples = await Example.find({})
      .populate(['subject', 'workType'])
      .sort({ createdAt: -1 })
      .select('title titleEn level subject workType slug slugEn views tags');
    res.json(examples);
  } catch (error) {
    next(error);
  }
};

exports.getExampleById = async (req, res, next) => {
  try {
    const example = await Example.findById(req.params.id);
    if (!example) {
      throw createError(404, 'Example not found');
    }
    res.json(example);
  } catch (error) {
    next(error);
  }
};

exports.updateExample = async (req, res, next) => {
  try {
    const {
      title,
      titleEn,
      content,
      contentEn,
      level,
      subject,
      workType,
      tags,
      length,
    } = req.body;

    const cleanHtml = (html) => {
      return html
        .replace(/<p>&nbsp;<\/p>/g, '')
        .replace(/(<\/h2>)\s*(<p>)/g, '$1$2')
        .replace(/(<\/p>)\s*(<h2>)/g, '$1$2')
        .replace(/\s{2,}/g, ' ');
    };

    const example = await Example.findByIdAndUpdate(
      req.params.id,
      {
        title,
        titleEn,
        content: cleanHtml(content),
        contentEn: cleanHtml(contentEn),
        level,
        workType,
        subject,
        length,
        tags: tags || [],
        ...(req.body.title && {
          slug: title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
        }),
      },
      { new: true }
    );

    if (!example) {
      throw createError(404, 'Example not found');
    }

    res.json(example);
  } catch (error) {
    next(error);
  }
};

exports.deleteExample = async (req, res, next) => {
  try {
    const example = await Example.findByIdAndDelete(req.params.id);
    if (!example) {
      throw createError(404, 'Example not found');
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

exports.getExamplesByWorkType = async (req, res, next) => {
  try {
    const { locale, level, workType } = req.params; // dodajemy locale

    const workTypeDoc = await WorkType.findOne({ slugEn: workType });
    if (!workTypeDoc) {
      return next();
    }

    const examples = await Example.find({
      level,
      workType: workTypeDoc._id,
    }).populate(['subject', 'workType']);

    res.json(examples);
  } catch (error) {
    next(error);
  }
};

exports.getExamplesByLevel = async (req, res, next) => {
  try {
    const { locale, level } = req.params;

    const examples = await Example.find({
      level,
    }).populate(['subject', 'workType']);

    res.json(examples);
  } catch (error) {
    console.error('Error in getExamplesByLevel:', error);
    next(error);
  }
};

exports.getRelatedExamples = async (req, res, next) => {
  try {
    const { exampleId, level, workType, subject, limit = 3 } = req.query;

    const workTypeDoc = await WorkType.findOne({ slugEn: workType });
    const subjectDoc = await Subject.findOne({ slugEn: subject });

    if (!workTypeDoc || !subjectDoc) {
      throw createError(404, 'WorkType or Subject not found');
    }

    const examples = await Example.find({
      _id: { $ne: exampleId },
      $or: [
        { level, workType: workTypeDoc._id },
        { level, subject: subjectDoc._id },
      ],
    })
      .populate(['subject', 'workType'])
      .limit(parseInt(limit))
      .sort({ views: -1 });

    res.json(examples);
  } catch (error) {
    next(error);
  }
};
