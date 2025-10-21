// backend/src/services/textGenerationService.js
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const OrderedText = require('../models/OrderedText');
const GoogleSearchResult = require('../models/GoogleSearchResult');
const scraperService = require('./scraperService');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX || '47c4cfcb21523490f';

const languageMap = {
  polski: 'pl',
  angielski: 'en',
  niemiecki: 'de',
  hiszpański: 'es',
  ukraiński: 'uk',
  portugalski: 'pt',
  rosyjski: 'ru',
  czeski: 'cs',
  francuski: 'fr',
};

const getLanguageCode = (fullLanguage) => {
  return languageMap[fullLanguage.toLowerCase()] || 'pl';
};

const generateGoogleQuery = async (orderedText) => {
  try {
    const prompt = `Twoim zadaniem jest stworzenie w języku ${orderedText.countryCode} zapytania do Google zgodnie z poniższymi wytycznymi. Konkretne wytyczne: Na podstawie tego tematu: ${orderedText.temat} napisz TYLKO I WYŁĄCZNIE zapytanie do Google, które pozwoli na znalezienie rzetelnych informacji źródłowych, na podstawie których można by napisać rzetelny i merytoryczny tekst dla tego rodzaju pracy: [${orderedText.rodzajTresci}] na wskazany temat. Weź pod uwagę, że zapytanie do Google musi być zwięzłe i hasłowe i powinno obejmować nie więcej niż 5 słów - podobnie jak cała Twoja wypowiedź NIE MOŻE PRZEKROCZYĆ 5 słów, dlatego NIE PISZ NIC POZA HASŁEM DO GOOGLE! Zależy mi na tym, żeby zapytanie było skonstruowane w taki sposób, aby znaleźć pasujące treści merytoryczne, a nie ofertowe czy sprzedażowe i obejmowało wszelkie istotne elementy tematu. Myśl jak człowiek, który poszukuje jakichś informacji w Google. Jednocześnie miej na uwadze niuanse językowe i przygotuj takie zapytanie, które oddaje zamysł wyszukiwania i pozwala na uzyskanie TRAFNYCH, a nie niezgodnych z tematą (${orderedText.temat}) wyników. Unikaj dwuznaczności, zadaj pytanie które wprost oznacza konkretny zamysł. Uwzględnij kluczowe elementy tematu, do którego będzie tworzony tekst na podstawie informacji znalezionych ze strony wyszukanych poprzez zapytanie, które teraz tworzysz. Dodatkowo przy analizie musisz wziąć pod uwagę te aspekty, jeśli się pojawiają w cudzysłowie: '${orderedText.wytyczneIndywidualne}', a jeśli nic nie widzisz w cudzysłowie, nie zwracaj uwagi na to. Staraj się dobrze rozpoznać intencje osoby wymyślającej temat i pod ich kątem dobrać zapytanie. Jednocześnie uwzględnij niuanse językowe, tak aby zapytanie nie pozostawiało granic na dowolną interpretację i ściśle pasowało do tematu. Staraj się dość mocno uszczegółowić swoje zapytanie. Jeśli temat pasuje do wytycznych i nadaje się bezpośrednio do zapytania, możesz go przekopiować. POZA TREŚCIĄ ZAPYTANIA POD ŻADNYM POZOREM NIE PISZ NIC WIĘCEJ!!!! ZAMKNIJ CAŁĄ SWOJĄ WYPOWIEDŹ W 5 SŁOWACH!!! i powinna ona zawierać WYŁĄCZNIE samo zapytanie do Google, BEZ ŻADNYCH INNYCH elementów. Nie masz pisać NIC poza SAMYM ZAPYTANIEM rozumiesz? a Twoje zapytanie MUSI BYĆ poprzedzone pustą spacją. A zatem CAŁA TWOJA ODPOWIEDŹ NA MOJE ZAPYTANIE powinna wyglądać następująco: ' Treść zapytania do Google we wskazanym języku'. – I TO KONIEC, NIC WIĘCEJ NIE PISZESZ!!!!! Zapytanie napisz w tym języku: ${orderedText.countryCode}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const query = message.content[0].text.trim();
    return query;
  } catch (error) {
    console.error('Błąd generowania zapytania Google:', error);
    throw error;
  }
};

const searchGoogle = async (query, language) => {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/customsearch/v1',
      {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CX,
          q: query,
          num: 8,
          hl: language,
        },
      }
    );

    return {
      items: response.data.items || [],
      searchInformation: response.data.searchInformation || {},
    };
  } catch (error) {
    console.error('Błąd wyszukiwania Google:', error);
    throw error;
  }
};

const processOrderedText = async (orderedTextId) => {
  try {
    const orderedText = await OrderedText.findById(orderedTextId);
    if (!orderedText) {
      throw new Error('OrderedText nie znaleziony');
    }

    orderedText.status = 'W trakcie';
    await orderedText.save();

    console.log(`🔍 Generowanie zapytania Google dla: ${orderedText.temat}`);
    const query = await generateGoogleQuery(orderedText);
    console.log(`✅ Wygenerowane zapytanie: "${query}"`);

    const languageCode = getLanguageCode(orderedText.countryCode);
    console.log(`🌐 Wyszukiwanie w języku: ${languageCode}`);
    const searchResults = await searchGoogle(query, languageCode);

    const googleSearchResult = new GoogleSearchResult({
      orderedTextId: orderedText._id,
      searchQuery: query,
      language: languageCode,
      results: searchResults.items.map((item) => ({
        title: item.title,
        htmlTitle: item.htmlTitle,
        link: item.link,
        displayLink: item.displayLink,
        snippet: item.snippet,
        htmlSnippet: item.htmlSnippet,
        formattedUrl: item.formattedUrl,
        htmlFormattedUrl: item.htmlFormattedUrl,
      })),
      totalResults: searchResults.searchInformation.formattedTotalResults,
      searchTime: searchResults.searchInformation.searchTime,
      status: 'completed',
    });

    await googleSearchResult.save();
    console.log(
      `✅ Zapisano ${searchResults.items.length} wyników wyszukiwania`
    );

    const urlsToScrape = searchResults.items.map((item) => item.link);
    console.log(`🕷️ Rozpoczynam scrapowanie ${urlsToScrape.length} URL-i...`);

    const scrapedResults = await scraperService.scrapeMultipleUrls(
      orderedText._id,
      googleSearchResult._id,
      urlsToScrape
    );

    const successfulScrapes = scrapedResults.filter(
      (r) => r.status === 'completed'
    ).length;
    console.log(
      `✅ Pomyślnie zescrapowano ${successfulScrapes}/${urlsToScrape.length} stron`
    );

    return {
      googleSearchResult,
      scrapedResults,
    };
  } catch (error) {
    console.error(`❌ Błąd przetwarzania OrderedText ${orderedTextId}:`, error);

    await GoogleSearchResult.create({
      orderedTextId,
      searchQuery: '',
      language: 'pl',
      results: [],
      status: 'failed',
      errorMessage: error.message,
    });

    const orderedText = await OrderedText.findById(orderedTextId);
    if (orderedText) {
      orderedText.status = 'Anulowane';
      await orderedText.save();
    }

    throw error;
  }
};

const processMultipleOrderedTexts = async (orderedTextIds) => {
  const results = [];
  for (const id of orderedTextIds) {
    try {
      const result = await processOrderedText(id);
      results.push({ id, success: true, result });
    } catch (error) {
      results.push({ id, success: false, error: error.message });
    }
  }
  return results;
};

module.exports = {
  generateGoogleQuery,
  searchGoogle,
  processOrderedText,
  processMultipleOrderedTexts,
};
