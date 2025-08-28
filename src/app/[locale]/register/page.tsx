// src/app/[locale]/register/page.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../../components/layout/Layout';
import { metadata } from './metadata';
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';

const RegisterClient = dynamic(() => import('./RegisterClient'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

export { metadata };

export default async function RegisterPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('Auth.Register');

  return (
    <Layout title={t('pageTitle')}>
      <div className="max-w-md mx-auto my-20">
        <RegisterClient />
      </div>
    </Layout>
  );
}