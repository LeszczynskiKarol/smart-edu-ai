// backend/src/services/contentGenerationService.js

const Anthropic = require('@anthropic-ai/sdk');
const OrderedText = require('../models/OrderedText');
const TextStructure = require('../models/TextStructure');
const ScrapedContent = require('../models/ScrapedContent');
const GeneratedTextContent = require('../models/GeneratedTextContent');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Mapowanie języków na pełne nazwy
 */
const languageMap = {
  polish: 'Polski',
  english: 'Angielski',
  german: 'Niemiecki',
  spanish: 'Hiszpański',
  french: 'Francuski',
  italian: 'Włoski',
};

/**
 * Wytyczne stylistyczne dla różnych rodzajów treści
 */
const getStyleGuidelines = (rodzajTresci) => {
  const lowerType = rodzajTresci.toLowerCase();

  if (lowerType.includes('artykuł')) {
    return 'Pisz w sposób przystępny, angażujący i wartościowy dla czytelnika. Używaj konkretnych przykładów i faktów. Unikaj ogólników.';
  }

  if (lowerType.includes('opis produktu')) {
    return 'Pisz w sposób przekonujący, podkreślając korzyści i unikalne cechy produktu. Używaj języka sprzedażowego, ale profesjonalnego.';
  }

  if (
    lowerType.includes('post') ||
    lowerType.includes('media społecznościowe')
  ) {
    return 'Pisz w sposób zwięzły, angażujący i przyjazny. Używaj aktywnego języka i zwracaj się bezpośrednio do odbiorcy.';
  }

  if (lowerType.includes('magister') || lowerType.includes('mgr')) {
    return 'Pisz w sposób akademicki, formalny i obiektywny. Używaj precyzyjnego języka naukowego. Opieraj się na źródłach i literaturze przedmiotu.';
  }

  if (lowerType.includes('licencjat') || lowerType.includes('lic')) {
    return 'Pisz w sposób akademicki, ale przystępniejszy niż w pracy magisterskiej. Zachowaj formalizm i obiektywizm.';
  }

  return 'Pisz w sposób profesjonalny, poprawny językowo i dostosowany do kontekstu.';
};

/**
 * Wygeneruj pełną treść dla "OTHER" (nie mgr/lic)
 */
const generateContentForOther = async (
  orderedText,
  textStructure,
  limitedSources
) => {
  console.log(`\n✍️ === GENEROWANIE TREŚCI ===`);
  console.log(`Typ: ${orderedText.rodzajTresci}`);
  console.log(`Długość docelowa: ${orderedText.liczbaZnakow} znaków\n`);

  // Formatuj źródła
  const sourcesText = limitedSources
    .map((source, idx) => {
      return `ŹRÓDŁO ${idx + 1}:\nURL: ${source.url}\nTreść:\n"${source.text}"\n`;
    })
    .join('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Wytyczne stylistyczne
  const styleGuidelines = getStyleGuidelines(orderedText.rodzajTresci);

  // 🆕 Oblicz proporcje dla każdej sekcji
  const headersCount = textStructure.headersCount;
  const targetCharsPerSection = Math.floor(
    orderedText.liczbaZnakow / headersCount
  );

  // 🆕 Wytyczne dot. list i tabel
  const visualElementsGuidelines = `
**ELEMENTY WIZUALNE:**

1. **Listy wypunktowane:**
   - Używaj list wypunktowanych rozsądnie - około JEDNA lista na dwie strony - OBOWIĄZKOWO
   - Lista powinna mieć 3-7 punktów
   - Użyj znaczników <ul> i <li>
   - Listy powinny być w miejscach, gdzie wyliczasz cechy, korzyści, kroki

2. **Tabele (opcjonalnie):**
   - Dla tekstów co najmniej o długości 10 000 znaków możesz użyć 1-2 tabel - JEDNA OBOWIĄZKOWO
   - Tabele używaj gdy porównujesz coś lub pokazujesz dane
   - Użyj znaczników HTML: <table>, <tr>, <td>, <th>
   - Dodaj style inline dla przejrzystości: border, padding
   - NIE używaj tabel jeśli tekst jest krótszy niż 10,000 znaków
`;

  const prompt = `${sourcesText ? sourcesText + '\n\n' : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[KONIEC ŹRÓDEŁ]

${
  sourcesText
    ? `WAŻNE ZASADY PRACY ZE ŹRÓDŁAMI:
- Źródła powyżej w cudzysłowach są chronione prawami autorskimi
- ABSOLUTNIE NIE kopiuj 1:1 żadnych fragmentów
- Nie powtarzaj słowo w słowo zawartych w źródłach informacji
- Traktuj je jako inspirację, kontekst i wskaźnik jak pisać
- Możesz się na nich opierać, ale MUSISZ przekazać informacje własnymi słowami
- Nie cytuj bezpośrednio - przeformułuj, zinterpretuj, przetłumacz na własny język

`
    : 'Nie dodano źródeł - korzystaj z własnej wiedzy i doświadczenia.\n\n'
}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**INFORMACJE O ZADANIU:**

**TEMAT:** ${orderedText.temat}
**RODZAJ TREŚCI:** ${orderedText.rodzajTresci}
**DŁUGOŚĆ DOCELOWA:** ${orderedText.liczbaZnakow} znaków (TO JEST BARDZO WAŻNE!)
**JĘZYK:** ${languageMap[orderedText.jezyk] || orderedText.jezyk}

${orderedText.wytyczneIndywidualne ? `**WYTYCZNE OD KLIENTA:**\n${orderedText.wytyczneIndywidualne}\n\n` : ''}**WYTYCZNE STYLISTYCZNE:**
${styleGuidelines}

${visualElementsGuidelines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**STRUKTURA DO REALIZACJI:**

${textStructure.structure}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**TWOJE ZADANIE:**

Napisz pełną treść dla każdej sekcji zgodnie z powyższą strukturą.

**ZASADY PISANIA:**

1. **ORYGINALNOŚĆ:**
   - Piszesz WŁASNYM JĘZYKIEM, własnymi słowami
   - NIE kopiujesz żadnych fragmentów ze źródeł
   - Nawet jeśli wyrażasz tę samą myśl - użyj innych słów, innej konstrukcji zdania
   - To MUSI być oryginalny tekst napisany od zera

2. **JĘZYK I POPRAWNOŚĆ:**
   - Pisz w języku: ${languageMap[orderedText.jezyk] || orderedText.jezyk}
   - Zachowaj pełną poprawność gramatyczną i ortograficzną
   - Używaj naturalnego, płynnego języka
   - Unikaj błędów językowych i stylistycznych

3. **STYL I TON:**
   - Dostosuj styl do rodzaju treści: ${orderedText.rodzajTresci}
   - ${styleGuidelines}
   - Zachowaj spójny ton wypowiedzi w całym tekście

4. **STRUKTURA:**
   - Realizuj dokładnie strukturę podaną powyżej
   - Każdy nagłówek umieść w znacznikach <h2>Tytuł</h2>
   - Pod każdym nagłówkiem napisz wyczerpującą treść zgodną z opisem
   - Długość każdej sekcji: około ${targetCharsPerSection} znaków (±20%)

5. **DŁUGOŚĆ - BARDZO WAŻNE:**
   - **DOKŁADNY CEL: ${orderedText.liczbaZnakow} znaków dla całego tekstu**
   - To oznacza około ${targetCharsPerSection} znaków na każdą z ${headersCount} sekcji
   - Rozłóż treść RÓWNOMIERNIE między wszystkie sekcje
   - Każda sekcja powinna być wyczerpująca, ale proporcjonalna
   - NIE pisz znacznie więcej niż ${orderedText.liczbaZnakow} znaków - maksymalnie +20%
   - Kontroluj długość na bieżąco i dostosowuj szczegółowość

6. **FORMAT ODPOWIEDZI:**
   - Pisz w formacie HTML
   - Użyj znaczników: <h2>, <p>, <strong>, <em>, <ul>, <li>, <table> (gdzie właściwe)
   - NIE dodawaj wstępu ani zakończenia - tylko nagłówki ze struktury i treść pod nimi
   - Zacznij od pierwszego nagłówka, zakończ na ostatnim

**PRZYPOMNIENIE O DŁUGOŚCI:**
Kontroluj długość tekstu! Pisz około ${targetCharsPerSection} znaków pod każdym nagłówkiem. 
Jeśli zauważysz, że przekraczasz limit - skróć szczegóły, bądź bardziej zwięzły.
Cel: ${orderedText.liczbaZnakow} znaków (maksymalnie ${Math.round(orderedText.liczbaZnakow * 1.2)} znaków).

**ROZPOCZNIJ PISANIE:**`;

  console.log(
    `   📤 Wysyłam prompt do Claude Pisarza (${prompt.length} znaków)...\n`
  );

  // 🆕 Oblicz potrzebne tokeny dynamicznie
  const estimatedTokens = Math.min(
    200000,
    Math.ceil((orderedText.liczbaZnakow * 1.3) / 2) // ~2 znaki = 1 token w polskim
  );

  const startTime = Date.now();

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: estimatedTokens,
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }],
    });

    const generationTime = Date.now() - startTime;
    const fullContent = message.content[0].text;

    console.log(
      `   ✅ Treść wygenerowana w ${(generationTime / 1000).toFixed(2)}s`
    );
    console.log(`   📊 Długość tekstu: ${fullContent.length} znaków`);
    console.log(`   🎯 Cel: ${orderedText.liczbaZnakow} znaków`);
    console.log(
      `   📏 Różnica: ${fullContent.length - orderedText.liczbaZnakow} znaków (${Math.round((fullContent.length / orderedText.liczbaZnakow - 1) * 100)}%)`
    );
    console.log(
      `   🔢 Tokens użyte: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out\n`
    );

    const wordCount = fullContent.split(/\s+/).length;
    console.log(`   📝 Liczba słów: ${wordCount}\n`);

    return {
      fullContent,
      totalCharacters: fullContent.length,
      totalWords: wordCount,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      generationTime,
      promptUsed: prompt, // 🆕 Zapisz prompt
    };
  } catch (error) {
    console.error('❌ Błąd generowania treści:', error);
    throw error;
  }
};

/**
 * Główna funkcja generowania treści
 */
const generateContent = async (orderedTextId) => {
  try {
    console.log(`\n📝 === GENEROWANIE PEŁNEJ TREŚCI ===`);
    console.log(`OrderedText ID: ${orderedTextId}\n`);

    // 1. Pobierz OrderedText
    const orderedText = await OrderedText.findById(orderedTextId);
    if (!orderedText) {
      throw new Error('OrderedText nie znaleziony');
    }

    // 2. Pobierz strukturę
    const textStructure = await TextStructure.findOne({
      orderedTextId,
      status: 'completed',
    });

    if (!textStructure) {
      throw new Error('Struktura nie została jeszcze wygenerowana');
    }

    console.log(`📄 Temat: ${orderedText.temat}`);
    console.log(`🏗️ Struktura: ${textStructure.headersCount} nagłówków\n`);

    // 3. Pobierz źródła (te same co dla struktury)
    const selectedSources = await ScrapedContent.find({
      orderedTextId,
      selectedForGeneration: true,
      status: 'completed',
    }).sort({ createdAt: 1 });

    // 🆕 Limituj źródła używając funkcji z structureGenerationService
    const structureService = require('./structureGenerationService');
    let limitedSources;

    if (
      structureService.limitSources &&
      typeof structureService.limitSources === 'function'
    ) {
      const { sources } = structureService.limitSources(selectedSources);
      limitedSources = sources;
    } else {
      // Fallback jeśli funkcja nie istnieje
      limitedSources = selectedSources.map((s) => ({
        url: s.url,
        text: s.scrapedText,
        textLength: s.scrapedText.length,
      }));
    }

    console.log(`📏 Limitowanie źródeł do 30 000 znaków...`);
    limitedSources.forEach((source, idx) => {
      console.log(
        `   ✅ Źródło ${idx + 1}: ${source.url.substring(0, 50)}... (${source.textLength || source.text?.length || 0} znaków)`
      );
    });

    console.log(`\n📊 PODSUMOWANIE ŹRÓDEŁ:`);
    console.log(`   Użyte źródła: ${limitedSources.length}`);
    console.log(
      `   Łączna długość: ${limitedSources.reduce((sum, s) => sum + (s.textLength || s.text?.length || 0), 0).toLocaleString()} znaków`
    );
    console.log(
      `   Średnia na źródło: ${Math.round(limitedSources.reduce((sum, s) => sum + (s.textLength || s.text?.length || 0), 0) / limitedSources.length).toLocaleString()} znaków\n`
    );

    // 4. Wygeneruj treść
    const contentData = await generateContentForOther(
      orderedText,
      textStructure,
      limitedSources
    );

    // 5. Zapisz w bazie
    const generatedContent = await GeneratedTextContent.create({
      orderedTextId,
      textStructureId: textStructure._id,
      idZamowienia: orderedText.idZamowienia,
      itemId: orderedText.itemId,
      fullContent: contentData.fullContent,
      totalWords: contentData.totalWords,
      totalCharacters: contentData.totalCharacters,
      status: 'completed',
      generationTime: contentData.generationTime,
      tokensUsed: contentData.tokensUsed,
      promptUsed: contentData.promptUsed,
    });

    console.log(`✅ Treść zapisana w bazie (ID: ${generatedContent._id})\n`);

    console.log(`🎉 === GENEROWANIE TREŚCI ZAKOŃCZONE ===\n`);

    // 🆕 6. AKTUALIZUJ STATUS ORDEREDTEXT NA "Zakończone"
    await OrderedText.findByIdAndUpdate(orderedTextId, {
      status: 'Zakończone',
      completedAt: new Date(),
    });

    console.log(`✅ Status OrderedText zaktualizowany na "Zakończone"\n`);
    console.log(`🎉 === GENEROWANIE TREŚCI ZAKOŃCZONE ===\n`);

    return generatedContent;
  } catch (error) {
    console.error('❌ Błąd podczas generowania treści:', error);

    // Zapisz błąd
    await GeneratedTextContent.findOneAndUpdate(
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
  generateContent,
};
