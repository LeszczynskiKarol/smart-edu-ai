// src/app/[locale]/layout.tsx
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { unstable_setRequestLocale } from 'next-intl/server';
import { ClientProviders } from './ClientProviders';
import TikTokPixel from '../../components/TikTokPixel';

import '@/styles/globals.css';
//import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Sprawdź URL po stronie serwera
  const headers = new Headers();
  const url = headers.get('x-url') || '';
  const isAdminRoute = url.includes('/admin');

  if (isAdminRoute) {
    // Dla ścieżek admin zwróć tylko podstawowy layout
    return (
      <html lang={locale} suppressHydrationWarning>
        <body>{children}</body>
      </html>
    );
  }

  // Dla pozostałych ścieżek użyj pełnego layoutu z providerami
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    messages = (await import('@/messages/pl.json')).default;
  }

  unstable_setRequestLocale(locale);

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: messages.site.name,
    url: 'https://www.smart-edu.ai',
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          hrefLang="x-default"
          href="http://localhost:3000"
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="http://http://localhost:3000/en"
        />
        <link
          rel="alternate"
          hrefLang="pl"
          href="http://http://localhost:3000/pl"
        />
        <meta
          name="google-site-verification"
          content="ftDJdoAVv2_kXxa6B-UvpFtf5a81dIBETj0jnX6Pjew"
        />
      </head>
      <body className={inter.className}>
        {/*<GoogleAnalytics />*/}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <ClientProviders locale={locale} messages={messages}>
          {children}
          <TikTokPixel />
        </ClientProviders>
      </body>
    </html>
  );
}
