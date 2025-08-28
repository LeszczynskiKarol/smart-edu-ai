// src/app/[locale]/examples/[level]/[workType]/page.tsx
import { Metadata } from 'next';
import WorkTypeExamplesPageContent from '@/components/examples/WorkTypeExamplesPageContent';

type Props = {
  params: {
    locale: string;
    level: string;
    workType?: string;
    subject?: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, level, workType } = params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';
  const path = `/examples/${level}/${workType}`;

  return {
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

export default function WorkTypeExamplesPage() {
  return <WorkTypeExamplesPageContent />;
}
