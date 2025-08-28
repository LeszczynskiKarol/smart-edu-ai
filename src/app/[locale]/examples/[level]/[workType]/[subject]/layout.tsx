// src/app/[locale]/examples/[level]/[workType]/[subject]/layout.tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getExamplesBySubject } from '@/services/examples';

export async function generateMetadata({
  params,
}: {
  params: {
    locale: string;
    level: string;
    subject: string;
  };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'examples',
  });
  const examples = await getExamplesBySubject(
    params.locale,
    params.level,
    params.subject
  );

  try {
    const examples = await getExamplesBySubject(
      params.locale,
      params.level,
      params.subject
    );

    const subject = examples[0]?.subject;
    const levelName = t(`levels.${params.level}.name`);

    if (!subject) {
      return {
        title: levelName,
        description: '',
      };
    }

    return {
      title: t('meta.subject.title', {
        subject: params.locale === 'en' ? subject.nameEn : subject.name,
        level: levelName,
      }),
      description: t('meta.subject.description', {
        subject:
          params.locale === 'en'
            ? subject.nameEn.toLowerCase()
            : subject.name.toLowerCase(),
        level: levelName,
      }),
      openGraph: {
        title: t('meta.subject.title', {
          subject: params.locale === 'en' ? subject.nameEn : subject.name,
          level: levelName,
        }),
        description: t('meta.subject.description', {
          subject:
            params.locale === 'en'
              ? subject.nameEn.toLowerCase()
              : subject.name.toLowerCase(),
          level: levelName,
        }),
        type: 'website',
      },
    };
  } catch (error) {
    console.error('Error fetching subject data:', error);
    return {
      title: 'Error',
      description: '',
    };
  }
}

export default function SubjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
