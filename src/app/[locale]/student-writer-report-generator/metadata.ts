// src/app/[locale]/student-writer-report-generator/metadata.ts
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
    title: messages.Referat.meta.title,
    description: messages.Referat.meta.description,
    keywords: messages.Referat.meta.keywords,
    authors: [{ name: 'Smart-Edu.AI' }],
    creator: 'Smart-Edu.AI',
    publisher: 'Smart-Edu.AI',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: messages.Referat.meta.title,
      description: messages.Referat.meta.description,
      url: `${baseUrl}/${locale}/student-writer-report-generator`,
      siteName: messages.site.name,
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.Referat.meta.title,
      description: messages.Referat.meta.description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/student-writer-report-generator`,
      languages: {
        en: `${baseUrl}/en/student-writer-report-generator`,
        pl: `${baseUrl}/pl/student-writer-report-generator`,
      },
    },
  };
}
