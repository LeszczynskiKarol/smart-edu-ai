// src/components/examples/CategoryAndSubjectGrid.tsx
'use client';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { ExampleMeta, WorkType, Subject } from '@/types/example';
import { useTranslations, useLocale } from 'next-intl';

type Props = {
  workTypes: WorkType[];
  subjects: Subject[];
  level: string;
  examples: ExampleMeta[];
};

export function CategoryAndSubjectGrid({
  workTypes,
  subjects,
  level,
  examples,
}: Props) {
  const t = useTranslations('examples');
  const { theme } = useTheme();
  const locale = useLocale();

  const workTypesWithExamples = workTypes.filter((workType) =>
    examples.some((example) => example.workType._id === workType._id)
  );

  const subjectsWithExamples = subjects.filter((subject) =>
    examples.some((example) => example.subject._id === subject._id)
  );

  return (
    <div className="mt-8">
      {workTypesWithExamples.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-6">{t('categories')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {workTypesWithExamples.map((workType) => (
              <Link
                key={workType._id}
                href={`/examples/${level}/${workType.slugEn}`}
                className={`p-4 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-white hover:bg-gray-50'
                } shadow`}
              >
                <h3 className="font-semibold">
                  {locale === 'en' ? workType.nameEn : workType.name}
                </h3>
              </Link>
            ))}
          </div>
        </>
      )}

      {subjectsWithExamples.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-6 mt-12">{t('subjects')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjectsWithExamples.map((subject) => (
              <Link
                key={subject._id}
                href={`/examples/${level}/${subject.slugEn}`}
                className={`p-4 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-white hover:bg-gray-50'
                } shadow`}
              >
                <h3 className="font-semibold">
                  {locale === 'en' ? subject.nameEn : subject.name}
                </h3>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
