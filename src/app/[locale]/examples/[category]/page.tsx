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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/thesis-examples/${category}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch examples');
  }

  return res.json();
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
  const examples = await getExamples(category);

  return (
    <Layout title={t(`${category}.title`)}>
      <div className="container mx-auto px-4 py-12 mt-12">
        <h1 className="text-4xl font-bold mb-4">{t(`${category}.title`)}</h1>
        <p className="text-xl text-gray-600 mb-8">
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
