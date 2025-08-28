// src/app/[locale]/page.tsx
// import RecentArticlesSection from '../components/home/RecentArticlesSection';  // <RecentArticlesSection articles={recentArticles} />

import React from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/layout/Layout';
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import { generateMetadata } from './metadata';

const HomeClient = dynamic(() => import('./HomeClient'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export { generateMetadata };

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('Home');

  return (
    <Layout title={t('pageTitle')}>
      <HomeClient />
    </Layout>
  );
}
