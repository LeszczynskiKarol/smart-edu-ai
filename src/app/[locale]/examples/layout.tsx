// src/app/[locale]/examples/layout.tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: {
    locale: string;
  };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'examples',
  });

  return {
    title: t('meta.main.title'),
    description: t('meta.main.description'),
    openGraph: {
      title: t('meta.main.title'),
      description: t('meta.main.description'),
      type: 'website',
    },
  };
}

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
