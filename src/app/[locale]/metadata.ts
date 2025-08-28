// src/app/[locale]/metadata.ts
import type { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const messages = (await import(`@/messages/${locale}.json`)).default;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';

  return {
    metadataBase: new URL(baseUrl),
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
      url: baseUrl,
      siteName: messages.site.name,
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.site.name,
      description: messages.site.description,
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        en: `${baseUrl}/en`,
        pl: `${baseUrl}/pl`,
      },
    },
  };
}
