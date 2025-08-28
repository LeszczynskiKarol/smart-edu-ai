// backend/src/controllers/articleController.js
const mongoose = require('mongoose');
const Article = require('../models/Article');
const { uploadSingle, upload } = require('../utils/s3Upload');
const Category = require('../models/Category');

exports.createArticle = async (req, res) => {
  upload.single('featuredImage')(req, res, async function (err) {
    if (err) {
      console.error('Błąd przesyłania:', err);
      return res.status(500).json({
        success: false,
        error: 'Wystąpił błąd podczas przesyłania pliku.',
        details: err.message,
      });
    }

    try {
      const articleData = {
        ...req.body,
        author: req.user.id,
        featuredImage: req.file
          ? `http://s3.eu-north-1.amazonaws.com/${process.env.NEXT_AWS_BUCKET_NAME}/${req.file.key}`
          : 'default.jpg',
      };

      // Sprawdź, czy kategoria istnieje
      const category = await Category.findOne({ name: articleData.category });
      if (!category) {
        return res.status(400).json({
          success: false,
          error: `Podana kategoria "${articleData.category}" nie istnieje`,
        });
      }

      // Przypisz slug kategorii do artykułu
      articleData.categorySlug = category.slug;

      if (typeof articleData.tags === 'string') {
        articleData.tags = JSON.parse(articleData.tags);
      }

      const article = await Article.create(articleData);

      res.status(201).json({
        success: true,
        data: article,
      });
    } catch (error) {
      console.error('Błąd tworzenia artykułu:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });
};

exports.getArticlesByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const articles = await Article.find({ categorySlug }).populate(
      'author',
      'name'
    );
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate('author', 'name');
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getArticle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Nieprawidłowe ID artykułu',
      });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Nie znaleziono artykułu',
      });
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Błąd podczas pobierania artykułu:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd serwera podczas pobierania artykułu',
    });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    let article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    if (
      article.author.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this article',
      });
    }

    article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    if (
      article.author.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this article',
      });
    }

    await article.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getArticleBySlug = async (req, res) => {
  try {
    const { categorySlug, slug } = req.params;
    const article = await Article.findOne({ categorySlug, slug });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Artykuł nie znaleziony',
      });
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getRecentArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('author', 'name');

    res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getArticlesByCategorySlug = async (req, res) => {
  try {
    const { categorySlug } = req.params;

    const articles = await Article.find({
      categorySlug,
      status: 'published',
    }).populate('author', 'name');

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error('Error fetching articles by category slug:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
