// backend/src/controllers/textGenerationController.js
const textGenerationService = require('../services/textGenerationService');
const OrderedText = require('../models/OrderedText');
const GoogleSearchResult = require('../models/GoogleSearchResult');
const ScrapedContent = require('../models/ScrapedContent');

exports.startTextGeneration = async (req, res) => {
  try {
    const { orderedTextId } = req.body;

    const result =
      await textGenerationService.processOrderedText(orderedTextId);

    res.status(200).json({
      success: true,
      message: 'Proces generowania rozpoczęty',
      data: result,
    });
  } catch (error) {
    console.error('Błąd rozpoczęcia generowania tekstu:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd rozpoczęcia generowania tekstu',
      error: error.message,
    });
  }
};

exports.batchStartTextGeneration = async (req, res) => {
  try {
    const { orderedTextIds } = req.body;

    if (!Array.isArray(orderedTextIds) || orderedTextIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Brak listy orderedTextIds',
      });
    }

    const results =
      await textGenerationService.processMultipleOrderedTexts(orderedTextIds);

    res.status(200).json({
      success: true,
      message: 'Proces wsadowy rozpoczęty',
      data: results,
    });
  } catch (error) {
    console.error('Błąd wsadowego generowania tekstów:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd wsadowego generowania tekstów',
      error: error.message,
    });
  }
};

exports.getSearchResults = async (req, res) => {
  try {
    const { orderedTextId } = req.params;

    const searchResult = await GoogleSearchResult.findOne({
      orderedTextId,
    }).populate('orderedTextId');

    if (!searchResult) {
      return res.status(404).json({
        success: false,
        message: 'Wyniki wyszukiwania nie znalezione',
      });
    }

    res.status(200).json({
      success: true,
      data: searchResult,
    });
  } catch (error) {
    console.error('Błąd pobierania wyników wyszukiwania:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania wyników wyszukiwania',
      error: error.message,
    });
  }
};

exports.getAllSearchResults = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const searchResults = await GoogleSearchResult.find(filter)
      .populate('orderedTextId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: searchResults.length,
      data: searchResults,
    });
  } catch (error) {
    console.error('Błąd pobierania wszystkich wyników wyszukiwania:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania wszystkich wyników wyszukiwania',
      error: error.message,
    });
  }
};

exports.getScrapedContent = async (req, res) => {
  try {
    const { orderedTextId } = req.params;

    const scrapedContent = await ScrapedContent.find({
      orderedTextId,
    })
      .populate('googleSearchResultId')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: scrapedContent.length,
      data: scrapedContent,
    });
  } catch (error) {
    console.error('Błąd pobierania zescrapowanych treści:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania zescrapowanych treści',
      error: error.message,
    });
  }
};

exports.getProcessingStatus = async (req, res) => {
  try {
    const { orderedTextId } = req.params;

    const orderedText = await OrderedText.findById(orderedTextId);
    const googleSearch = await GoogleSearchResult.findOne({ orderedTextId });
    const scrapedContent = await ScrapedContent.find({ orderedTextId });

    const status = {
      orderedText: {
        exists: !!orderedText,
        status: orderedText?.status,
      },
      googleSearch: {
        exists: !!googleSearch,
        status: googleSearch?.status,
        resultsCount: googleSearch?.results?.length || 0,
      },
      scraping: {
        total: scrapedContent.length,
        completed: scrapedContent.filter((s) => s.status === 'completed')
          .length,
        failed: scrapedContent.filter((s) => s.status === 'failed').length,
        pending: scrapedContent.filter(
          (s) => s.status === 'pending' || s.status === 'scraping'
        ).length,
      },
      overallProgress: calculateOverallProgress(
        orderedText,
        googleSearch,
        scrapedContent
      ),
    };

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Błąd pobierania statusu przetwarzania:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania statusu przetwarzania',
      error: error.message,
    });
  }
};

function calculateOverallProgress(orderedText, googleSearch, scrapedContent) {
  let progress = 0;

  if (orderedText) progress += 10;

  if (googleSearch && googleSearch.status === 'completed') {
    progress += 30;
  }

  if (scrapedContent.length > 0) {
    const completedCount = scrapedContent.filter(
      (s) => s.status === 'completed'
    ).length;
    const scrapingProgress = (completedCount / scrapedContent.length) * 40;
    progress += scrapingProgress;
  }

  return Math.min(progress, 80);
}
