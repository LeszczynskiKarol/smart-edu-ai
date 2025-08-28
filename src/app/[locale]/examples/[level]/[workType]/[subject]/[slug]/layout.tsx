// src/app/[locale]/examples/[level]/[subject]/[slug]/layout.tsx
import { Metadata } from 'next';
import { getExampleBySlug } from '@/services/examples';

export async function generateMetadata({
  params,
}: {
  params: {
    locale: string;
    level: string;
    workType: string;
    subject: string;
    slug: string;
  };
}): Promise<Metadata> {
  const example = await getExampleBySlug(
    params.locale,
    params.level,
    params.workType,
    params.subject,
    params.slug
  );

  return {
    title: params.locale === 'en' ? example.metaTitleEn : example.metaTitlePl,
    description:
      params.locale === 'en'
        ? example.metaDescriptionEn
        : example.metaDescriptionPl,
    openGraph: {
      title: params.locale === 'en' ? example.metaTitleEn : example.metaTitlePl,
      description:
        params.locale === 'en'
          ? example.metaDescriptionEn
          : example.metaDescriptionPl,
      type: 'article',
    },
  };
}

export default function ExampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
