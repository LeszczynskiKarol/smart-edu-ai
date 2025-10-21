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
console.log('🔑 Sprawdzanie konfiguracji API...');
console.log(
  'GOOGLE_API_KEY:',
  process.env.GOOGLE_API_KEY ? '✓ Ustawiony' : '✗ BRAK'
);
console.log('GOOGLE_CX:', process.env.GOOGLE_CX ? '✓ Ustawiony' : '✗ BRAK');
console.log(
  'ANTHROPIC_API_KEY:',
  process.env.ANTHROPIC_API_KEY ? '✓ Ustawiony' : '✗ BRAK'
);

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
    const needsAcademicSources = [
      'praca_licencjacka',
      'praca_magisterska',
      'referat',
      'esej',
      'rozprawa',
    ].includes(orderedText.rodzajTresci);

    const prompt = `Twoim zadaniem jest stworzenie w języku ${orderedText.countryCode} zapytania do Google.

${needsAcademicSources ? 'WAŻNE: To praca naukowa - użyj terminologii akademickiej.' : ''}

TEMAT: ${orderedText.temat}
RODZAJ PRACY: ${orderedText.rodzajTresci}
WYTYCZNE: ${orderedText.wytyczneIndywidualne || 'brak'}

ZASADY:
1. Zapytanie musi być KRÓTKIE (maksymalnie 5-7 słów)
2. MUSISZ odpowiedzieć TYLKO samym zapytaniem, bez żadnego innego tekstu
3. BEZ cudzysłowów, BEZ przedrostków typu "Oto zapytanie:"
4. Użyj kluczowych słów, które znajdą merytoryczne źródła
5. Unikaj ogólników - bądź konkretny

PRZYKŁADY DOBRYCH ZAPYTAŃ:
- "funkcje opiekuna medycznego demencja"
- "wsparcie pacjenta z demencją opieka"
- "rola pielęgniarki demencja starość"

TWOJE ZAPYTANIE (TYLKO SŁOWA KLUCZOWE):`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      temperature: 0.3, // 🆕 niższa temperatura = bardziej przewidywalne
      messages: [{ role: 'user', content: prompt }],
    });

    let query = message.content[0].text.trim();

    // 🆕 CZYSZCZENIE odpowiedzi Claude
    // Usuń typowe przedrostki
    query = query
      .replace(/^(Oto zapytanie|Zapytanie|Query)[:：]\s*/i, '')
      .replace(/^["'「『]|["'」』]$/g, '') // usuń cudzysłowy na początku/końcu
      .replace(/\n/g, ' ') // usuń nowe linie
      .trim();

    console.log(`🧹 Oczyszczone zapytanie: "${query}"`);

    // Walidacja - sprawdź czy nie jest za długie
    const wordCount = query.split(' ').length;
    if (wordCount > 10) {
      console.warn(`⚠️ Zapytanie zbyt długie (${wordCount} słów), skracam...`);
      query = query.split(' ').slice(0, 8).join(' ');
    }

    // 🆕 DODAJ OPERATORY DLA ŹRÓDEŁ NAUKOWYCH (bez spacji przed filetype)
    if (needsAcademicSources) {
      query += ' (filetype:pdf OR site:edu OR "badania" OR "research")';
    }

    return query;
  } catch (error) {
    console.error('Błąd generowania zapytania Google:', error);
    throw error;
  }
};

const searchGoogle = async (query, language) => {
  try {
    console.log(`📞 Wywołuję Google API z:`);
    console.log(`   Query: "${query}"`);
    console.log(`   Language: ${language}`);
    console.log(`   API Key: ${GOOGLE_API_KEY ? '✓ Ustawiony' : '✗ BRAK'}`);
    console.log(`   CX: ${GOOGLE_CX}`);

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
        timeout: 10000, // 🆕 timeout 10s
      }
    );

    console.log(
      `✅ Google zwrócił ${response.data.items?.length || 0} wyników`
    );

    // 🆕 Loguj pełną odpowiedź jeśli brak wyników
    if (!response.data.items || response.data.items.length === 0) {
      console.error('❌ Google zwrócił 0 wyników. Pełna odpowiedź:');
      console.error(JSON.stringify(response.data, null, 2));
    }

    return {
      items: response.data.items || [],
      searchInformation: response.data.searchInformation || {},
    };
  } catch (error) {
    console.error('❌ Błąd wyszukiwania Google:', error.message);

    // 🆕 Szczegółowe logi błędów
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }

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

    // 1. Generuj zapytanie Google
    console.log(`🔍 Generowanie zapytania Google dla: ${orderedText.temat}`);
    const query = await generateGoogleQuery(orderedText);

    // 🆕 WALIDACJA zapytania
    if (!query || query.trim().length === 0) {
      throw new Error('Claude zwrócił puste zapytanie');
    }

    console.log(`✅ Wygenerowane zapytanie: "${query}"`);

    // 2. Wyszukaj w Google
    const languageCode = getLanguageCode(orderedText.countryCode);
    console.log(`🌐 Wyszukiwanie w języku: ${languageCode}`);
    const searchResults = await searchGoogle(query, languageCode);

    // 🆕 WALIDACJA wyników Google
    if (!searchResults.items || searchResults.items.length === 0) {
      console.warn(
        '⚠️ Google zwrócił 0 wyników, próbuję prostsze zapytanie...'
      );

      // Spróbuj bez operatorów
      const simpleQuery = orderedText.temat.split(' ').slice(0, 5).join(' ');
      console.log(`🔄 Próbuję ponownie z: "${simpleQuery}"`);
      const retryResults = await searchGoogle(simpleQuery, languageCode);

      if (!retryResults.items || retryResults.items.length === 0) {
        throw new Error(
          'Google nie zwrócił żadnych wyników nawet dla uproszczonego zapytania'
        );
      }

      searchResults.items = retryResults.items;
      searchResults.searchInformation = retryResults.searchInformation;
    }

    // 3. Zapisz wyniki Google
    const googleSearchResult = new GoogleSearchResult({
      orderedTextId: orderedText._id,
      searchQuery: query, // 🆕 Pewność że query NIE jest pusty
      language: languageCode,
      results: searchResults.items.map((item) => ({
        title: item.title || '',
        htmlTitle: item.htmlTitle || '',
        link: item.link || '',
        displayLink: item.displayLink || '',
        snippet: item.snippet || '',
        htmlSnippet: item.htmlSnippet || '',
        formattedUrl: item.formattedUrl || '',
        htmlFormattedUrl: item.htmlFormattedUrl || '',
      })),
      totalResults:
        searchResults.searchInformation.formattedTotalResults || '0',
      searchTime: searchResults.searchInformation.searchTime || 0,
      status: 'completed',
    });

    await googleSearchResult.save();
    console.log(
      `✅ Zapisano ${searchResults.items.length} wyników wyszukiwania`
    );

    // 4. Scrapuj strony
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

    // 🆕 SPRAWDŹ czy są jakieś zescrapowane treści
    if (successfulScrapes === 0) {
      throw new Error('Nie udało się zescrapować żadnej strony');
    }

    // 5. Claude wybiera najlepsze źródła
    console.log(`🎯 Claude analizuje źródła...`);
    const selectedSources = await selectBestSources(
      orderedText,
      scrapedResults
    );
    console.log(`✅ Wybrano ${selectedSources.length} najlepszych źródeł`);

    return {
      googleSearchResult,
      scrapedResults,
      selectedSources,
    };
  } catch (error) {
    console.error(`❌ Błąd przetwarzania OrderedText ${orderedTextId}:`, error);

    // 🆕 Zapisz błąd w bazie
    await GoogleSearchResult.create({
      orderedTextId,
      searchQuery: 'ERROR', // żeby przeszła walidacja
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

// 🆕 NOWA FUNKCJA - Wybór najlepszych źródeł
const selectBestSources = async (orderedText, scrapedContents) => {
  try {
    console.log(`🎯 Claude wybiera najlepsze źródła dla: ${orderedText.temat}`);

    // Przygotuj dane źródeł dla Claude
    const sourcesData = scrapedContents
      .filter((s) => s.status === 'completed' && s.scrapedText)
      .map((source, index) => ({
        numer: index + 1,
        url: source.url,
        dlugosc: source.textLength,
        fragment: source.scrapedText.substring(0, 1000), // pierwsze 1000 znaków
      }));

    if (sourcesData.length === 0) {
      throw new Error('Brak zescrapowanych źródeł do analizy');
    }

    // Prompt dla Claude
    const prompt = `Jesteś ekspertem od oceny jakości źródeł internetowych. 

ZADANIE: Przeanalizuj poniższe źródła i wybierz 3-5 NAJLEPSZYCH do napisania tekstu na temat: "${orderedText.temat}"

RODZAJ PRACY: ${orderedText.rodzajTresci}
JĘZYK: ${orderedText.countryCode}

KRYTERIA WYBORU:
- Merytoryczność i rzetelność treści
- Zgodność z tematem
- Aktualność informacji
- Poziom szczegółowości
- Brak treści reklamowych/sprzedażowych

DOSTĘPNE ŹRÓDŁA:
${sourcesData
  .map(
    (s) => `
ŹRÓDŁO ${s.numer}:
URL: ${s.url}
Długość: ${s.dlugosc} znaków
Fragment treści:
${s.fragment}
---
`
  )
  .join('\n')}

ODPOWIEDŹ:
Zwróć TYLKO numery wybranych źródeł oddzielone przecinkami (np: 1,3,5,7)
Bez żadnego dodatkowego tekstu!`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    });

    // Parsuj odpowiedź Claude
    const response = message.content[0].text.trim();
    const selectedNumbers = response
      .split(',')
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n) && n > 0 && n <= sourcesData.length);

    console.log(
      `✅ Claude wybrał ${selectedNumbers.length} źródeł: ${selectedNumbers.join(', ')}`
    );

    // Oznacz wybrane źródła w bazie
    const selectedSources = [];
    for (const num of selectedNumbers) {
      const sourceIndex = num - 1;
      const scrapedContent = scrapedContents[sourceIndex];

      scrapedContent.selectedForGeneration = true;
      await scrapedContent.save();
      selectedSources.push(scrapedContent);
    }

    return selectedSources;
  } catch (error) {
    console.error('❌ Błąd podczas wyboru źródeł:', error);
    throw error;
  }
};

module.exports = {
  generateGoogleQuery,
  searchGoogle,
  processOrderedText,
  processMultipleOrderedTexts,
  selectBestSources,
};
