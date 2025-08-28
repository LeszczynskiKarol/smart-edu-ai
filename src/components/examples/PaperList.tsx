// src/components/examples/PaperList.tsx
'use client';
import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { ExampleMeta } from '@/types/example';

type Props = {
  examples: ExampleMeta[];
};

export function PaperList({ examples }: Props) {
  const t = useTranslations('examples');
  const { theme } = useTheme();
  const [filterWorkType, setFilterWorkType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const locale = useLocale();

  const filteredAndSortedExamples = useMemo(() => {
    let result = [...examples];

    if (filterWorkType !== 'all') {
      result = result.filter((ex) => ex.workType.slugEn === filterWorkType);
    }
    if (filterSubject !== 'all') {
      result = result.filter((ex) => ex.subject.slugEn === filterSubject);
    }

    // Sortowanie alfabetyczne według tytułu
    result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [examples, filterWorkType, filterSubject]);

  // Grupowanie przykładów w kolumny
  const columns = useMemo(() => {
    const itemsPerColumn = Math.ceil(filteredAndSortedExamples.length / 3);
    return [
      filteredAndSortedExamples.slice(0, itemsPerColumn),
      filteredAndSortedExamples.slice(itemsPerColumn, itemsPerColumn * 2),
      filteredAndSortedExamples.slice(itemsPerColumn * 2),
    ];
  }, [filteredAndSortedExamples]);

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">{t('allExamples')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-2">
            {column.map((example) => (
              <Link
                key={example._id}
                href={`/examples/${example.level}/${example.workType.slugEn}/${example.subject.slugEn}/${example.slugEn}`}
                className={`block text-lg hover:underline ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {locale === 'en' ? example.titleEn : example.title}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
