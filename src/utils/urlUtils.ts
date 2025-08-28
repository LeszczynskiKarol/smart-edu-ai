// src/utils/urlUtils.ts

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function addHttpsIfMissing(url: string): string {
  url = url.trim(); // Remove leading and trailing spaces
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

export function sanitizeUrl(url: string): string {
  return url.trim().replace(/\s+/g, '');
}
