// src/app/[locale]/student-writer-report-generator/page.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/layout/Layout';
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import { generateMetadata } from './metadata';

const ReportGeneratorClient = dynamic(() => import('./ReportGeneratorClient'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export { generateMetadata };

export default async function PaperPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('Home');

  return (
    <Layout title={t('pageTitle')}>
      <ReportGeneratorClient />
    </Layout>
  );
}
