// src/app/[locale]/layout.tsx
import { unstable_setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import TikTokPixel from '../../components/TikTokPixel';
import { ClientProviders } from './ClientProviders';

import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const headers = new Headers();
  const url = headers.get('x-url') || '';
  const isAdminRoute = url.includes('/admin');

  if (isAdminRoute) {
    return (
      <html lang={locale} suppressHydrationWarning>
        <body>{children}</body>
      </html>
    );
  }

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    messages = (await import('@/messages/pl.json')).default;
  }

  unstable_setRequestLocale(locale);

  const baseUrl = 'https://www.smart-edu.ai';

  // Schema dla Organization
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Smart-Edu.AI',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: messages.site.description,
    sameAs: [
      // dodaj linki do social media jeśli masz
    ],
  };

  // Schema dla WebSite
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: messages.site.name,
    description: messages.site.description,
    url: baseUrl,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://www.smart-edu.ai"
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://www.smart-edu.ai/en"
        />
        <link
          rel="alternate"
          hrefLang="pl"
          href="https://www.smart-edu.ai/pl"
        />
        <meta
          name="google-site-verification"
          content="ftDJdoAVv2_kXxa6B-UvpFtf5a81dIBETj0jnX6Pjew"
        />
      </head>
      <body className={inter.className}>
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
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
