// src/config.i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../src/messages/${locale}.json`)).default,
}));
