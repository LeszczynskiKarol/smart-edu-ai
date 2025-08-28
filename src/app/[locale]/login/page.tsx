// src/app/[locale]/login/page.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../../components/layout/Layout';
import { metadata } from './metadata';
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';

const LoadingComponent = () => {
  return <p>Loading...</p>;
};

const LoginClient = dynamic(() => import('./LoginClient'), {
  ssr: false,
  loading: LoadingComponent
});

export { metadata };

export default async function LoginPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('Auth.Login');

  return (
    <Layout title={t('pageTitle')}>
      <div className="max-w-md mx-auto my-20">
        <LoginClient />
      </div>
    </Layout>
  );
}

