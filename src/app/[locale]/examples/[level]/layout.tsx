// src/app/[locale]/examples/[level]/layout.tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: {
    locale: string;
    level: string;
  };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'examples',
  });

  const levelName = t(`levels.${params.level}.name`);
  const levelDescription = t(`levels.${params.level}.description`);

  return {
    title: t('meta.level.title', {
      level: levelName,
    }),
    description: levelDescription,
    openGraph: {
      title: t('meta.level.title', {
        level: levelName,
      }),
      description: levelDescription,
      type: 'website',
    },
  };
}

export default function LevelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
