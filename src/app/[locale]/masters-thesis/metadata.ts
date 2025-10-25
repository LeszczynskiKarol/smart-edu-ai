// src/app/[locale]/masters-thesis/metadata.ts
import type { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';
  const pagePath = `/${locale}/masters-thesis`;

  return {
    metadataBase: new URL(baseUrl),
    title: messages.MastersThesis.meta.title,
    description: messages.MastersThesis.meta.description,
    keywords: messages.MastersThesis.meta.keywords,
    authors: [{ name: 'Smart-Edu.AI' }],
    creator: 'Smart-Edu.AI',
    publisher: 'Smart-Edu.AI',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: messages.MastersThesis.meta.title,
      description: messages.MastersThesis.meta.description,
      url: `${baseUrl}${pagePath}`,
      siteName: messages.site.name,
      locale: locale,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/masters-thesis-og.jpg`,
          width: 1200,
          height: 630,
          alt: messages.MastersThesis.meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.MastersThesis.meta.title,
      description: messages.MastersThesis.meta.description,
    },
    alternates: {
      canonical: `${baseUrl}${pagePath}`,
      languages: {
        en: `${baseUrl}/en/masters-thesis`,
        pl: `${baseUrl}/pl/masters-thesis`,
      },
    },
  };
}
