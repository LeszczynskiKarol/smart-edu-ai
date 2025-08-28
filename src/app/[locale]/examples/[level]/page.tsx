// src/app/[locale]/examples/[level]/page.tsx
import { Metadata } from 'next';
import LevelPageContent from '@/components/examples/LevelPageContent';

type Props = {
  params: {
    locale: string;
    level: string;
    workType?: string;
    subject?: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, level } = params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';
  const path = `/examples/${level}`;

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
export default function LevelPage() {
  return <LevelPageContent />;
}
