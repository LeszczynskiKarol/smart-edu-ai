// src/app/[locale]/bachelors-thesis/metadata.ts
import type { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';
  const pagePath = `/${locale}/bachelors-thesis`;

  return {
    metadataBase: new URL(baseUrl),
    title: messages.BachelorsThesis.meta.title,
    description: messages.BachelorsThesis.meta.description,
    keywords: messages.BachelorsThesis.meta.keywords,
    authors: [{ name: 'Smart-Edu.AI' }],
    creator: 'Smart-Edu.AI',
    publisher: 'Smart-Edu.AI',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: messages.BachelorsThesis.meta.title,
      description: messages.BachelorsThesis.meta.description,
      url: `${baseUrl}${pagePath}`,
      siteName: messages.site.name,
      locale: locale,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/bachelors-thesis-og.jpg`,
          width: 1200,
          height: 630,
          alt: messages.BachelorsThesis.meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.BachelorsThesis.meta.title,
      description: messages.BachelorsThesis.meta.description,
    },
    alternates: {
      canonical: `${baseUrl}${pagePath}`,
      languages: {
        en: `${baseUrl}/en/bachelors-thesis`,
        pl: `${baseUrl}/pl/bachelors-thesis`,
      },
    },
  };
}
