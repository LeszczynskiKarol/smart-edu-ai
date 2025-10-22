// backend/src/services/structureGenerationService.js

const Anthropic = require('@anthropic-ai/sdk');
const OrderedText = require('../models/OrderedText');
const TextStructure = require('../models/TextStructure');
const ScrapedContent = require('../models/ScrapedContent');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Określ typ pracy na podstawie rodzajTresci
 */
const determineWorkType = (rodzajTresci) => {
  const lowerType = rodzajTresci.toLowerCase();

  if (lowerType.includes('magister') || lowerType.includes('mgr')) {
    return 'mgr';
  }

  if (
    lowerType.includes('licencjat') ||
    lowerType.includes('lic') ||
    lowerType.includes('inżynier')
  ) {
    return 'lic';
  }

  return 'other';
};

/**
 * Ogranicz źródła do max 30,000 znaków
 */
const limitSources = (scrapedContents, maxChars = 100000) => {
  const validSources = scrapedContents.filter(
    (s) => s.scrapedText && s.status === 'completed'
  );

  if (validSources.length === 0) {
    return { sources: [], totalLength: 0 };
  }

  console.log(
    `📏 Limitowanie źródeł do ${maxChars.toLocaleString()} znaków (Claude context window: 200k tokenów)...`
  );

  // 🆕 RÓWNOMIERNE ROZŁOŻENIE między źródła
  const charsPerSource = Math.floor(maxChars / validSources.length);
  console.log(
    `   📊 ${validSources.length} źródeł × ${charsPerSource.toLocaleString()} znaków/źródło\n`
  );

  const limitedSources = [];
  let totalLength = 0;

  for (const source of validSources) {
    let textToUse = source.scrapedText;
    let wasTruncated = false;

    if (source.scrapedText.length > charsPerSource) {
      textToUse = source.scrapedText.substring(0, charsPerSource);
      wasTruncated = true;
      console.log(
        `   ✂️ Skrócono: ${source.url.substring(0, 50)}... z ${source.scrapedText.length.toLocaleString()} do ${charsPerSource.toLocaleString()} znaków`
      );
    } else {
      console.log(
        `   ✅ Dodano: ${source.url.substring(0, 50)}... (${textToUse.length.toLocaleString()} znaków - bez przycinania)`
      );
    }

    limitedSources.push({
      url: source.url,
      textLength: textToUse.length,
      text: textToUse,
      snippet: textToUse.substring(0, 300),
      truncated: wasTruncated,
    });

    totalLength += textToUse.length;
  }

  console.log(`\n📊 PODSUMOWANIE ŹRÓDEŁ:`);
  console.log(`   Użyte źródła: ${limitedSources.length}`);
  console.log(`   Łączna długość: ${totalLength.toLocaleString()} znaków`);
  console.log(
    `   Średnia na źródło: ${Math.round(totalLength / limitedSources.length).toLocaleString()} znaków`
  );
  console.log(
    `   Zapełnienie limitu: ${((totalLength / maxChars) * 100).toFixed(1)}%\n`
  );

  return { sources: limitedSources, totalLength };
};

/**
 * Wygeneruj strukturę dla prac INNYCH (nie mgr/lic)
 */

const generateStructureForOther = async (orderedText, limitedSources) => {
  console.log(`🏗️ Generuję strukturę dla: ${orderedText.rodzajTresci}`);

  const sourcesText = limitedSources.sources
    .map((source, idx) => {
      return `ŹRÓDŁO ${idx + 1}:\nURL: ${source.url}\nTreść:\n"${source.text}"\n`;
    })
    .join('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 🆕 NOWA FORMUŁA - 1 nagłówek na ~2000 znaków
  const length = orderedText.liczbaZnakow;
  let headersCount = Math.max(3, Math.round(length / 2000)); // Minimum 3 nagłówki

  // Maksimum 20 nagłówków (dla bardzo długich tekstów)
  headersCount = Math.min(20, headersCount);

  console.log(
    `   📋 Długość: ${length} znaków → ${headersCount} nagłówków (~${Math.round(length / headersCount)} znaków/nagłówek)`
  );

  // 🆕 Dostosuj szczegółowość opisów
  const descriptionDetail =
    length < 5000
      ? 'Opisz zwięźle (1-2 zdania) o czym ma być ta sekcja.'
      : length < 10000
        ? 'Opisz (2-3 zdania) jakie informacje i przykłady mają się znaleźć w tej sekcji.'
        : 'Opisz wyczerpująco (3-5 zdań) jakie konkretne informacje, fakty, argumenty i przykłady mają się znaleźć w tej sekcji.';

  const prompt = `${sourcesText ? sourcesText + '\n\n' : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[KONIEC ŹRÓDEŁ]

${sourcesText ? 'Powyżej w cudzysłowach znajdziesz źródła - są one chronione prawami autorskimi, więc NIE możesz powtarzać 1:1, słowo w słowo zawartych w tych źródłach informacji. Traktuj je jako bibliografię, inspirację czy ogólny wskaźnik tego, jak należy pisać.' : 'Nie dodano źródeł - korzystaj z własnej wiedzy i doświadczenia.'}

Korzystaj z ${sourcesText ? 'zacytowanych źródeł, o ile są dodane, a także z ' : ''}własnej wiedzy i doświadczenia i stwórz na ich podstawie strukturę nagłówków H2 dla tekstu na podany temat:

**TEMAT:** ${orderedText.temat}

**RODZAJ TREŚCI:** ${orderedText.rodzajTresci}

**DŁUGOŚĆ:** ${orderedText.liczbaZnakow} znaków (${orderedText.dlugoscTekstu})

**JĘZYK:** ${orderedText.jezyk}

${orderedText.wytyczneIndywidualne ? `**WYTYCZNE OD UŻYTKOWNIKA:**\n${orderedText.wytyczneIndywidualne}\n[KONIEC WYTYCZNYCH]\n` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**TWOJE ZADANIE:**

Podczas tworzenia struktury skup się wyłącznie na tym konkretnym temacie. Przeanalizuj założenia tego tematu i przemyśl, w jaki sposób je najlepiej zrealizować.

**ZASADY TWORZENIA STRUKTURY:**

1. **NIE uwzględniaj** w tej strukturze wstępu ani zakończenia - wyłącznie merytoryczne informacje
2. Zadbaj o spis treści dotyczący WYŁĄCZNIE WSKAZANEGO TEMATU I RODZAJU TREŚCI
3. Skupiaj się WYŁĄCZNIE na sednie tematu wskazanym w wytycznych
4. Nagłówki muszą poruszać wyraźnie różne zagadnienia odnoszące się do sedna tematu
5. BEZ ŻADNYCH PODSUMOWAŃ I OGÓLNYCH WNIOSKÓW - one będą tworzone odrębnie!
6. Cała struktura MUSI BYĆ SPÓJNA
7. Każdy nagłówek powinien pozwalać na napisanie około ${Math.round(length / headersCount)} znaków treści pod nim

**FORMAT ODPOWIEDZI:**

Każdy nagłówek zapisz w formacie:

<h2>Nagłówek 1: [Konkretny, chwytliwy tytuł - max 5 słów]</h2>
<p>${descriptionDetail}</p>

<h2>Nagłówek 2: [Konkretny, chwytliwy tytuł - max 5 słów]</h2>
<p>${descriptionDetail}</p>

[...i tak dalej]

**WAŻNE:**
- Umieść w swojej strukturze DOKŁADNIE ${headersCount} nagłówków H2
- Ponumeruj je od 1 wzwyż
- Każdy nagłówek w nowej linii z pustą linią między nimi
- Tytuły muszą być konkretne - NIE pisz "Nagłówek H2", tylko konkretne hasło
- Całą strukturę zapisz w języku: ${orderedText.jezyk}

Rozpocznij pisanie od pierwszego nagłówka i zakończ na ostatnim. Nic poza strukturą nie pisz.`;

  console.log(`   📤 Wysyłam prompt do Claude (${prompt.length} znaków)...\n`);

  const startTime = Date.now();

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const generationTime = Date.now() - startTime;
    const structure = message.content[0].text;

    console.log(
      `   ✅ Struktura wygenerowana w ${(generationTime / 1000).toFixed(2)}s`
    );
    console.log(`   📊 Długość struktury: ${structure.length} znaków`);
    console.log(
      `   🔢 Tokens użyte: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out\n`
    );

    const h2Count = (structure.match(/<h2>/gi) || []).length;
    console.log(`   📋 Znaleziono nagłówków H2: ${h2Count}\n`);

    return {
      structure,
      headersCount: h2Count,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      generationTime,
      promptUsed: prompt,
    };
  } catch (error) {
    console.error('❌ Błąd generowania struktury:', error);
    throw error;
  }
};

/**
 * Główna funkcja generowania struktury
 */
const generateStructure = async (orderedTextId) => {
  try {
    console.log(`\n🎯 === GENEROWANIE STRUKTURY ===`);
    console.log(`OrderedText ID: ${orderedTextId}\n`);

    // 1. Pobierz OrderedText
    const orderedText = await OrderedText.findById(orderedTextId);
    if (!orderedText) {
      throw new Error('OrderedText nie znaleziony');
    }

    console.log(`📄 Temat: ${orderedText.temat}`);
    console.log(`📏 Długość: ${orderedText.liczbaZnakow} znaków`);
    console.log(`📝 Rodzaj: ${orderedText.rodzajTresci}\n`);

    // 2. Określ typ pracy
    const workType = determineWorkType(orderedText.rodzajTresci);
    console.log(`🎓 Typ pracy: ${workType.toUpperCase()}\n`);

    // 3. Pobierz wybrane źródła
    const selectedSources = await ScrapedContent.find({
      orderedTextId,
      selectedForGeneration: true,
      status: 'completed',
    }).sort({ createdAt: 1 });

    console.log(`📚 Wybrane źródła: ${selectedSources.length}`);

    // 4. Ogranicz źródła do 100 000 znaków
    const { sources: limitedSources, totalLength } =
      limitSources(selectedSources);

    // 5. Wygeneruj strukturę w zależności od typu
    let structureData;

    if (workType === 'other') {
      structureData = await generateStructureForOther(orderedText, {
        sources: limitedSources,
      });

      // 6. Zapisz strukturę w bazie (tylko dla 'other')
      const textStructure = await TextStructure.create({
        orderedTextId,
        idZamowienia: orderedText.idZamowienia,
        itemId: orderedText.itemId,
        workType,
        usedSources: limitedSources.map((s) => ({
          url: s.url,
          textLength: s.textLength,
          snippet: s.snippet,
          truncated: s.truncated,
        })),
        totalSourcesLength: totalLength,
        structure: structureData.structure,
        headersCount: structureData.headersCount,
        status: 'completed',
        generationTime: structureData.generationTime,
        tokensUsed: structureData.tokensUsed,
        promptUsed: structureData.promptUsed,
      });

      console.log(`✅ Struktura zapisana w bazie (ID: ${textStructure._id})\n`);
      console.log(`🎉 === GENEROWANIE STRUKTURY ZAKOŃCZONE ===\n`);

      return textStructure;
    } else if (workType === 'lic' || workType === 'mgr') {
      // 🎓 DELEGUJ DO AKADEMICKIEGO SERWISU
      console.log(
        `🎓 Typ ${workType.toUpperCase()} - delegacja do academicWorkService\n`
      );

      const academicWorkService = require('./academicWorkService');
      const academicWork = await academicWorkService.generateAcademicWork(
        orderedText._id
      );

      // Zwróć AcademicWork zamiast TextStructure
      // (academicWorkService już zsynchronizował z Order)
      console.log(
        `✅ Praca ${workType.toUpperCase()} ukończona przez academicWorkService\n`
      );

      return academicWork;
    }
  } catch (error) {
    console.error('❌ Błąd podczas generowania struktury:', error);

    // Zapisz błąd w bazie
    await TextStructure.findOneAndUpdate(
      { orderedTextId },
      {
        status: 'failed',
        errorMessage: error.message,
      },
      { upsert: true }
    );

    throw error;
  }
};

module.exports = {
  generateStructure,
  determineWorkType,
  limitSources,
};
