// src/app/[locale]/masters-thesis/page.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/layout/Layout';
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import { generateMetadata } from './metadata';

const MastersThesisClient = dynamic(() => import('./MastersThesisClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  ),
});

export { generateMetadata };

export default async function MastersThesisPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('MastersThesis');

  return (
    <Layout title={t('pageTitle')}>
      <MastersThesisClient />
    </Layout>
  );
}
