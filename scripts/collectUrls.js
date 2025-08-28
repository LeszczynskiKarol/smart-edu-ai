// scripts/collectUrls.js
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const baseUrl = 'https://www.smart-edu.ai';
const visited = new Set();
const urls = new Set();

async function collectLinks(page, url) {
  if (visited.has(url)) return;
  visited.add(url);

  console.log(`Sprawdzam: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000); // czekamy na załadowanie dynamicznych elementów

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .map((a) => a.href)
        .filter((href) => href.startsWith('https://www.smart-edu.ai'));
    });

    for (const link of links) {
      urls.add(link);
      if (!visited.has(link)) {
        await collectLinks(page, link);
      }
    }
  } catch (error) {
    console.error(`Błąd przy ${url}:`, error.message);
  }
}

async function saveUrls() {
  const urlsList = Array.from(urls).sort();

  // Zapisujemy pełne URL-e
  await fs.writeFile('collected-urls.txt', urlsList.join('\n'));
  console.log(`Zapisano ${urlsList.length} URL-i do pliku collected-urls.txt`);

  // Zapisujemy w formacie do sitemap.ts
  const sitemapFormat = urlsList
    .map((url) => url.replace(baseUrl, ''))
    .filter((url) => url)
    .map((url) => `  '${url}',`)
    .join('\n');

  await fs.writeFile(
    'sitemap-urls.ts',
    `export const urls = [\n${sitemapFormat}\n];`
  );
  console.log('Zapisano również format do sitemap.ts');
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  try {
    await collectLinks(page, baseUrl);
    await saveUrls();
  } catch (error) {
    console.error('Główny błąd:', error);
  } finally {
    await browser.close();
  }
}

main();
