// backend/src/controllers/contentGenerationController.js
const Anthropic = require('@anthropic-ai/sdk');
const Order = require('../models/Order');
const User = require('../models/User');
const ContentGenerationLog = require('../models/ContentGenerationLog');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Funkcja pomocnicza do emitowania aktualizacji przez WebSocket
const emitLogUpdate = (io, logId, updateData) => {
  if (io) {
    io.emit('contentGenerationUpdate', {
      logId,
      ...updateData,
    });
  }
};

exports.generateThesisContent = async (req, res) => {
  try {
    const { orderId, itemId } = req.body;

    if (!orderId || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Brak orderId lub itemId',
      });
    }

    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Zamówienie nie znalezione',
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item nie znaleziony',
      });
    }

    // Utwórz log generowania
    const generationLog = new ContentGenerationLog({
      order: orderId,
      orderItem: itemId,
      status: 'processing',
      startedAt: new Date(),
      steps: [],
    });
    await generationLog.save();

    // Rozpocznij generowanie w tle
    generateContentWithLogging(
      orderId,
      itemId,
      generationLog._id,
      req.app.get('io')
    );

    return res.status(200).json({
      success: true,
      message: 'Generowanie rozpoczęte',
      logId: generationLog._id,
    });
  } catch (error) {
    console.error('Błąd podczas inicjalizacji generowania:', error);
    return res.status(500).json({
      success: false,
      message: 'Wystąpił błąd',
      error: error.message,
    });
  }
};

async function generateContentWithLogging(orderId, itemId, logId, io) {
  const log = await ContentGenerationLog.findById(logId);
  const order = await Order.findById(orderId).populate('user');
  const item = order.items.id(itemId);

  try {
    // KROK 1: Przygotowanie danych
    const step1 = {
      stepNumber: 1,
      stepName: 'Przygotowanie danych wejściowych',
      status: 'running',
      startTime: new Date(),
    };
    log.steps.push(step1);
    await log.save();
    emitLogUpdate(io, logId, { currentStep: 1, status: 'running' });

    const inputData = {
      topic: item.topic,
      guidelines: item.guidelines,
      language: item.language,
      contentType: item.contentType,
      length: item.length,
      tone: item.tone,
      bibliography: item.bibliography,
      searchLanguage: searchLanguage,
      keywords: item.keywords,
      userAttachments: order.userAttachments,
    };

    step1.input = inputData;
    step1.status = 'completed';
    step1.endTime = new Date();
    step1.duration = step1.endTime - step1.startTime;
    await log.save();
    emitLogUpdate(io, logId, { currentStep: 1, status: 'completed' });

    // KROK 2: Budowanie promptu
    const step2 = {
      stepNumber: 2,
      stepName: 'Budowanie promptu dla Claude',
      status: 'running',
      startTime: new Date(),
    };
    log.steps.push(step2);
    await log.save();
    emitLogUpdate(io, logId, { currentStep: 2, status: 'running' });

    const prompt = buildThesisPrompt(item, order);
    step2.input = { item, order };
    step2.output = {
      prompt: prompt.substring(0, 500) + '...', // Skrócona wersja do podglądu
      promptLength: prompt.length,
    };
    step2.status = 'completed';
    step2.endTime = new Date();
    step2.duration = step2.endTime - step2.startTime;
    await log.save();
    emitLogUpdate(io, logId, { currentStep: 2, status: 'completed' });

    // KROK 3: Wysłanie do Claude API
    const step3 = {
      stepNumber: 3,
      stepName: 'Generowanie treści przez Claude AI',
      status: 'running',
      startTime: new Date(),
    };
    log.steps.push(step3);
    await log.save();
    emitLogUpdate(io, logId, { currentStep: 3, status: 'running' });

    const response = await anthropic.beta.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 64000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000,
      },
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      betas: ['context-1m-2025-08-07'],
    });

    const generatedContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n\n');

    step3.output = {
      contentLength: generatedContent.length,
      contentPreview: generatedContent.substring(0, 500) + '...',
      hasThinking: response.content.some((block) => block.type === 'thinking'),
    };
    step3.tokensUsed = {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
      total: response.usage.input_tokens + response.usage.output_tokens,
    };
    step3.status = 'completed';
    step3.endTime = new Date();
    step3.duration = step3.endTime - step3.startTime;
    await log.save();
    emitLogUpdate(io, logId, { currentStep: 3, status: 'completed' });

    // KROK 4: Zapisywanie do bazy
    const step4 = {
      stepNumber: 4,
      stepName: 'Zapisywanie wygenerowanej treści',
      status: 'running',
      startTime: new Date(),
    };
    log.steps.push(step4);
    await log.save();
    emitLogUpdate(io, logId, { currentStep: 4, status: 'running' });

    item.content = generatedContent;
    item.status = 'zakończone';
    item.progress = 100;

    const allItemsCompleted = order.items.every(
      (i) => i.status === 'zakończone'
    );

    if (allItemsCompleted) {
      order.status = 'zakończone';
    }

    await order.save();

    step4.output = {
      itemStatus: item.status,
      orderStatus: order.status,
      savedContentLength: generatedContent.length,
    };
    step4.status = 'completed';
    step4.endTime = new Date();
    step4.duration = step4.endTime - step4.startTime;
    await log.save();
    emitLogUpdate(io, logId, { currentStep: 4, status: 'completed' });

    // Finalizacja logu
    log.status = 'completed';
    log.completedAt = new Date();
    log.totalDuration = log.completedAt - log.startedAt;
    log.totalTokensUsed = {
      input: step3.tokensUsed.input,
      output: step3.tokensUsed.output,
      total: step3.tokensUsed.total,
    };
    await log.save();
    emitLogUpdate(io, logId, { status: 'completed' });
  } catch (error) {
    console.error('Błąd podczas generowania:', error);

    log.status = 'failed';
    log.error = error.message;
    log.completedAt = new Date();

    // Oznacz ostatni krok jako failed
    if (log.steps.length > 0) {
      const lastStep = log.steps[log.steps.length - 1];
      lastStep.status = 'failed';
      lastStep.error = error.message;
      lastStep.endTime = new Date();
      lastStep.duration = lastStep.endTime - lastStep.startTime;
    }

    await log.save();
    emitLogUpdate(io, logId, { status: 'failed', error: error.message });

    // Przywróć status itemu
    item.status = 'oczekujące';
    item.progress = 0;
    await order.save();
  }
}

function buildThesisPrompt(item, order) {
  const languageMap = {
    pol: 'polski',
    eng: 'angielski',
    ger: 'niemiecki',
    ukr: 'ukraiński',
    fra: 'francuski',
    esp: 'hiszpański',
    ros: 'rosyjski',
    por: 'portugalski',
  };

  const language = languageMap[item.language] || 'polski';
  const contentTypeLabel =
    item.contentType === 'licencjacka'
      ? 'pracy licencjackiej'
      : 'pracy magisterskiej';

  let prompt = `Jesteś ekspertem w pisaniu ${contentTypeLabel}. Twoim zadaniem jest napisanie rozdziału ${contentTypeLabel} zgodnie z poniższymi wytycznymi.

TEMAT PRACY:
${item.topic}

WYTYCZNE:
${item.guidelines}

DŁUGOŚĆ TEKSTU:
Rozdział powinien mieć około ${item.length} znaków.

JĘZYK:
Cała praca musi być napisana w języku: ${language}

TON I STYL:
${item.tone === 'nieformalny' ? 'Nieformalny, przystępny styl' : item.tone === 'oficjalny' ? 'Formalny, akademicki styl' : 'Bezosobowy, naukowy styl'}

`;

  if (item.bibliography) {
    const searchLanguageMap = {
      en: 'angielskim',
      pl: 'polskim',
      de: 'niemieckim',
      es: 'hiszpańskim',
      uk: 'ukraińskim',
      cs: 'czeskim',
      pt: 'portugalskim',
      ru: 'rosyjskim',
    };

    const searchLang = searchLanguageMap[item.searchLanguage] || 'angielskim';

    prompt += `BIBLIOGRAFIA:
Praca powinna zawierać bibliografię opartą na źródłach wyszukanych w ${searchLang} internecie.
Użyj aktualnych, wiarygodnych źródeł akademickich.

`;
  }

  if (item.keywords && item.keywords.length > 0) {
    prompt += `SŁOWA KLUCZOWE DO UWZGLĘDNIENIA:
${item.keywords.join(', ')}

`;
  }

  if (order.userAttachments && order.userAttachments.length > 0) {
    prompt += `ZAŁĄCZNIKI UŻYTKOWNIKA:
Użytkownik załączył ${order.userAttachments.length} plików, które mogą zawierać dodatkowe wytyczne lub materiały źródłowe.

`;
  }

  prompt += `INSTRUKCJE FORMATOWANIA:
1. Zachowaj poprawną strukturę akademicką
2. Używaj odpowiednich nagłówków i podtytułów
3. Stosuj przypisy i cytowania w odpowiednim formacie
4. Dodaj bibliografię na końcu rozdziału (jeśli wymagana)
5. Zachowaj profesjonalny, naukowy styl pisania
6. Używaj tabel i list tam gdzie to uzasadnione
7. Zwróć szczególną uwagę na poprawność merytoryczną i językową

ROZPOCZNIJ PISANIE ROZDZIAŁU:`;

  return prompt;
}

// Endpoint do pobierania logów
exports.getGenerationLogs = async (req, res) => {
  try {
    const { orderId, itemId } = req.query;

    const query = {};
    if (orderId) query.order = orderId;
    if (itemId) query.orderItem = itemId;

    const logs = await ContentGenerationLog.find(query)
      .populate('order', 'orderNumber user')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Endpoint do pobierania pojedynczego logu
exports.getGenerationLog = async (req, res) => {
  try {
    const { logId } = req.params;

    const log = await ContentGenerationLog.findById(logId).populate(
      'order',
      'orderNumber user items'
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log nie znaleziony',
      });
    }

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = exports;
