// src/components/examples/Filters.tsx
import { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Subject, ExampleLength, WorkType } from '@/types/example';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface FiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  workTypes?: WorkType[];
  subjects?: Subject[];
  lengthOptions: { value: ExampleLength; label: string }[];
}

export type FilterOptions = {
  search: string;
  subject: string;
  workType: string;
  length: ExampleLength | '';
  sortBy: 'date' | 'views' | 'title';
  sortOrder: 'asc' | 'desc';
};

const uniqueBySlugEn = <T extends { slugEn: string }>(
  items: T[] | undefined
): T[] => {
  if (!items) return [];
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.slugEn)) {
      return false;
    }
    seen.add(item.slugEn);
    return true;
  });
};

export function Filters({
  onFilterChange,
  workTypes,
  subjects,
  lengthOptions,
}: FiltersProps) {
  const t = useTranslations('examples');
  const params = useParams();
  const locale = params.locale as string;

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    subject: '',
    workType: '',
    length: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const handleChange = (name: string, value: string) => {
    const newFilters = {
      ...filters,
      [name]: value,
    } as FilterOptions;
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const uniqueWorkTypes = uniqueBySlugEn(workTypes);
  const uniqueSubjects = uniqueBySlugEn(subjects);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder={t('searchPlaceholder')}
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
        />

        {uniqueWorkTypes.length > 0 && (
          <Select
            value={filters.workType}
            onChange={(e) => handleChange('workType', e.target.value)}
            options={[
              { value: '', label: t('filters.allWorkTypes') },
              ...uniqueWorkTypes.map((wt) => ({
                value: wt.slugEn,
                label: locale === 'pl' ? wt.name : wt.nameEn,
              })),
            ]}
          />
        )}

        {uniqueSubjects.length > 0 && (
          <Select
            value={filters.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            options={[
              { value: '', label: t('filters.allSubjects') },
              ...uniqueSubjects.map((subject) => ({
                value: subject.slugEn,
                label: locale === 'pl' ? subject.name : subject.nameEn,
              })),
            ]}
          />
        )}

        <Select
          value={filters.length}
          onChange={(e) =>
            handleChange('length', e.target.value as ExampleLength | '')
          }
          options={[
            { value: '', label: t('filters.allLengths') },
            ...lengthOptions,
          ]}
        />

        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters((prev) => ({
              ...prev,
              sortBy: sortBy as FilterOptions['sortBy'],
              sortOrder: sortOrder as FilterOptions['sortOrder'],
            }));
            onFilterChange({
              ...filters,
              sortBy: sortBy as FilterOptions['sortBy'],
              sortOrder: sortOrder as FilterOptions['sortOrder'],
            });
          }}
          options={[
            { value: 'date-desc', label: t('filters.newest') },
            { value: 'date-asc', label: t('filters.oldest') },
            { value: 'views-desc', label: t('filters.mostPopular') },
            { value: 'views-asc', label: t('filters.leastPopular') },
            { value: 'title-asc', label: t('filters.titleAZ') },
            { value: 'title-desc', label: t('filters.titleZA') },
          ]}
        />
      </div>
    </div>
  );
}
