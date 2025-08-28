// src/app/[locale]/examples/[level]/[workType]/[subject]/[slug]/page.tsx
import ExamplePageContent from '@/components/examples/ExamplePageContent';
import { Metadata } from 'next';
import { getExampleBySlug } from '@/services/examples';

type Props = {
  params: {
    locale: string;
    level: string;
    workType: string;
    subject: string;
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, level, workType, subject, slug } = params;
  if (!slug) return {};

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';
  const path = `/examples/${level}/${workType}/${subject}/${slug}`;
  const example = await getExampleBySlug(
    locale,
    level,
    workType,
    subject,
    slug
  );

  if (!example) return {};

  return {
    title: locale === 'pl' ? example.metaTitlePl : example.metaTitleEn,
    description:
      locale === 'pl' ? example.metaDescriptionPl : example.metaDescriptionEn,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: {
        pl: `${baseUrl}/pl${path}`,
        en: `${baseUrl}/en${path}`,
      },
    },
  };
}

export default function ExamplePage() {
  return <ExamplePageContent />;
}
