// src/app/[locale]/examples/[category]/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ExamplesList from '@/components/examples/ExamplesList';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import Layout from '@/components/layout/Layout';
import { generateMetadata } from './metadata';

const validCategories = ['bachelor', 'master', 'coursework'];

export { generateMetadata };
export const dynamic = 'force-dynamic';

async function getExamples(category: string) {
  // ZMIENIONE - używaj thesis-examples zamiast examples
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/thesis-examples/${category}`;
  console.log('🔗 Fetching from:', url);

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Fetch failed:', res.status, errorText);
    throw new Error(`Failed to fetch examples: ${res.status}`);
  }

  const data = await res.json();
  console.log('✅ Received examples:', data.length);
  return data;
}

export default async function CategoryPage({
  params: { locale, category },
}: {
  params: { locale: string; category: string };
}) {
  if (!validCategories.includes(category)) {
    notFound();
  }

  const t = await getTranslations('examples');

  let examples = [];
  try {
    examples = await getExamples(category);
  } catch (error) {
    console.error('Failed to load examples:', error);
  }

  return (
    <Layout title={t(`${category}.title`)}>
      <div className="container mx-auto px-4 py-12 mt-12">
        <Breadcrumbs
          items={[
            { label: t('breadcrumb'), href: `/${locale}/examples` },
            { label: t(`${category}.title`) },
          ]}
        />
        <h1 className="text-4xl font-bold mb-4 mt-4">
          {t(`${category}.title`)}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {t(`${category}.description`)}
        </p>
        <ExamplesList examples={examples} category={category} locale={locale} />
      </div>
    </Layout>
  );
}
