// src/app/[locale]/metadata.server.ts
import type { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    messages = (await import('@/messages/pl.json')).default;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';

  return {
    title: {
      template: `%s | ${messages.site.name}`,
      default: messages.site.name,
    },
    description: messages.site.description,
    keywords: messages.site.keywords,
    authors: [{ name: 'Smart Copy AI' }],
    creator: 'Smart Copy AI',
    publisher: 'Smart Copy AI',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: messages.site.name,
      description: messages.site.description,
      url: 'https://www.smart-edu.ai',
      siteName: messages.site.name,
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.site.name,
      description: messages.site.description,
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
    },
    verification: {
      google: 'your-google-verification-code',
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: 'https://www.smart-edu.ai/en',
        pl: 'https://www.smart-edu.ai/pl',
      },
    },
  };
}
