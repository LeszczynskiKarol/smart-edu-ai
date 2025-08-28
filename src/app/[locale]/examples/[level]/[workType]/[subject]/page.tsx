// src/app/[locale]/examples/[level]/[workType]/[subject]/page.tsx
import { getExamplesBySubject } from '@/services/examples';
import { Metadata } from 'next';
import SubjectPageContent from '@/components/examples/SubjectPageContent';

type Props = {
  params: {
    locale: string;
    level: string;
    workType?: string;
    subject?: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, level, workType, subject } = params;
  if (!subject) return {};

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';
  const path = `/examples/${level}/${workType}/${subject}`;
  const examples = await getExamplesBySubject(locale, level, subject);

  if (!examples || examples.length === 0) return {};

  return {
    title:
      locale === 'pl'
        ? examples[0]?.subject?.name
        : examples[0]?.subject?.nameEn,
    description:
      locale === 'pl'
        ? `${examples[0]?.subject?.name} - ${level}`
        : `${examples[0]?.subject?.nameEn} - ${level}`,
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

export default function SubjectPage() {
  return <SubjectPageContent />;
}
