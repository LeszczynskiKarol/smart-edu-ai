// src/app/[locale]/argumentation-essay/metadata.ts
import type { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const messages = (await import(`@/messages/${locale}.json`)).default;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';

  const meta = messages.Rozprawka?.meta || {
    title: 'Rozprawka AI - Generator Rozprawek | Sztuczna Inteligencja',
    description:
      'Generator rozprawek AI ✓ Napisz rozprawkę w 5 minut ✓ Rozprawka argumentacyjna ✓ Rozprawka problemowa ✓ AI do pisania rozprawek ✓ Od 5 zł',
    keywords:
      'rozprawka ai, generator rozprawek, ai rozprawka, rozprawka generator, napisz rozprawkę ai, sztuczna inteligencja rozprawka, rozprawka problemowa ai, rozprawka argumentacyjna ai, generator rozprawek online, rozprawka na zamówienie',
  };

  return {
    metadataBase: new URL(baseUrl),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'Smart-Edu.AI' }],
    creator: 'Smart-Edu.AI',
    publisher: 'Smart-Edu.AI',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${baseUrl}/${locale}/rozprawka`,
      siteName: messages.site?.name || 'Smart-Edu.AI',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/rozprawka`,
      languages: {
        en: `${baseUrl}/en/argumentative-essay`,
        pl: `${baseUrl}/pl/rozprawka`,
      },
    },
  };
}
