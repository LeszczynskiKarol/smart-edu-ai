// src/utils/referrerMapping.ts

export const mapReferrerToSource = (referrer: string): string => {
  if (!referrer) return 'direct';

  const url = referrer.toLowerCase();

  // Wyszukiwarki
  if (
    url.includes('google.') ||
    url.includes('bing.') ||
    url.includes('yahoo.')
  ) {
    return 'organic';
  }

  // Social Media
  if (
    url.includes('facebook.') ||
    url.includes('instagram.') ||
    url.includes('tiktok.') ||
    url.includes('twitter.')
  ) {
    return 'social';
  }

  // Reklamy
  if (
    url.includes('utm_medium=cpc') ||
    url.includes('gclid=') ||
    url.includes('utm_source=')
  ) {
    return 'paid';
  }

  return 'referral';
};
