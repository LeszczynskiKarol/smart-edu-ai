// backend/src/utils/referrerMapping.js
const mapReferrerToSource = (referrer) => {
  if (!referrer) return 'direct';

  const url = referrer.toLowerCase();

  // Wyszukiwarki
  if (
    url.includes('google.') ||
    url.includes('bing.') ||
    url.includes('yahoo.') ||
    url.includes('yandex.') ||
    url.includes('duckduckgo.')
  ) {
    return 'organic';
  }

  // Social Media
  if (
    url.includes('facebook.') ||
    url.includes('instagram.') ||
    url.includes('twitter.') ||
    url.includes('linkedin.') ||
    url.includes('tiktok.') ||
    url.includes('tiktok.com.') ||
    url.includes('x.com.') ||
    url.includes('ttclid=') ||
    url.includes('utm_source=tiktok') ||
    url.includes('t.co')
  ) {
    return 'social';
  }

  // Reklamy (sprawdzanie parametrów UTM)
  if (
    url.includes('utm_medium=cpc') ||
    url.includes('utm_source=google') ||
    url.includes('gclid=')
  ) {
    return 'paid';
  }

  return 'referral';
};

module.exports = { mapReferrerToSource };
