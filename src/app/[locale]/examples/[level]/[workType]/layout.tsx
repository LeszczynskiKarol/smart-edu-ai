// src/app/[locale]/examples/[level]/[workType]/layout.tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getExamplesByWorkType } from '@/services/examples';

export async function generateMetadata({
  params,
}: {
  params: {
    locale: string;
    level: string;
    workType: string;
  };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'examples',
  });

  try {
    // Najpierw sprawdź czy to workType
    const workTypeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/work-types/${params.workType}`
    );

    if (!workTypeResponse.ok) {
      // Jeśli to nie workType, zwróć podstawowe metadane
      return {
        title: t(`levels.${params.level}.name`),
        description: '',
      };
    }

    const workType = await workTypeResponse.json();
    const levelName = t(`levels.${params.level}.name`);

    // Dopiero po potwierdzeniu, że to workType, pobierz przykłady
    const examples = await getExamplesByWorkType(
      params.locale,
      params.level,
      params.workType
    );

    return {
      title: t('meta.workType.title', {
        workType: params.locale === 'en' ? workType.nameEn : workType.name,
        level: levelName,
      }),
      description: t('meta.workType.description', {
        workType:
          params.locale === 'en'
            ? workType.nameEn.toLowerCase()
            : workType.name.toLowerCase(),
        level: levelName,
      }),
      openGraph: {
        title: t('meta.workType.title', {
          workType: params.locale === 'en' ? workType.nameEn : workType.name,
          level: levelName,
        }),
        description: t('meta.workType.description', {
          workType:
            params.locale === 'en'
              ? workType.nameEn.toLowerCase()
              : workType.name.toLowerCase(),
          level: levelName,
        }),
        type: 'website',
      },
    };
  } catch (error) {
    console.error('Error fetching workType:', error);
    return {
      title: t(`levels.${params.level}.name`),
      description: '',
    };
  }
}

export default function WorkTypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
