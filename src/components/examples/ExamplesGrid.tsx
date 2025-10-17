// src/components/examples/ExamplesGrid.tsx
'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { WorkType, Subject, ExampleMeta } from '@/types/example';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  examples: ExampleMeta[];
};

export function ExamplesGrid({ examples }: Props) {
  const t = useTranslations('examples');
  const { theme } = useTheme();
  const [sortField, setSortField] = useState<'createdAt' | 'views'>(
    'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filteredExamples, setFilteredExamples] = useState(examples);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedWorkType, setSelectedWorkType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    let sorted = [...examples];

    // Filtrowanie
    if (selectedLevel !== 'all') {
      sorted = sorted.filter((ex) => ex.level === selectedLevel);
    }
    if (selectedWorkType !== 'all') {
      sorted = sorted.filter((ex) => ex.workType.slugEn === selectedWorkType);
    }
    if (selectedSubject !== 'all') {
      sorted = sorted.filter((ex) => ex.subject.slugEn === selectedSubject);
    }

    // Sortowanie
    sorted.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortOrder === 'asc' ? 1 : -1;

      if (aValue < bValue) return -1 * modifier;
      if (aValue > bValue) return 1 * modifier;
      return 0;
    });

    setFilteredExamples(sorted);
  }, [
    examples,
    sortField,
    sortOrder,
    selectedLevel,
    selectedWorkType,
    selectedSubject,
  ]);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={sortField}
          onChange={(e) =>
            setSortField(e.target.value as 'createdAt' | 'views')
          }
          className="p-2 border rounded"
        >
          <option value="createdAt">{t('sort.date')}</option>
          <option value="views">{t('sort.views')}</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="p-2 border rounded"
        >
          <option value="desc">{t('sort.desc')}</option>
          <option value="asc">{t('sort.asc')}</option>
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">{t('filter.allLevels')}</option>
          <option value="primary">{t('levels.primary.name')}</option>
          <option value="secondary">{t('levels.secondary.name')}</option>
          <option value="university">{t('levels.university.name')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExamples.map((example) => (
          <Link
            key={example._id}
            href={`/examples/${example.level}/${example.workType.slugEn}/${example.subject.slugEn}/${example.slugEn}`}
            className={`p-4 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-50'
            } shadow`}
          >
            <h3 className="font-semibold mb-2">{example.title}</h3>
            <div className="text-sm text-gray-500">
              <p>
                {t(`levels.${example.level}.name`)} • {example.subject.name}
              </p>
              <p>
                {example.workType.name} • {example.length} {t('words')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
