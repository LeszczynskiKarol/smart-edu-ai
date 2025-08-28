// src/app/[locale]/admin/layout.tsx

import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LoaderProvider } from '@/context/LoaderContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    messages = (await import('@/messages/pl.json')).default;
  }

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <LocaleProvider initialLocale={locale}>
              <AuthProvider>
                <LoaderProvider>{children}</LoaderProvider>
              </AuthProvider>
            </LocaleProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
