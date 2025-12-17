// src/app/[locale]/argumentation-essay/page.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/layout/Layout';
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import { generateMetadata } from './metadata';

const RozprawkaClient = dynamic(() => import('./RozprawkaClient'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export { generateMetadata };

export default async function RozprawkaPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('Rozprawka');

  return (
    <Layout title={t('pageTitle')}>
      <RozprawkaClient />
    </Layout>
  );
}
