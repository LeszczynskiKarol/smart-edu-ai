// backend/src/controllers/thesisExampleController.js
const ThesisExample = require('../models/ThesisExample');
const createError = require('http-errors');

const cleanHtml = (html) => {
  return html
    .replace(/&lt;p&gt;\s*&nbsp;\s*&lt;\/p&gt;/g, '')
    .replace(/&lt;p&gt;&nbsp;&lt;\/p&gt;/g, '')
    .replace(/(<p>\s*&nbsp;\s*<\/p>)/g, '')
    .replace(/(<p>&nbsp;<\/p>)/g, '')
    .replace(/&lt;h2&gt;/g, '<h2>')
    .replace(/&lt;\/h2&gt;/g, '</h2>')
    .replace(/&lt;p&gt;/g, '<p>')
    .replace(/&lt;\/p&gt;/g, '</p>')
    .replace(/&lt;ul&gt;/g, '<ul>')
    .replace(/&lt;\/ul&gt;/g, '</ul>')
    .replace(/&lt;li&gt;/g, '<li>')
    .replace(/&lt;\/li&gt;/g, '</li>')
    .replace(/\s*<\/h2>\s*<p>/g, '</h2><p>')
    .replace(/\s*<\/p>\s*<h2>/g, '</p><h2>')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Pobierz wszystkie przykłady dla danej kategorii
exports.getExamplesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    if (!['bachelor', 'master', 'coursework'].includes(category)) {
      throw createError(400, 'Invalid category');
    }

    const examples = await ThesisExample.find({
      category,
      published: true,
    })
      .select(
        'title titleEn slug slugEn subject subjectEn wordCount views featured createdAt'
      )
      .sort({ featured: -1, createdAt: -1 });

    res.json(examples);
  } catch (error) {
    next(error);
  }
};

// Pobierz pojedynczy przykład
exports.getExampleBySlug = async (req, res, next) => {
  try {
    const { category, slug } = req.params;

    if (!['bachelor', 'master', 'coursework'].includes(category)) {
      throw createError(400, 'Invalid category');
    }

    const example = await ThesisExample.findOne({
      category,
      $or: [{ slug }, { slugEn: slug }],
      published: true,
    });

    if (!example) {
      throw createError(404, 'Example not found');
    }

    // Dekoduj HTML
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

    // Zwiększ licznik wyświetleń
    await ThesisExample.findByIdAndUpdate(example._id, { $inc: { views: 1 } });

    res.json(decodedExample);
  } catch (error) {
    next(error);
  }
};

// Utwórz nowy przykład (admin)
exports.createExample = async (req, res, next) => {
  try {
    const {
      category,
      title,
      titleEn,
      content,
      contentEn,
      subject,
      subjectEn,
      tags,
      wordCount,
      metaTitlePl,
      metaTitleEn,
      metaDescriptionPl,
      metaDescriptionEn,
      published,
      featured,
    } = req.body;

    // Walidacja kategorii
    if (!['bachelor', 'master', 'coursework'].includes(category)) {
      throw createError(400, 'Invalid category');
    }

    // Wygeneruj slugi
    const slug = generateSlug(title);
    const slugEn = generateSlug(titleEn);

    // Sprawdź czy slug już istnieje w tej kategorii
    const existingSlug = await ThesisExample.findOne({
      category,
      $or: [{ slug }, { slugEn }],
    });

    if (existingSlug) {
      throw createError(400, 'Slug already exists in this category');
    }

    // Wyczyść HTML
    const cleanedContent = cleanHtml(content);
    const cleanedContentEn = cleanHtml(contentEn);

    const example = new ThesisExample({
      category,
      title,
      titleEn,
      content: cleanedContent,
      contentEn: cleanedContentEn,
      slug,
      slugEn,
      subject,
      subjectEn,
      tags: tags || [],
      wordCount: wordCount || 0,
      metaTitlePl,
      metaTitleEn,
      metaDescriptionPl,
      metaDescriptionEn,
      published: published !== undefined ? published : true,
      featured: featured || false,
    });

    const savedExample = await example.save();
    res.status(201).json(savedExample);
  } catch (error) {
    next(error);
  }
};

// Aktualizuj przykład (admin)
exports.updateExample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Jeśli zmieniono tytuł, wygeneruj nowe slugi
    if (updateData.title) {
      updateData.slug = generateSlug(updateData.title);
    }
    if (updateData.titleEn) {
      updateData.slugEn = generateSlug(updateData.titleEn);
    }

    // Wyczyść HTML jeśli jest
    if (updateData.content) {
      updateData.content = cleanHtml(updateData.content);
    }
    if (updateData.contentEn) {
      updateData.contentEn = cleanHtml(updateData.contentEn);
    }

    updateData.updatedAt = Date.now();

    const example = await ThesisExample.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!example) {
      throw createError(404, 'Example not found');
    }

    res.json(example);
  } catch (error) {
    next(error);
  }
};

// Usuń przykład (admin)
exports.deleteExample = async (req, res, next) => {
  try {
    const { id } = req.params;

    const example = await ThesisExample.findByIdAndDelete(id);

    if (!example) {
      throw createError(404, 'Example not found');
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Pobierz wszystkie przykłady (admin)
exports.getAllExamples = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const examples = await ThesisExample.find(query)
      .select(
        'category title titleEn slug slugEn subject subjectEn views published featured createdAt'
      )
      .sort({ createdAt: -1 });

    res.json(examples);
  } catch (error) {
    next(error);
  }
};

// Pobierz pojedynczy przykład po ID (admin)
exports.getExampleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const example = await ThesisExample.findById(id);

    if (!example) {
      throw createError(404, 'Example not found');
    }

    res.json(example);
  } catch (error) {
    next(error);
  }
};

// Pobierz powiązane przykłady
exports.getRelatedExamples = async (req, res, next) => {
  try {
    const { exampleId, category, limit = 3 } = req.query;

    const examples = await ThesisExample.find({
      _id: { $ne: exampleId },
      category,
      published: true,
    })
      .select('title titleEn slug slugEn subject subjectEn wordCount views')
      .limit(parseInt(limit))
      .sort({ views: -1, createdAt: -1 });

    res.json(examples);
  } catch (error) {
    next(error);
  }
};

// Wyszukiwanie
exports.searchExamples = async (req, res, next) => {
  try {
    const { query, category } = req.query;

    let searchQuery = {
      published: true,
      $text: { $search: query },
    };

    if (category) {
      searchQuery.category = category;
    }

    const examples = await ThesisExample.find(searchQuery)
      .select('category title titleEn slug slugEn subject subjectEn')
      .limit(10);

    res.json(examples);
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
