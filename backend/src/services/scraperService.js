// backend/src/services/scraperService.js
const axios = require('axios');
const ScrapedContent = require('../models/ScrapedContent');

const SCRAPER_URL =
  process.env.SCRAPER_URL ||
  'http://scraper-najnowszy-env.eba-8usajxuv.eu-north-1.elasticbeanstalk.com';

const scrapeUrl = async (url) => {
  try {
    const response = await axios.post(
      `${SCRAPER_URL}/scrape`,
      {
        url: url,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (response.status === 200 && response.data.text) {
      return {
        success: true,
        text: response.data.text,
        length: response.data.text.length,
      };
    }

    throw new Error('Invalid scraper response');
  } catch (error) {
    console.error(`Błąd scrapowania ${url}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

const scrapeMultipleUrls = async (
  orderedTextId,
  googleSearchResultId,
  urls
) => {
  const results = [];

  for (const url of urls) {
    try {
      const scrapedContent = new ScrapedContent({
        orderedTextId,
        googleSearchResultId,
        url,
        status: 'scraping',
      });
      await scrapedContent.save();

      const scrapeResult = await scrapeUrl(url);

      if (scrapeResult.success) {
        scrapedContent.scrapedText = scrapeResult.text;
        scrapedContent.textLength = scrapeResult.length;
        scrapedContent.status = 'completed';
        scrapedContent.scrapedAt = new Date();
      } else {
        scrapedContent.status = 'failed';
        scrapedContent.errorMessage = scrapeResult.error;
      }

      await scrapedContent.save();
      results.push(scrapedContent);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Błąd przetwarzania URL ${url}:`, error);
      results.push({
        url,
        status: 'failed',
        error: error.message,
      });
    }
  }

  return results;
};

module.exports = {
  scrapeUrl,
  scrapeMultipleUrls,
};
