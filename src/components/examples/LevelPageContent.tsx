// src/components/examples/LevelPageContent.tsx
'use client';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useTranslations } from 'next-intl';
import { ExampleList } from '@/components/examples/ExampleList';
import { FilterOptions } from '@/components/examples/Filters';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FiltersLevel } from '@/components/examples/FiltersLevel';
import { useEffect, useState } from 'react';
import { ExampleMeta, ExampleLength, WorkType, Subject } from '@/types/example';
import { getExamplesByLevel } from '@/services/examples';

export default function LevelPage() {
  const params = useParams();
  const t = useTranslations('examples');
  const [examples, setExamples] = useState<ExampleMeta[]>([]);
  const [filteredExamples, setFilteredExamples] = useState<ExampleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const lengthOptions: { value: ExampleLength; label: string }[] = [
    { value: '2000', label: t('lengths.2000') },
    { value: '3000', label: t('lengths.3000') },
    { value: '4000', label: t('lengths.4000') },
    { value: '7000', label: t('lengths.7000') },
    { value: '10000', label: t('lengths.10000') },
    { value: '20000', label: t('lengths.20000') },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examplesData, workTypesData, subjectsData] = await Promise.all([
          getExamplesByLevel(params.locale as string, params.level as string),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-types`).then(
            (res) => res.json()
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects`).then((res) =>
            res.json()
          ),
        ]);

        setExamples(examplesData);
        setFilteredExamples(examplesData);
        setWorkTypes(workTypesData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...examples];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.title.toLowerCase().includes(searchLower) ||
          ex.titleEn.toLowerCase().includes(searchLower) ||
          ex.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.workType) {
      filtered = filtered.filter(
        (ex) => ex.workType.slugEn === filters.workType
      );
    }

    if (filters.subject) {
      filtered = filtered.filter((ex) => ex.subject.slugEn === filters.subject);
    }

    if (filters.length) {
      filtered = filtered.filter((ex) => ex.length === filters.length);
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return filters.sortOrder === 'desc'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'views':
          return filters.sortOrder === 'desc'
            ? b.views - a.views
            : a.views - b.views;
        case 'title':
          return filters.sortOrder === 'desc'
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredExamples(filtered);
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <Layout title={t(`levels.${params.level}.title`)}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 mt-10">
          {t(`levels.${params.level}.name`)}
        </h1>
        <Breadcrumbs
          items={[
            { label: t('title'), href: `/${params.locale}/examples` },
            { label: t(`levels.${params.level}.name`) },
          ]}
        />
        <p className="text-gray-600 dark:text-gray-300 mb-8 mt-2">
          {t(`levels.${params.level}.description`)}
        </p>

        <FiltersLevel
          onFilterChange={handleFilterChange}
          workTypes={workTypes}
          subjects={subjects}
          lengthOptions={lengthOptions}
        />

        {filteredExamples.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('filters.noResults')}</p>
          </div>
        ) : (
          <ExampleList
            examples={filteredExamples}
            level={params.level as string}
          />
        )}
      </div>
    </Layout>
  );
}
