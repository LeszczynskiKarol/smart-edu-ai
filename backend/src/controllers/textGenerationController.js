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

// 🆕 Pobierz wybrane źródła
exports.getSelectedSources = async (req, res) => {
  try {
    const { orderedTextId } = req.params;

    const selectedSources = await ScrapedContent.find({
      orderedTextId,
      selectedForGeneration: true,
    })
      .populate('googleSearchResultId')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: selectedSources.length,
      data: selectedSources,
    });
  } catch (error) {
    console.error('Błąd pobierania wybranych źródeł:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania wybranych źródeł',
      error: error.message,
    });
  }
};

// 🆕 Pobierz pełny przebieg procesu (dla admina)
exports.getProcessFlow = async (req, res) => {
  try {
    const { orderedTextId } = req.params;

    // 1. OrderedText
    const orderedText = await OrderedText.findById(orderedTextId);
    if (!orderedText) {
      return res.status(404).json({
        success: false,
        message: 'OrderedText nie znaleziony',
      });
    }

    // 2. Google Search Results
    const googleSearch = await GoogleSearchResult.findOne({ orderedTextId });

    // 3. All Scraped Content
    const allScraped = await ScrapedContent.find({ orderedTextId }).sort({
      createdAt: 1,
    });

    // 4. Selected Sources
    const selectedSources = allScraped.filter((s) => s.selectedForGeneration);

    // 5. Processing Timeline
    const timeline = [
      {
        step: 1,
        name: 'Utworzenie zamówienia',
        timestamp: orderedText.createdAt,
        status: 'completed',
      },
      {
        step: 2,
        name: 'Generowanie zapytania Google',
        timestamp: googleSearch?.createdAt,
        status: googleSearch ? 'completed' : 'pending',
        data: googleSearch
          ? {
              query: googleSearch.searchQuery,
              language: googleSearch.language,
              resultsCount: googleSearch.results.length,
            }
          : null,
      },
      {
        step: 3,
        name: 'Scrapowanie stron',
        timestamp: allScraped[0]?.createdAt,
        status:
          allScraped.length > 0
            ? allScraped.every((s) => s.status === 'completed')
              ? 'completed'
              : 'in_progress'
            : 'pending',
        data: {
          total: allScraped.length,
          completed: allScraped.filter((s) => s.status === 'completed').length,
          failed: allScraped.filter((s) => s.status === 'failed').length,
        },
      },
      {
        step: 4,
        name: 'Wybór źródeł przez Claude',
        timestamp: selectedSources[0]?.updatedAt,
        status: selectedSources.length > 0 ? 'completed' : 'pending',
        data: {
          selected: selectedSources.length,
          total: allScraped.filter((s) => s.status === 'completed').length,
        },
      },
      {
        step: 5,
        name: 'Generowanie tekstu',
        status: 'pending',
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        orderedText: {
          _id: orderedText._id,
          temat: orderedText.temat,
          rodzajTresci: orderedText.rodzajTresci,
          status: orderedText.status,
          createdAt: orderedText.createdAt,
        },
        googleSearch: googleSearch
          ? {
              query: googleSearch.searchQuery,
              language: googleSearch.language,
              resultsCount: googleSearch.results.length,
              results: googleSearch.results,
            }
          : null,
        scraping: {
          total: allScraped.length,
          completed: allScraped.filter((s) => s.status === 'completed').length,
          failed: allScraped.filter((s) => s.status === 'failed').length,
          sources: allScraped.map((s) => ({
            _id: s._id,
            url: s.url,
            status: s.status,
            textLength: s.textLength,
            selected: s.selectedForGeneration || false,
            selectionReason: s.selectionReason,
          })),
        },
        selectedSources: selectedSources.map((s) => ({
          _id: s._id,
          url: s.url,
          textLength: s.textLength,
          snippet: s.scrapedText.substring(0, 300),
        })),
        timeline,
      },
    });
  } catch (error) {
    console.error('Błąd pobierania przebiegu procesu:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania przebiegu procesu',
      error: error.message,
    });
  }
};
