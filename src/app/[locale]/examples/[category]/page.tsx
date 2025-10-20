// src/app/[locale]/examples/[category]/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ExamplesList from '@/components/examples/ExamplesList';
import Layout from '@/components/layout/Layout';

const validCategories = ['bachelor', 'master', 'coursework'];

export async function generateMetadata({
  params: { locale, category },
}: {
  params: { locale: string; category: string };
}) {
  if (!validCategories.includes(category)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'examples' });

  return {
    title: t(`${category}.title`),
    description: t(`${category}.description`),
  };
}

async function getExamples(category: string) {
  // ✅ ZMIENIONY URL - używamy nowego endpointa
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/thesis-examples/by-category/${category}`;

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
    // Możesz zwrócić pustą listę zamiast crashować
  }

  return (
    <Layout title={t(`${category}.title`)}>
      <div className="container mx-auto px-4 py-12 mt-12">
        <h1 className="text-4xl font-bold mb-4">{t(`${category}.title`)}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {t(`${category}.description`)}
        </p>

        <ExamplesList examples={examples} category={category} locale={locale} />
      </div>
    </Layout>
  );
}

export function generateStaticParams() {
  return validCategories.map((category) => ({ category }));
}
