// src/app/[locale]/examples/page.tsx
import Layout from '@/components/layout/Layout';
import { useTranslations } from 'next-intl';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ExampleCategories } from '@/components/examples/ExampleCategories';
import { ExamplesContent } from '@/components/examples/ExamplesContent';
import { Metadata } from 'next';

type Props = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';
  const path = '/examples';

  return {
    metadataBase: new URL(baseUrl),
    title: messages.examples.title,
    description: messages.examples.mainDescription,
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: {
        pl: `${baseUrl}/pl${path}`,
        en: `${baseUrl}/en${path}`,
      },
    },
  };
}

export default function ExamplesPage() {
  const t = useTranslations('examples');

  return (
    <Layout title={t('title')}>
      <div className="container mx-auto px-4 mt-10 py-8">
        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
        <Breadcrumbs items={[{ label: t('title') }]} />

        <p className="text-gray-600 dark:text-gray-300 mb-8 mt-2">
          {t('mainDescription')}
        </p>

        <ExampleCategories />
        <ExamplesContent />
      </div>
    </Layout>
  );
}
