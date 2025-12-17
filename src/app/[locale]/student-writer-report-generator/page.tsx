// src/app/[locale]/student-writer-report-generator/page.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import { generateMetadata } from './metadata';

const ReferatClient = dynamic(() => import('./ReferatClient'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export { generateMetadata };

export default async function ReferatPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('Referat');

  return <ReferatClient />;
}
