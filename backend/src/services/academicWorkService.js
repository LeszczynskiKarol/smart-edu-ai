// backend/src/services/academicWorkService.js
const Anthropic = require('@anthropic-ai/sdk');
const OrderedText = require('../models/OrderedText');
const AcademicWork = require('../models/AcademicWork');
const ScrapedContent = require('../models/ScrapedContent');
const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { generateEmailTemplate } = require('../utils/emailTemplate');
const i18n = require('../../src/config/i18n');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Konwertuj Markdown na HTML (jeśli Claude zwróci markdown zamiast HTML)
 */
const convertMarkdownToHTML = (text) => {
  if (!text) return text;

  // Sprawdź czy to markdown (jeśli zawiera # na początku linii)
  const isMarkdown = /^#+\s/m.test(text);

  if (!isMarkdown) {
    return text; // Już jest HTML
  }

  console.log('   ⚠️  Wykryto Markdown - konwertuję na HTML...');

  let html = text;

  // Konwersja nagłówków
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Konwersja paragrafów (linie tekstu bez tagów)
  html = html
    .split('\n')
    .map((line) => {
      // Jeśli linia nie jest pusta i nie zaczyna się od HTML tagu
      if (line.trim() && !line.trim().startsWith('<')) {
        return `<p>${line}</p>`;
      }
      return line;
    })
    .join('\n');

  // Konwersja bold i italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Usuń puste paragrafy
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
};

/**
 * Mapowanie języków
 */
const languageMap = {
  // Stare formaty (dla kompatybilności wstecznej)
  polish: 'Polski',
  polski: 'Polski',
  english: 'Angielski',
  angielski: 'Angielski',
  german: 'Niemiecki',
  niemiecki: 'Niemiecki',

  // Nowe formaty - 3-literowe kody
  pol: 'Polski',
  eng: 'Angielski',
  ger: 'Niemiecki',
  ukr: 'Ukraiński',
  fra: 'Francuski',
  esp: 'Hiszpański',
  ros: 'Rosyjski',
  por: 'Portugalski',

  // Dodatkowe warianty
  ukrainian: 'Ukraiński',
  ukraiński: 'Ukraiński',
  french: 'Francuski',
  francuski: 'Francuski',
  spanish: 'Hiszpański',
  hiszpański: 'Hiszpański',
  russian: 'Rosyjski',
  rosyjski: 'Rosyjski',
  portuguese: 'Portugalski',
  portugalski: 'Portugalski',
};

/**
 * KROK 1: Wygeneruj spis treści całej pracy
 * Prompt oparty na Make.com
 */
const generateTableOfContents = async (orderedText, sources) => {
  console.log(`📋 === GENEROWANIE SPISU TREŚCI ===`);
  const workType = orderedText.rodzajTresci.toLowerCase().includes('magister')
    ? 'mgr'
    : 'lic';
  const chaptersCount = workType === 'mgr' ? 4 : 3;
  const sourcesText = formatSourcesForPrompt(sources);

  const prompt = `
${sourcesText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[KONIEC ŹRÓDEŁ]

TEMAT PRACY: ${orderedText.temat}
TYP: ${workType === 'mgr' ? 'Praca magisterska' : 'Praca licencjacka'}
JĘZYK: ${orderedText.jezyk}

**ZADANIE:**
Stwórz szczegółową strukturę ${chaptersCount} rozdziałów merytorycznych dla tej pracy.

**🚨 KRYTYCZNE WYMAGANIA STRUKTURALNE:**

${
  chaptersCount === 4
    ? `**PRACA MAGISTERSKA - OBOWIĄZKOWA STRUKTURA:**
- ROZDZIAŁ 1: Podstawy teoretyczne (przegląd literatury, koncepcje, modele)
- ROZDZIAŁ 2: Uwarunkowania i czynniki (osobowościowe, społeczne, kontekstualne)
- **ROZDZIAŁ 3: BADANIA EMPIRYCZNE** (OBOWIĄZKOWY - metodologia, analiza danych, wyniki)
- ROZDZIAŁ 4: Zastosowania praktyczne (konsekwencje, strategie, implikacje)

**ROZDZIAŁ 3 MUSI ZAWIERAĆ:**
- Metodologię badań (przegląd systematyczny ALBO metaanaliza ALBO studium przypadków)
- Kryteria doboru źródeł/badań
- Proces analizy danych
- Przedstawienie konkretnych wyników badań
- Krytyczną dyskusję ograniczeń metodologicznych
- Porównanie wyników różnych badań (korelacja vs przyczynowość)`
    : `**PRACA LICENCJACKA - OBOWIĄZKOWA STRUKTURA:**
- ROZDZIAŁ 1: Podstawy teoretyczne (przegląd literatury, koncepcje, modele)
- ROZDZIAŁ 2: Uwarunkowania i aspekty praktyczne (czynniki, zastosowania)
- **ROZDZIAŁ 3: ANALIZA EMPIRYCZNA** (OBOWIĄZKOWY - przegląd badań, analiza wyników, wnioski)

**ROZDZIAŁ 3 MUSI ZAWIERAĆ:**
- Przegląd kluczowych badań w obszarze
- Metodologie stosowane w badaniach (ze wskazaniem mocnych i słabych stron)
- Syntezę wyników z różnych źródeł
- Krytyczną analizę ograniczeń badań
- Wnioski praktyczne oparte na danych`
}

**WYMAGANIA MERYTORYCZNE:**

1. **RÓWNOMIERNA GŁĘBOKOŚĆ:**
   - Każdy rozdział z 4-6 podrozdziałami o PODOBNEJ długości
   - Unikaj rozdysponowania: jeden rozdział 8 podrozdziałów, inny 3
   - Każdy podrozdział powinien mieć podobną wagę tematyczną

2. **KRYTYCZNE PODEJŚCIE:**
   - W opisach podrozdziałów ZAWSZE uwzględnij:
     * "Omówienie teorii X oraz krytyczna analiza jej ograniczeń"
     * "Przegląd badań Y z uwzględnieniem problemów metodologicznych"
     * "Dyskusja sprzecznych wyników różnych badań"
   - NIE pisz tylko pozytywnie - wskaż problemy, luki, sprzeczności

3. **KONKRETNOŚĆ:**
   - Tytuły podrozdziałów muszą być KONKRETNE, nie ogólne
   - ❌ ZŁE: "Czynniki wpływające na zjawisko"
   - ✅ DOBRE: "Wpływ narcyzmu i potrzeby aprobacji społecznej na uzależnienie od mediów społecznościowych"

4. **STRUKTURA KAŻDEGO PODROZDZIAŁU:**
   - Wprowadzenie do tematu
   - Przegląd teorii/badań
   - **KRYTYCZNA ANALIZA** (to jest kluczowe!)
   - Praktyczne przykłady/zastosowania
   - Wnioski i przejście do następnej części

**FORMAT ODPOWIEDZI (HTML):**

<h2>ROZDZIAŁ 1: [PEŁNY TYTUŁ ROZDZIAŁU]</h2>

<h3>1.1. [Konkretny tytuł podrozdziału]</h3>
<p><strong>Zakres tematyczny:</strong> [2-3 zdania o tym, co będzie omówione]</p>
<p><strong>Kluczowe teorie/badania:</strong> [Wymień główne koncepcje do omówienia]</p>
<p><strong>Podejście krytyczne:</strong> [Jakie ograniczenia/problemy zostaną przeanalizowane]</p>
<p><strong>Praktyczne przykłady:</strong> [Jakie konkretne zastosowania/przypadki będą przedstawione]</p>

<h3>1.2. [Tytuł podrozdziału]</h3>
<p>...</p>

[...kolejne podrozdziały - pamiętaj o RÓWNOMIERNYM rozkładzie!]

<h2>ROZDZIAŁ 2: [TYTUŁ]</h2>
[...]

**ROZDZIAŁ 3 - PRZYKŁAD STRUKTURY BADAWCZEJ:**

<h2>ROZDZIAŁ 3: ${
    chaptersCount === 4
      ? 'BADANIA EMPIRYCZNE NAD [TEMAT]'
      : 'PRZEGLĄD I ANALIZA BADAŃ EMPIRYCZNYCH'
  }</h2>

<h3>3.1. Metodologia badań w obszarze [temat]</h3>
<p><strong>Zakres:</strong> Przegląd głównych paradygmatów badawczych, metod ilościowych i jakościowych stosowanych w badaniach nad [temat]. Krytyczna analiza mocnych i słabych stron każdego podejścia.</p>
<p><strong>Aspekty metodologiczne:</strong> Kwestionariusze diagnostyczne, badania neurobiologiczne (fMRI, PET), studia longitudinalne, metaanalizy.</p>
<p><strong>Krytyka:</strong> Problem korelacji vs przyczynowości, ograniczenia badań przekrojowych, problemy z reprezentatywnością prób.</p>

<h3>3.2. Kryteria doboru i oceny jakości badań</h3>
<p><strong>Zakres:</strong> Systematyczne kryteria włączania badań do przeglądu, ocena jakości metodologicznej, identyfikacja potencjalnych błędów systematycznych.</p>
<p><strong>Narzędzia:</strong> Skale oceny jakości badań (np. STROBE, PRISMA), analiza biasów publikacyjnych.</p>

<h3>3.3. Przegląd wyników kluczowych badań empirycznych</h3>
<p><strong>Zakres:</strong> Szczegółowa analiza 10-15 najważniejszych badań w obszarze. Dla każdego: metodologia, próba, główne wyniki, ograniczenia.</p>
<p><strong>Podejście:</strong> Porównanie wyników sprzecznych badań, identyfikacja wzorców i rozbieżności.</p>

<h3>3.4. Metaanaliza i synteza wyników</h3>
<p><strong>Zakres:</strong> Ilościowe zestawienie wielkości efektów z różnych badań, analiza heterogeniczności wyników, identyfikacja moderatorów.</p>
<p><strong>Wnioski:</strong> Jakie wnioski można wyciągnąć z całości badań? Co jest potwierdzone, a co pozostaje kontrowersyjne?</p>

<h3>3.5. Ograniczenia metodologiczne i luki badawcze</h3>
<p><strong>Zakres:</strong> KRYTYCZNA analiza ograniczeń istniejących badań: problemy z pomiarem, brak badań longitudinalnych, nadreprezentacja pewnych grup demograficznych.</p>
<p><strong>Propozycje:</strong> Jakie badania są potrzebne w przyszłości? Jakie pytania pozostają bez odpowiedzi?</p>

<h3>3.6. Implikacje praktyczne wyników badań</h3>
<p><strong>Zakres:</strong> Co wyniki badań oznaczają dla praktyki? Jakie rekomendacje wynikają z dostępnych danych empirycznych?</p>

**TERAZ ROZPOCZNIJ TWORZENIE SPISU TREŚCI:**
`;

  console.log(`   📤 Wysyłam prompt do Claude (${prompt.length} znaków)...`);
  const startTime = Date.now();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 12000, // Zwiększone dla bardziej szczegółowego TOC
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }],
  });

  const generationTime = Date.now() - startTime;
  const fullStructure = convertMarkdownToHTML(message.content[0].text); // ← Dodaj konwersję

  console.log(
    `   ✅ Struktura wygenerowana w ${(generationTime / 1000).toFixed(2)}s`
  );
  console.log(`   📊 Długość: ${fullStructure.length} znaków`);
  console.log(
    `   🔢 Tokens: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out\n`
  );

  const simpleToC = extractSimpleTableOfContents(fullStructure);

  return {
    fullStructure,
    simpleToC,
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    generationTime,
    promptUsed: prompt,
  };
};

const extractSimpleTableOfContents = (fullStructure) => {
  const lines = [];

  // Regex do wyciągania nagłówków
  const h2Regex = /<h2>(ROZDZIAŁ \d+: .+?)<\/h2>/g;
  const h3Regex = /<h3>(\d+\.\d+\. .+?)<\/h3>/g;

  // Wyciągnij wszystkie nagłówki H2 (rozdziały)
  let match;
  while ((match = h2Regex.exec(fullStructure)) !== null) {
    lines.push(match[1]); // Dodaj tytuł rozdziału

    // Znajdź pozycję tego rozdziału
    const chapterStart = match.index;
    const nextChapter = fullStructure.indexOf('<h2>', chapterStart + 1);
    const chapterEnd = nextChapter === -1 ? fullStructure.length : nextChapter;
    const chapterContent = fullStructure.substring(chapterStart, chapterEnd);

    // Wyciągnij wszystkie H3 (podrozdziały) z tego rozdziału
    const h3s = [...chapterContent.matchAll(h3Regex)];
    h3s.forEach((h3Match) => {
      lines.push('  ' + h3Match[1]); // Dodaj z wcięciem
    });

    lines.push(''); // Pusta linia po rozdziale
  }

  return lines.join('\n');
};

/**
 * Wyciągnij treść konkretnego rozdziału ze spisu treści
 */
const extractChapterFromTOC = (tableOfContents, chapterNumber) => {
  // Szukaj "ROZDZIAŁ X" w HTML
  const chapterRegex = new RegExp(
    `<h2>ROZDZIAŁ ${chapterNumber}:?[^<]*</h2>([\\s\\S]*?)(?=<h2>ROZDZIAŁ ${chapterNumber + 1}|$)`,
    'i'
  );
  const match = tableOfContents.match(chapterRegex);

  if (match) {
    return match[0]; // Zwróć cały fragment z nagłówkiem
  }

  // Fallback - zwróć cały TOC jeśli nie znaleziono
  return tableOfContents;
};

/**
 * KROK 2-5: Wygeneruj CAŁY ROZDZIAŁ
 * Prompt oparty na Make.com (pisarz)
 */
const generateChapter = async (
  chapterNumber,
  tableOfContents,
  orderedText,
  sources
) => {
  console.log(`\n📝 === GENEROWANIE ROZDZIAŁU ${chapterNumber} ===`);

  const workType = orderedText.rodzajTresci.toLowerCase().includes('magister')
    ? 'magisterskiej'
    : 'licencjackiej';

  const chaptersCount = workType === 'magisterskiej' ? 4 : 3;

  const chapterGuidelines = extractChapterFromTOC(
    tableOfContents,
    chapterNumber
  );
  const sourcesText = formatSourcesForPrompt(sources);

  // ✅ POPRAWIONA LOGIKA - tylko R3 może być empiryczny
  const chapterTitle =
    chapterGuidelines.match(/<h2>ROZDZIAŁ \d+: (.+?)<\/h2>/i)?.[1] || '';
  const chapterTitleLower = chapterTitle.toLowerCase();

  // 🔥 KRYTYCZNA ZMIANA:
  // R1 → ZAWSZE teoretyczny
  // R2 → teoretyczny/praktyczny
  // R3 → empiryczny (dla LIC i MGR)
  // R4 → praktyczny (tylko MGR)

  const isTheoreticalChapter = chapterNumber === 1; // R1 NIGDY empiryczny

  const isEmpiricalChapter =
    chapterNumber === 3 && // Tylko R3
    (chapterTitleLower.includes('badani') ||
      chapterTitleLower.includes('empiryczny') ||
      chapterTitleLower.includes('metodolog') ||
      chapterTitleLower.includes('przegląd badań') ||
      chapterTitleLower.includes('analiza badań') ||
      chapterTitleLower.includes('wyniki badań'));

  const prompt = `Wciel się w rolę PISARZA pracy ${workType} i napisz CAŁY ROZDZIAŁ ${chapterNumber} zgodnie z poniższymi wytycznymi.

[TEMAT PRACY]
${orderedText.temat}
[/TEMAT PRACY]

[SPIS TREŚCI CAŁEJ PRACY]
${tableOfContents}
[/SPIS TREŚCI CAŁEJ PRACY]

[STRUKTURA DLA TEGO ROZDZIAŁU]
${chapterGuidelines}
[/STRUKTURA DLA TEGO ROZDZIAŁU]

${
  orderedText.wytyczneIndywidualne
    ? `[WYTYCZNE ZAMAWIAJĄCEGO]
${orderedText.wytyczneIndywidualne}
[/WYTYCZNE ZAMAWIAJĄCEGO]`
    : ''
}

${
  sourcesText
    ? `[ŹRÓDŁA MERYTORYCZNE]
${sourcesText}
[/ŹRÓDŁA MERYTORYCZNE]`
    : ''
}

**🚨 KRYTYCZNE WYMAGANIE - FORMAT:**
- **TYLKO HTML!** (tagi: <h2>, <h3>, <h4>, <p>, <ul>, <li>, <strong>, <em>)
- **ZERO MARKDOWN** (nie używaj #, ##, *, **)
- Każdy nagłówek w odpowiednim tagu HTML
- Przypisy jako [Nazwisko, rok: strona]

${
  isTheoreticalChapter
    ? `
**📚 ROZDZIAŁ 1 - PODSTAWY TEORETYCZNE (WYŁĄCZNIE TEORIA!):**

⚠️ **TO JEST ROZDZIAŁ 1 - ABSOLUTNIE ZAKAZANE:**
- Prezentacja własnych badań
- Metodologia badawcza
- Analiza konkretnych danych empirycznych
- Szczegółowe opisy badań (metodologia, próba, wyniki)

✅ **WYMAGANE:**
- Przegląd TEORII i KONCEPCJI
- Historia rozwoju danej dziedziny
- Modele teoretyczne (np. Model Wielkiej Piątki, teoria przywiązania)
- Definicje i klasyfikacje pojęć
- Ogólne odniesienia do badań BEZ szczegółów metodologicznych
- Krytyczna analiza teorii (mocne strony, ograniczenia)

**PRZYKŁAD:**

<h3>1.1. Ewolucja pojęcia uzależnienia</h3>
<p>Koncepcja uzależnienia przez dziesięciolecia była związana z substancjami psychoaktywnymi [Jellinek, 1960: 35]. Model biomedyczny zakładał neuroadaptację mózgu [Koob, Volkow, 2016: 760].</p>

<h4>Krytyka klasycznego modelu</h4>
<p>Krytycy wskazują na ograniczenia tego podejścia: nadmierny redukcjonizm biologiczny, ignorowanie czynników społecznych i kulturowych [Grant et al., 2010: 228].</p>

`
    : isEmpiricalChapter
      ? `
**🔬 ROZDZIAŁ 3 - BADANIA EMPIRYCZNE:**

✅ **TO JEST ROZDZIAŁ BADAWCZY - WYMAGANE:**

1. **METODOLOGIA (Obowiązkowa sekcja):**
   - Metoda przeglądu literatury (systematyczny)
   - Kryteria włączania badań (okres: 2015-2024, języki)
   - Bazy danych (PubMed, PsycINFO, Web of Science)
   - Proces selekcji (ile znaleziono, ile włączono)

2. **PREZENTACJA BADAŃ:**
   - 8-12 konkretnych badań szczegółowo:
     * Autorzy i rok
     * Cel badania
     * Metoda (próba N=..., narzędzia, procedura)
     * Główne wyniki (r=..., p<..., konkretne liczby!)
     * Ograniczenia metodologiczne

3. **KRYTYCZNA ANALIZA:**
   - Po KAŻDYM badaniu wskaż OGRANICZENIA:
     * Wielkość próby, reprezentatywność
     * Korelacja vs przyczynowość
     * Możliwe biasy
   - Porównaj sprzeczne wyniki

4. **SYNTEZA:**
   - Co jest POTWIERDZONE?
   - Co KONTROWERSYJNE?
   - Jakie LUKI BADAWCZE?

**PRZYKŁAD:**

<h4>Badanie Smith i wsp. (2021): Wpływ mediów społecznościowych na depresję</h4>

<p><strong>Cel:</strong> Zbadanie związku między czasem w social media a depresją.</p>

<p><strong>Metodologia:</strong> Longitudinalne, N=1,143 studentów (M=22.3, SD=2.1), 6 miesięcy. Narzędzia: BSMAS, BDI-II. Analiza: SEM.</p>

<p><strong>Wyniki:</strong> Korelacja dodatnia r=.34, p<.001. Efekt silniejszy dla używania pasywnego [Smith et al., 2021: 156].</p>

<p><strong>Ograniczenia:</strong> (1) Dane samodzielnie raportowane, (2) Brak wnioskowania przyczynowego, (3) Tylko studenci USA, (4) Brak kontroli dla zmiennych zakłócających.</p>

`
      : `
**📚 ROZDZIAŁ ${chapterNumber} - STANDARDOWY (TEORIA/PRAKTYKA):**

1. **STRUKTURA:**
   - Wprowadzenie
   - Podrozdziały zgodne ze strukturą
   - Płynne przejścia
   - Podsumowanie

2. **TEORIA + KRYTYKA:**
   - Po każdej teorii KRYTYCZNA ANALIZA:
     * Mocne strony
     * Ograniczenia
     * Kontrowersje
   - RÓŻNE PERSPEKTYWY

3. **KONKRETNE PRZYKŁADY:**
   - 2-3 przykłady zastosowania
   - Rzeczywiste przypadki
   - Teoria + praktyka

4. **RÓWNOWAGA:**
   - Każdy podrozdział podobnej długości (~1500-2000 słów)
`
}

**WYMAGANIA STYLISTYCZNE:**

1. **ZWIĘZŁOŚĆ:**
   - Każde zdanie musi wnosić wartość
   - ❌ "Warto zauważyć...", "Należy podkreślić..."
   - ✅ "Badania wykazują...", "Teoria zakłada..."

2. **KONKRETNOŚĆ:**
   - KONKRETNE DANE: liczby, procenty
   - ❌ "Wiele badań..."
   - ✅ "Metaanaliza 23 badań (N=12,450)..."

3. **KRYTYCZNE MYŚLENIE:**
   - "Jednakże...", "Z drugiej strony...", "Ograniczeniem jest..."

**WYMAGANIA TECHNICZNE:**

1. **DŁUGOŚĆ:** ~30,000 znaków (20-25 stron A4)
2. **JĘZYK:** ${languageMap[orderedText.jezyk] || orderedText.jezyk}
3. **PRZYPISY:** [Nazwisko, rok: strona] - 2-3 na stronę
4. **FORMATOWANIE:** Tylko HTML

**ROZPOCZNIJ PISANIE ROZDZIAŁU ${chapterNumber}:**

<h2>ROZDZIAŁ ${chapterNumber}:`;

  console.log(`   📤 Wysyłam prompt do Claude (${prompt.length} znaków)...`);
  console.log(
    `   ${
      isTheoreticalChapter
        ? '📖 ROZDZIAŁ 1 - TYLKO TEORIA!'
        : isEmpiricalChapter
          ? '🔬 ROZDZIAŁ 3 - BADANIA EMPIRYCZNE'
          : '📚 ROZDZIAŁ TEORETYCZNY/PRAKTYCZNY'
    }\n`
  );

  const startTime = Date.now();

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 30000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const generationTime = Date.now() - startTime;
    const chapterContent = convertMarkdownToHTML(message.content[0].text);

    console.log(
      `   ✅ Rozdział ${chapterNumber} wygenerowany w ${(generationTime / 1000).toFixed(2)}s`
    );
    console.log(`   📊 Długość: ${chapterContent.length} znaków`);
    console.log(
      `   🔢 Tokens: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out\n`
    );

    return {
      content: chapterContent,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      generationTime,
      promptUsed: prompt,
    };
  } catch (error) {
    console.error(`❌ Błąd generowania rozdziału ${chapterNumber}:`, error);
    throw error;
  }
};

/**
 * KROK WSTĘP: Wygeneruj wstęp do pracy
 */
const generateIntroduction = async (orderedText, academicWork) => {
  console.log(`\n📖 === GENEROWANIE WSTĘPU ===`);

  const workType = orderedText.rodzajTresci.toLowerCase().includes('magister')
    ? 'magisterskiej'
    : 'licencjackiej';

  // Wyciągnij tytuły wszystkich rozdziałów
  const chaptersPreview = academicWork.chapters
    .map((ch, idx) => {
      const preview = ch.content.substring(0, 1500); // Pierwsze 1500 znaków
      return `ROZDZIAŁ ${idx + 1} (fragment):\n${preview}...\n`;
    })
    .join('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const prompt = `Wciel się w rolę AUTORA pracy ${workType} i napisz WSTĘP do tej pracy.

[TEMAT PRACY]
${orderedText.temat}
[/TEMAT PRACY]

[SPIS TREŚCI]
${academicWork.tableOfContents}
[/SPIS TREŚCI]

[FRAGMENTY ROZDZIAŁÓW]
Poniżej znajdziesz fragmenty wszystkich rozdziałów pracy, abyś mógł zrozumieć jej zawartość:

${chaptersPreview}
[/FRAGMENTY ROZDZIAŁÓW]

**TWOJE ZADANIE:**
Napisz WSTĘP do pracy ${workType}, który:

**WYMAGANIA:**

1. **DŁUGOŚĆ:**
   - 5,000-7,000 znaków (3-5 stron A4)
   - Format HTML (tagi <h2>, <p>, <strong>, <em>)

2. **STRUKTURA WSTĘPU:**
   - Uzasadnienie wyboru tematu
   - Cel pracy i pytania badawcze
   - Zakres pracy (co obejmuje, czego nie obejmuje)
   - Metoda badawcza (jeśli dotyczy)
   - Struktura pracy (krótkie omówienie rozdziałów)

3. **STYL:**
   - Język akademicki, precyzyjny
   - Forma bezosobowa lub "ja" (w zależności od typu pracy)
   - Wprowadzenie czytelnika w temat
   - Jasne określenie celów pracy

4. **MERYTORYKA:**
   - Uzasadnij dlaczego temat jest ważny
   - Wskaż lukę badawczą lub problem praktyczny
   - Określ wkład pracy w daną dziedzinę
   - Płynne wprowadzenie do rozdziałów

**JĘZYK:** ${languageMap[orderedText.jezyk] || orderedText.jezyk}

**ROZPOCZNIJ PISANIE WSTĘPU:**
<h2>Wstęp</h2>`;

  console.log(`   📤 Wysyłam prompt do Claude (${prompt.length} znaków)...\n`);
  const startTime = Date.now();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }],
  });

  const generationTime = Date.now() - startTime;
  const introContent = message.content[0].text;

  console.log(
    `   ✅ Wstęp wygenerowany w ${(generationTime / 1000).toFixed(2)}s`
  );
  console.log(`   📊 Długość: ${introContent.length} znaków`);
  console.log(
    `   🔢 Tokens: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out\n`
  );

  return {
    content: introContent,
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    generationTime,
    promptUsed: prompt,
  };
};

/**
 * KROK ZAKOŃCZENIE: Wygeneruj zakończenie do pracy
 */
const generateConclusion = async (orderedText, academicWork) => {
  console.log(`\n🏁 === GENEROWANIE ZAKOŃCZENIA ===`);

  const workType = orderedText.rodzajTresci.toLowerCase().includes('magister')
    ? 'magisterskiej'
    : 'licencjackiej';

  // Wyciągnij końcówki wszystkich rozdziałów
  const chaptersEndings = academicWork.chapters
    .map((ch, idx) => {
      const ending = ch.content.substring(ch.content.length - 1500); // Ostatnie 1500 znaków
      return `ROZDZIAŁ ${idx + 1} (zakończenie):\n...${ending}\n`;
    })
    .join('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const prompt = `Wciel się w rolę AUTORA pracy ${workType} i napisz ZAKOŃCZENIE do tej pracy.

[TEMAT PRACY]
${orderedText.temat}
[/TEMAT PRACY]

[SPIS TREŚCI]
${academicWork.tableOfContents}
[/SPIS TREŚCI]

[ZAKOŃCZENIA ROZDZIAŁÓW]
Poniżej znajdziesz zakończenia wszystkich rozdziałów, abyś mógł podsumować całą pracę:

${chaptersEndings}
[/ZAKOŃCZENIA ROZDZIAŁÓW]

[WSTĘP PRACY]
${academicWork.introduction.content}
[/WSTĘP PRACY]

**TWOJE ZADANIE:**
Napisz ZAKOŃCZENIE do pracy ${workType}, które:

**WYMAGANIA:**

1. **DŁUGOŚĆ:**
   - 3,000-5,000 znaków (2-4 strony A4)
   - Format HTML (tagi <h2>, <p>, <strong>, <em>)

2. **STRUKTURA ZAKOŃCZENIA:**
   - Podsumowanie głównych tez i wniosków z każdego rozdziału
   - Odpowiedź na pytania badawcze postawione we wstępie
   - Wnioski końcowe i refleksje
   - Ograniczenia badania (jeśli dotyczy)
   - Propozycje dalszych badań

3. **STYL:**
   - Syntetyczne podsumowanie
   - Konkretne wnioski, nie powtórzenia
   - Odwołanie do celów określonych we wstępie
   - Refleksja nad znaczeniem uzyskanych wyników

4. **MERYTORYKA:**
   - Każdy wniosek musi wynikać z treści rozdziałów
   - Wskaż praktyczne lub teoretyczne implikacje
   - Bądź krytyczny - wskaż ograniczenia
   - Zaproponuj kierunki dalszych prac

**JĘZYK:** ${languageMap[orderedText.jezyk] || orderedText.jezyk}

**ROZPOCZNIJ PISANIE ZAKOŃCZENIA:**
<h2>Zakończenie</h2>`;

  console.log(`   📤 Wysyłam prompt do Claude (${prompt.length} znaków)...\n`);
  const startTime = Date.now();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }],
  });

  const generationTime = Date.now() - startTime;
  const conclusionContent = message.content[0].text;

  console.log(
    `   ✅ Zakończenie wygenerowane w ${(generationTime / 1000).toFixed(2)}s`
  );
  console.log(`   📊 Długość: ${conclusionContent.length} znaków`);
  console.log(
    `   🔢 Tokens: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out\n`
  );

  return {
    content: conclusionContent,
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    generationTime,
    promptUsed: prompt,
  };
};

/**
 * KROK BIBLIOGRAFIA: Wygeneruj bibliografię z całej pracy
 */
const generateBibliography = async (orderedText, academicWork) => {
  console.log(`\n📚 === GENEROWANIE BIBLIOGRAFII ===`);

  const workType = orderedText.rodzajTresci.toLowerCase().includes('magister')
    ? 'magisterskiej'
    : 'licencjackiej';

  // Zbierz całą treść pracy (tylko tekst, bez HTML)
  const fullWorkContent = [
    academicWork.introduction.content,
    ...academicWork.chapters.map((ch) => ch.content),
    academicWork.conclusion.content,
  ].join('\n\n');

  // Skróć do maksymalnie 100,000 znaków dla promptu
  const contentForAnalysis =
    fullWorkContent.length > 100000
      ? fullWorkContent.substring(0, 100000) +
        '\n\n[...pozostała część pracy...]'
      : fullWorkContent;

  const prompt = `Jesteś ekspertem bibliografii akademickiej. Twoim zadaniem jest stworzenie BIBLIOGRAFII dla pracy ${workType}.

[PEŁNA TREŚĆ PRACY DO ANALIZY]
${contentForAnalysis}
[/PEŁNA TREŚĆ PRACY]

**TWOJE ZADANIE:**

1. **WYŁUSKAJ WSZYSTKIE ŹRÓDŁA:**
   - Przeanalizuj całą pracę i znajdź WSZYSTKIE przypisy w formacie [Nazwisko, rok: strona]
   - Znajdź również źródła wymienione w tekście bez przypisów
   - Wynotuj każde unikalne źródło (autor, rok publikacji)
   - Usuń duplikaty - jeśli źródło pojawia się wielokrotnie, uwzględnij je raz

2. **STWÓRZ BIBLIOGRAFIĘ:**
   - Format: **Harvard** (lub APA jeśli praca w języku angielskim)
   - Uporządkuj alfabetycznie według nazwiska autora
   - Dla każdego źródła podaj (jeśli dostępne):
     * Nazwisko, Inicjał. (Rok). *Tytuł pracy/artykułu*. Wydawnictwo lub czasopismo.
   - Jeśli brakuje pełnych danych (np. nie ma tytułu), stwórz najbardziej prawdopodobny tytuł na podstawie kontekstu z pracy

3. **FORMATOWANIE:**
   - Format HTML: <h2>, <p>, <ul>, <li>
   - Każde źródło jako osobny element listy
   - Zachowaj kursywę dla tytułów: <em>Tytuł</em>
   - Użyj wcięć dla długich pozycji

4. **STYL I JĘZYK:**
   - Język bibliografii: ${languageMap[orderedText.jezyk] || orderedText.jezyk}
   - Profesjonalny, akademicki styl
   - Konsekwentne formatowanie wszystkich pozycji
   - Jeśli źródło jest w języku obcym, zachowaj oryginalny tytuł

**PRZYKŁAD FORMATU (Harvard):**
<ul>
<li>Kowalski, J. (2020). <em>Wprowadzenie do psychologii społecznej</em>. Warszawa: PWN.</li>
<li>Smith, A., Johnson, B. (2019). Social cognition and behavior. <em>Journal of Psychology</em>, 45(2), 123-145.</li>
<li>Nowak, P. (2021). <em>Metody badawcze w naukach społecznych</em>. Kraków: Wydawnictwo UJ.</li>
</ul>

**KRYTYCZNE WYMAGANIA:**
- Uwzględnij WSZYSTKIE źródła z przypisów
- Alfabetyczna kolejność (wg nazwiska)
- Konsekwentny format dla wszystkich pozycji
- Jeśli w pracy jest 50 przypisów, bibliografia powinna mieć ~20-30 unikalnych pozycji

**ROZPOCZNIJ TWORZENIE BIBLIOGRAFII:**
<h2>Bibliografia</h2>
<ul>`;

  console.log(`   📤 Wysyłam prompt do Claude (${prompt.length} znaków)...\n`);
  const startTime = Date.now();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 16000,
    temperature: 0.3, // Niska temperatura dla precyzji
    messages: [{ role: 'user', content: prompt }],
  });

  const generationTime = Date.now() - startTime;
  const bibliographyContent = message.content[0].text;

  // Policz liczbę źródeł (tagi <li>)
  const sourcesCount = (bibliographyContent.match(/<li>/g) || []).length;

  console.log(
    `   ✅ Bibliografia wygenerowana w ${(generationTime / 1000).toFixed(2)}s`
  );
  console.log(`   📊 Długość: ${bibliographyContent.length} znaków`);
  console.log(`   📚 Źródeł: ${sourcesCount}`);
  console.log(
    `   🔢 Tokens: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out\n`
  );

  return {
    content: bibliographyContent,
    sourcesCount,
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    generationTime,
    promptUsed: prompt,
  };
};

/**
 * GŁÓWNY ORKIESTRATOR - generuj całą pracę akademicką
 */
const generateAcademicWork = async (orderedTextId) => {
  try {
    console.log(`\n🎓 === GENEROWANIE PRACY AKADEMICKIEJ ===`);
    console.log(`OrderedText ID: ${orderedTextId}\n`);

    // 1. Pobierz OrderedText
    const orderedText = await OrderedText.findById(orderedTextId);
    if (!orderedText) {
      throw new Error('OrderedText nie znaleziony');
    }

    // 2. Określ typ pracy
    const workType = orderedText.rodzajTresci.toLowerCase().includes('magister')
      ? 'mgr'
      : 'lic';
    const chaptersCount = workType === 'mgr' ? 4 : 3;

    console.log(`📄 Temat: ${orderedText.temat}`);
    console.log(
      `🎓 Typ: ${workType.toUpperCase()} (${chaptersCount} rozdziały)\n`
    );

    // 3. Pobierz źródła
    const selectedSources = await ScrapedContent.find({
      orderedTextId,
      selectedForGeneration: true,
      status: 'completed',
    }).sort({ createdAt: 1 });

    console.log(`📚 Źródła: ${selectedSources.length}`);

    // Limituj źródła
    const structureService = require('./structureGenerationService');
    const { sources: limitedSources } = structureService.limitSources(
      selectedSources,
      100000
    );

    // 4. Stwórz dokument AcademicWork
    const academicWork = await AcademicWork.create({
      orderedTextId,
      workType,
      status: 'generating_toc',
      startTime: new Date(),
      chapters: Array.from({ length: chaptersCount }, (_, i) => ({
        chapterNumber: i + 1,
        status: 'pending',
      })),
    });

    console.log(`✅ AcademicWork utworzony (ID: ${academicWork._id})\n`);

    // 5. KROK 1: Generuj spis treści
    console.log(`📋 === KROK 1: SPIS TREŚCI ===\n`);

    const tocData = await generateTableOfContents(orderedText, limitedSources);

    // ✅ Zapisz OBA wersje
    academicWork.tableOfContents = tocData.simpleToC; // ← Prosty (dla użytkownika)
    academicWork.fullStructure = tocData.fullStructure; // ← Pełny (dla Claude)
    academicWork.tocTokensUsed = tocData.tokensUsed;
    academicWork.tocGenerationTime = tocData.generationTime;
    academicWork.tocPromptUsed = tocData.promptUsed;
    academicWork.status = 'toc_completed';
    await academicWork.save();

    console.log(`✅ Spis treści ukończony\n`);

    // 6. KROK 2-5: Generuj każdy rozdział
    for (let i = 1; i <= chaptersCount; i++) {
      console.log(`\n📝 === KROK ${i + 1}: ROZDZIAŁ ${i} ===\n`);

      // Zaktualizuj status
      academicWork.status = `chapter_${i}_generating`;
      academicWork.chapters[i - 1].status = 'generating';
      await academicWork.save();

      // Aktualizuj OrderedText status
      await OrderedText.findByIdAndUpdate(orderedTextId, {
        status: `Generowanie treści - Rozdział ${i}/${chaptersCount}`,
      });

      // Generuj rozdział
      const chapterData = await generateChapter(
        i,
        academicWork.fullStructure,
        orderedText,
        limitedSources
      );

      // Zapisz rozdział
      academicWork.chapters[i - 1].content = chapterData.content;
      academicWork.chapters[i - 1].characterCount = chapterData.content.length;
      academicWork.chapters[i - 1].tokensUsed = chapterData.tokensUsed;
      academicWork.chapters[i - 1].generationTime = chapterData.generationTime;
      academicWork.chapters[i - 1].promptUsed = chapterData.promptUsed;
      academicWork.chapters[i - 1].status = 'completed';
      academicWork.status = `chapter_${i}_completed`;
      await academicWork.save();

      console.log(`✅ Rozdział ${i} ukończony\n`);
    }

    console.log(`\n📖 === KROK ${chaptersCount + 2}: WSTĘP ===\n`);
    academicWork.status = 'generating_introduction';
    academicWork.introduction.status = 'generating';
    await academicWork.save();

    await OrderedText.findByIdAndUpdate(orderedTextId, {
      status: `Generowanie wstępu`,
    });

    const introData = await generateIntroduction(orderedText, academicWork);

    academicWork.introduction.content = introData.content;
    academicWork.introduction.characterCount = introData.content.length;
    academicWork.introduction.tokensUsed = introData.tokensUsed;
    academicWork.introduction.generationTime = introData.generationTime;
    academicWork.introduction.promptUsed = introData.promptUsed;
    academicWork.introduction.status = 'completed';
    academicWork.status = 'introduction_completed';
    await academicWork.save();

    console.log(`✅ Wstęp ukończony\n`);

    // 🆕 KROK ZAKOŃCZENIE: Generuj zakończenie
    console.log(`\n🏁 === KROK ${chaptersCount + 3}: ZAKOŃCZENIE ===\n`);
    academicWork.status = 'generating_conclusion';
    academicWork.conclusion.status = 'generating';
    await academicWork.save();

    await OrderedText.findByIdAndUpdate(orderedTextId, {
      status: `Generowanie zakończenia`,
    });

    const conclusionData = await generateConclusion(orderedText, academicWork);

    academicWork.conclusion.content = conclusionData.content;
    academicWork.conclusion.characterCount = conclusionData.content.length;
    academicWork.conclusion.tokensUsed = conclusionData.tokensUsed;
    academicWork.conclusion.generationTime = conclusionData.generationTime;
    academicWork.conclusion.promptUsed = conclusionData.promptUsed;
    academicWork.conclusion.status = 'completed';
    academicWork.status = 'conclusion_completed';
    await academicWork.save();

    // 🆕 KROK BIBLIOGRAFIA: Generuj bibliografię
    console.log(`\n📚 === KROK ${chaptersCount + 4}: BIBLIOGRAFIA ===\n`);
    academicWork.status = 'generating_bibliography';
    academicWork.bibliography.status = 'generating';
    await academicWork.save();

    await OrderedText.findByIdAndUpdate(orderedTextId, {
      status: `Generowanie bibliografii`,
    });

    const bibliographyData = await generateBibliography(
      orderedText,
      academicWork
    );

    academicWork.bibliography.content = bibliographyData.content;
    academicWork.bibliography.characterCount = bibliographyData.content.length;
    academicWork.bibliography.sourcesCount = bibliographyData.sourcesCount;
    academicWork.bibliography.tokensUsed = bibliographyData.tokensUsed;
    academicWork.bibliography.generationTime = bibliographyData.generationTime;
    academicWork.bibliography.promptUsed = bibliographyData.promptUsed;
    academicWork.bibliography.status = 'completed';
    academicWork.status = 'bibliography_completed';
    await academicWork.save();

    console.log(
      `✅ Bibliografia ukończona (${bibliographyData.sourcesCount} źródeł)\n`
    );

    // 7. KROK SKŁADANIE: Złóż całą pracę
    console.log(`\n📚 === KROK ${chaptersCount + 5}: SKŁADANIE PRACY ===\n`);

    // ✅ W finalnym dokumencie użyj prostego spisu treści
    const fullDocument = [
      '<div class="table-of-contents">',
      '<h1>Spis treści</h1>',
      '<pre style="font-family: inherit; white-space: pre-wrap;">',
      academicWork.tableOfContents,
      '</pre>',
      '</div>',
      '<div class="introduction">',
      academicWork.introduction.content,
      '</div>',
      ...academicWork.chapters.map(
        (ch) =>
          `<div class="chapter chapter-${ch.chapterNumber}">${ch.content}</div>`
      ),
      '<div class="conclusion">',
      academicWork.conclusion.content,
      '</div>',
      '<div class="bibliography">',
      academicWork.bibliography.content,
      '</div>',
    ].join('\n\n');

    academicWork.finalDocument = fullDocument;
    academicWork.totalCharacterCount = fullDocument.length;
    academicWork.totalTokensUsed =
      academicWork.tocTokensUsed +
      (academicWork.introduction.tokensUsed || 0) +
      academicWork.chapters.reduce((sum, ch) => sum + (ch.tokensUsed || 0), 0) +
      (academicWork.conclusion.tokensUsed || 0) +
      (academicWork.bibliography.tokensUsed || 0);
    academicWork.totalGenerationTime =
      academicWork.tocGenerationTime +
      (academicWork.introduction.generationTime || 0) +
      academicWork.chapters.reduce(
        (sum, ch) => sum + (ch.generationTime || 0),
        0
      ) +
      (academicWork.conclusion.generationTime || 0) +
      (academicWork.bibliography.generationTime || 0);
    academicWork.status = 'completed';
    academicWork.completionTime = new Date();
    await academicWork.save();

    console.log(`✅ Praca złożona pomyślnie`);
    console.log(
      `   📊 Łączna długość: ${academicWork.totalCharacterCount.toLocaleString()} znaków`
    );
    console.log(
      `   🔢 Łączne tokeny: ${academicWork.totalTokensUsed.toLocaleString()}`
    );
    console.log(
      `   ⏱️  Łączny czas: ${(academicWork.totalGenerationTime / 1000 / 60).toFixed(2)} min\n`
    );

    // 8. KROK 7: Synchronizuj z Order
    console.log(`🔄 === SYNCHRONIZACJA Z ORDER ===\n`);
    await syncWithOrder(orderedText, academicWork);

    console.log(`🎉 === PRACA ${workType.toUpperCase()} UKOŃCZONA ===\n`);

    return academicWork;
  } catch (error) {
    console.error('❌ Błąd podczas generowania pracy akademickiej:', error);

    // Zapisz błąd
    await AcademicWork.findOneAndUpdate(
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

/**
 * Synchronizuj z Order - zaktualizuj status itemu i całego zamówienia
 */
const syncWithOrder = async (orderedText, academicWork) => {
  try {
    const order = await Order.findById(
      orderedText.originalOrderId || orderedText.idZamowienia
    );

    if (!order) {
      console.warn(`   ⚠️ Order nie znaleziony\n`);
      return;
    }

    // Znajdź item
    const item = order.items.id(
      orderedText.originalItemId || orderedText.itemId
    );

    if (!item) {
      console.warn(`   ⚠️ Item nie znaleziony\n`);
      return;
    }

    // Zaktualizuj item
    item.status = 'zakończone';
    item.content = academicWork.finalDocument;

    console.log(`   ✅ Item ${item._id} → "zakończone"`);

    // Sprawdź czy wszystkie itemy zakończone
    const allItemsCompleted = order.items.every(
      (item) => item.status === 'zakończone'
    );

    if (allItemsCompleted) {
      order.status = 'zakończone';
      console.log(`   🎉 Wszystkie itemy zakończone → Order "zakończone"`);

      // Wyślij email
      const user = await User.findById(order.user);
      if (user && user.email) {
        const locale = user.locale || 'pl';
        i18n.setLocale(locale);

        const emailContent = `
          <h2>🎉 Twoje zamówienie zostało ukończone!</h2>
          <p>Witaj ${user.name},</p>
          <p>Wspaniała wiadomość! Twoje zamówienie <strong>#${order.orderNumber}</strong> zostało w pełni ukończone.</p>
          <p>Twoja praca akademicka (${academicWork.workType === 'mgr' ? 'magisterska' : 'licencjacka'}) jest już gotowa do pobrania.</p>
          <div class="card">
            <p class="card-title">Szczegóły:</p>
            <ul>
              <li><strong>Numer zamówienia:</strong> #${order.orderNumber}</li>
              <li><strong>Typ pracy:</strong> ${academicWork.workType === 'mgr' ? 'Magisterska' : 'Licencjacka'}</li>
              <li><strong>Liczba rozdziałów:</strong> ${academicWork.chapters.length}</li>
              <li><strong>Długość:</strong> ${Math.round(academicWork.totalCharacterCount / 1000)}k znaków</li>
            </ul>
          </div>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard/orders/${order._id}" class="button">
              Zobacz pracę
            </a>
          </p>
          <p>Dziękujemy za skorzystanie z Smart-Edu.ai!</p>
          <p>Pozdrawiamy,<br>Zespół Smart-Edu.ai</p>
        `;

        const emailData = {
          title: `Praca ${academicWork.workType === 'mgr' ? 'magisterska' : 'licencjacka'} ukończona`,
          headerTitle: 'Smart-Edu.ai',
          content: emailContent,
        };

        const emailHtml = generateEmailTemplate(emailData);

        try {
          await sendEmail({
            email: user.email,
            subject: `✅ Twoja praca ${academicWork.workType === 'mgr' ? 'magisterska' : 'licencjacka'} jest gotowa!`,
            message: emailHtml,
            isHtml: true,
          });
          console.log(`   📧 Email wysłany do ${user.email}`);
        } catch (emailError) {
          console.error('   ❌ Błąd wysyłania emaila:', emailError);
        }
      }
    } else {
      console.log(
        `   ⏳ Czekam na pozostałe itemy (${order.items.filter((i) => i.status !== 'zakończone').length} pozostało)`
      );
    }

    await order.save();
    console.log(`   ✅ Order zapisany\n`);

    // Zaktualizuj OrderedText
    await OrderedText.findByIdAndUpdate(orderedText._id, {
      status: 'Zakończone',
      completedAt: new Date(),
    });
    console.log(`   ✅ OrderedText → "Zakończone"\n`);
  } catch (error) {
    console.error('   ❌ Błąd synchronizacji:', error);
    // Nie przerywamy - praca jest wygenerowana
  }
};

/**
 * Helper: Formatuj źródła do promptu
 */
const formatSourcesForPrompt = (sources) => {
  if (!sources || sources.length === 0) {
    return '';
  }

  return sources
    .map(
      (source, idx) =>
        `ŹRÓDŁO ${idx + 1}:\nURL: ${source.url}\nTreść:\n${source.scrapedText || source.text || ''}\n`
    )
    .join('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

module.exports = {
  generateAcademicWork,
  generateTableOfContents,
  generateChapter,
};
