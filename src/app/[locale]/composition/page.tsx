// src/app/[locale]/composition/page.tsx
import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { getMetadata } from './metadata';
import WypracowanieClient from './WypracowanieClient';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return getMetadata(params.locale);
}

export default function CompositionPage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  return <WypracowanieClient />;
}
