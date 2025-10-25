// src/app/[locale]/examples/page.tsx
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'examples' });

  return {
    title: t('title'),
    description: t('bachelor.description'),
  };
}

export default function ExamplesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('examples');

  const categories = [
    {
      slug: 'bachelor',
      title: t('bachelor.title'),
      description: t('bachelor.description'),
      icon: '🎓',
    },
    {
      slug: 'master',
      title: t('master.title'),
      description: t('master.description'),
      icon: '📚',
    },
    {
      slug: 'coursework',
      title: t('coursework.title'),
      description: t('coursework.description'),
      icon: '📝',
    },
  ];

  return (
    <Layout title={t('title')}>
      <div className="container mx-auto px-4 py-12 mt-14">
        <Breadcrumbs
          items={[{ label: t('breadcrumb'), href: `/${locale}/examples` }]}
        />

        <h1 className="text-4xl font-bold mb-8 text-center">{t('title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/${locale}/examples/${category.slug}`}
              className="block p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-6xl mb-4 text-center">{category.icon}</div>
              <h2 className="text-2xl font-bold mb-3 text-center">
                {category.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
