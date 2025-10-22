// backend/src/controllers/textGenerationController.js
const textGenerationService = require('../services/textGenerationService');
const OrderedText = require('../models/OrderedText');
const GoogleSearchResult = require('../models/GoogleSearchResult');
const ScrapedContent = require('../models/ScrapedContent');
const AcademicWork = require('../models/AcademicWork');
const TextStructure = require('../models/TextStructure');
const GeneratedTextContent = require('../models/GeneratedTextContent');

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

    // 🆕 Sprawdź strukturę i treść
    const TextStructure = require('../models/TextStructure');
    const GeneratedTextContent = require('../models/GeneratedTextContent');

    const textStructure = await TextStructure.findOne({ orderedTextId });
    const generatedContent = await GeneratedTextContent.findOne({
      orderedTextId,
    });

    // 🆕 NOWA FUNKCJA OBLICZANIA PROGRESU
    let progress = 0;

    // Krok 1: OrderedText (10%)
    if (orderedText) progress += 10;

    // Krok 2: Google Search (20%)
    if (googleSearch && googleSearch.status === 'completed') {
      progress += 20;
    }

    // Krok 3: Scraping (30%)
    if (scrapedContent.length > 0) {
      const completedCount = scrapedContent.filter(
        (s) => s.status === 'completed'
      ).length;
      const scrapingProgress = (completedCount / scrapedContent.length) * 30;
      progress += scrapingProgress;
    }

    // 🆕 Krok 4: Struktura (20%)
    if (textStructure && textStructure.status === 'completed') {
      progress += 20;
    }

    // 🆕 Krok 5: Treść (20%)
    if (generatedContent && generatedContent.status === 'completed') {
      progress += 20;
    }

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
      structure: {
        exists: !!textStructure,
        status: textStructure?.status,
        headersCount: textStructure?.headersCount,
      },
      content: {
        exists: !!generatedContent,
        status: generatedContent?.status,
        characters: generatedContent?.totalCharacters,
        words: generatedContent?.totalWords,
      },
      overallProgress: Math.round(progress),
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

  // Krok 1: OrderedText utworzony (10%)
  if (orderedText) progress += 10;

  // Krok 2: Google Search zakończony (20%)
  if (googleSearch && googleSearch.status === 'completed') {
    progress += 20;
  }

  // Krok 3: Scraping zakończony (30%)
  if (scrapedContent.length > 0) {
    const completedCount = scrapedContent.filter(
      (s) => s.status === 'completed'
    ).length;
    const scrapingProgress = (completedCount / scrapedContent.length) * 30;
    progress += scrapingProgress;
  }

  // 🆕 Krok 4: Struktura wygenerowana (20%)
  // 🆕 Krok 5: Treść wygenerowana (20%)
  // Te sprawdzimy asynchronicznie w endpoint

  return Math.round(progress);
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

    // 5. Text Structure
    const textStructure = await TextStructure.findOne({ orderedTextId });

    // 6. Generated Content
    const generatedContent = await GeneratedTextContent.findOne({
      orderedTextId,
    });

    // 🆕 7. Source Selection (Claude wybór źródeł)
    const SourceSelection = require('../models/SourceSelection');
    const sourceSelection = await SourceSelection.findOne({ orderedTextId });

    // 🆕 8. Academic Work (dla prac MGR/LIC)
    const academicWork = await AcademicWork.findOne({ orderedTextId });

    // 8. Processing Timeline
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
              promptInfo: {
                topic: orderedText.temat,
                contentType: orderedText.rodzajTresci,
                language: orderedText.jezyk,
              },
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
          promptUsed: sourceSelection?.promptUsed,
          response: sourceSelection?.selectedIndices,
        },
      },
      {
        step: 5,
        name: 'Generowanie struktury',
        timestamp: textStructure?.createdAt || academicWork?.createdAt,
        status: textStructure
          ? textStructure.status === 'completed'
            ? 'completed'
            : 'in_progress'
          : academicWork
            ? academicWork.status === 'toc_completed' ||
              academicWork.tocGenerationTime > 0
              ? 'completed'
              : academicWork.status.includes('generating')
                ? 'in_progress'
                : 'pending'
            : 'pending',
        data: textStructure
          ? {
              headersCount: textStructure.headersCount,
              sourcesUsed: textStructure.usedSources.length,
              totalLength: textStructure.totalSourcesLength,
              promptUsed: textStructure.promptUsed,
            }
          : academicWork // 🆕 Alternatywnie dla AcademicWork
            ? {
                chaptersCount: academicWork.chapters?.length || 0,
                tocTokens: academicWork.tocTokensUsed,
                workType: academicWork.workType,
                promptUsed: academicWork.tocPromptUsed,
              }
            : null,
      },
      {
        step: 6,
        name: 'Generowanie tekstu',
        timestamp:
          generatedContent?.createdAt ||
          academicWork?.completionTime ||
          (academicWork?.chapters?.length > 0
            ? academicWork.chapters[0].startTime
            : null),
        status: generatedContent
          ? generatedContent.status === 'completed'
            ? 'completed'
            : generatedContent.status === 'failed'
              ? 'failed'
              : 'in_progress'
          : academicWork
            ? academicWork.status === 'completed'
              ? 'completed'
              : academicWork.status === 'failed'
                ? 'failed'
                : academicWork.chapters?.some(
                      (ch) => ch.status === 'completed'
                    ) || academicWork.status.includes('chapter')
                  ? 'in_progress'
                  : 'pending'
            : 'pending',
        data: generatedContent
          ? {
              totalWords: generatedContent.totalWords,
              totalCharacters: generatedContent.totalCharacters,
              tokensUsed: generatedContent.tokensUsed,
              promptUsed: generatedContent.promptUsed,
            }
          : academicWork // 🆕 Dla AcademicWork
            ? {
                totalCharacters: academicWork.totalCharacterCount,
                totalTokens: academicWork.totalTokensUsed,
                chaptersCompleted: academicWork.chapters.filter(
                  (ch) => ch.status === 'completed'
                ).length,
                generationTime: Math.round(
                  academicWork.totalGenerationTime / 1000 / 60
                ), // minuty
              }
            : null,
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
          liczbaZnakow: orderedText.liczbaZnakow,
          jezyk: orderedText.jezyk,
          wytyczneIndywidualne: orderedText.wytyczneIndywidualne,
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
        structure: textStructure
          ? {
              _id: textStructure._id,
              structure: textStructure.structure,
              headersCount: textStructure.headersCount,
              usedSources: textStructure.usedSources,
              totalSourcesLength: textStructure.totalSourcesLength,
              status: textStructure.status,
              generationTime: textStructure.generationTime,
              tokensUsed: textStructure.tokensUsed,
              createdAt: textStructure.createdAt,
              promptUsed: textStructure.promptUsed,
            }
          : null,
        // 🆕 Academic Work (jeśli istnieje)
        academicWork: academicWork
          ? {
              _id: academicWork._id,
              workType: academicWork.workType,
              status: academicWork.status,
              tableOfContents: academicWork.tableOfContents,
              chaptersCount: academicWork.chapters.length,
              chaptersCompleted: academicWork.chapters.filter(
                (ch) => ch.status === 'completed'
              ).length,
              totalCharacters: academicWork.totalCharacterCount,
              totalTokens: academicWork.totalTokensUsed,
              totalGenerationTime: Math.round(
                academicWork.totalGenerationTime / 1000 / 60
              ), // minuty
              createdAt: academicWork.createdAt,
              completionTime: academicWork.completionTime,
            }
          : null,
        generatedContent: generatedContent
          ? {
              _id: generatedContent._id,
              fullContent: generatedContent.fullContent,
              totalWords: generatedContent.totalWords,
              totalCharacters: generatedContent.totalCharacters,
              status: generatedContent.status,
              generationTime: generatedContent.generationTime,
              tokensUsed: generatedContent.tokensUsed,
              createdAt: generatedContent.createdAt,
              promptUsed: generatedContent.promptUsed,
            }
          : null,
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

exports.getStructure = async (req, res) => {
  try {
    const { orderedTextId } = req.params;

    // Najpierw pobierz orderedText
    const orderedText = await OrderedText.findById(orderedTextId);

    let structure = await TextStructure.findOne({ orderedTextId }).lean();

    // 🆕 Dla prac MGR/LIC pobierz AcademicWork
    if (!structure && orderedText) {
      // ✅ DODAJ SPRAWDZENIE orderedText
      const workType = orderedText.rodzajTresci.toLowerCase();
      if (workType.includes('magister') || workType.includes('licencjat')) {
        const academicWork = await AcademicWork.findOne({
          orderedTextId,
        }).lean();

        if (academicWork) {
          // Mapuj AcademicWork na format TextStructure
          structure = {
            _id: academicWork._id,
            structure:
              academicWork.tableOfContents || academicWork.fullStructure,
            headersCount: academicWork.chapters?.length || 0,
            usedSources: [],
            totalSourcesLength: 0,
            status:
              academicWork.status.includes('completed') ||
              academicWork.status.includes('chapter')
                ? 'completed'
                : academicWork.status.includes('generating')
                  ? 'generating'
                  : 'pending',
            generationTime: academicWork.tocGenerationTime || 0,
            tokensUsed: academicWork.tocTokensUsed || 0,
            createdAt: academicWork.createdAt,
            promptUsed: academicWork.tocPromptUsed,
          };
        }
      }
    }

    res.status(200).json({
      success: true,
      data: structure,
    });
  } catch (error) {
    console.error('Błąd pobierania struktury:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania struktury',
      error: error.message,
    });
  }
};

exports.getGeneratedContent = async (req, res) => {
  try {
    const { orderedTextId } = req.params;

    const generatedContent = await GeneratedTextContent.findOne({
      orderedTextId,
    });

    if (!generatedContent) {
      return res.status(404).json({
        success: false,
        message: 'Wygenerowana treść nie znaleziona',
      });
    }

    res.status(200).json({
      success: true,
      data: generatedContent,
    });
  } catch (error) {
    console.error('Błąd pobierania wygenerowanej treści:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd pobierania wygenerowanej treści',
      error: error.message,
    });
  }
};
