// src/components/examples/WorkTypeExamplesPageContent.tsx
'use client';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useTranslations } from 'next-intl';
import { ExampleList } from '@/components/examples/ExampleList';
import { Filters, FilterOptions } from '@/components/examples/Filters';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useEffect, useState } from 'react';
import { ExampleMeta, ExampleLength, WorkType, Subject } from '@/types/example';
import { getExamplesByWorkType } from '@/services/examples';

export default function WorkTypePage() {
  const params = useParams();
  const t = useTranslations('examples');
  const [examples, setExamples] = useState<ExampleMeta[]>([]);
  const [filteredExamples, setFilteredExamples] = useState<ExampleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [workType, setWorkType] = useState<WorkType | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);

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
        // Sprawdzamy najpierw czy to workType
        const workTypeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/work-types/${params.workType}`
        );

        if (workTypeResponse.ok) {
          const workTypeData = await workTypeResponse.json();
          setWorkType(workTypeData);
        } else {
          // Jeśli nie znaleziono workType, sprawdzamy czy to subject
          const subjectResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/${params.workType}`
          );
          if (subjectResponse.ok) {
            const subjectData = await subjectResponse.json();
            setSubject(subjectData);
          }
        }

        // Reszta fetchowania danych...
        const [examplesData, subjectsData] = await Promise.all([
          getExamplesByWorkType(
            params.locale as string,
            params.level as string,
            params.workType as string
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects`).then((res) =>
            res.json()
          ),
        ]);

        setExamples(examplesData);
        setFilteredExamples(examplesData);
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
    <Layout
      title={
        params.locale === 'pl'
          ? `${workType?.name || subject?.name} || ${t(`levels.${params.level}.name`)}`
          : `${workType?.nameEn || subject?.nameEn} || ${t(`levels.${params.level}.name`)}`
      }
    >
      <div className="container mx-auto px-4 py-8 mt-10">
        <h1 className="text-3xl font-bold mb-2">
          {params.locale === 'pl'
            ? `${workType?.name || subject?.name} || ${t(`levels.${params.level}.name`)}`
            : `${workType?.nameEn || subject?.nameEn} || ${t(`levels.${params.level}.name`)}`}
        </h1>
        <Breadcrumbs
          items={[
            { label: t('title'), href: `/${params.locale}/examples` },
            {
              label: t(`levels.${params.level}.name`),
              href: `/${params.locale}/examples/${params.level}`,
            },
            {
              label:
                params.locale === 'pl'
                  ? workType?.name || ''
                  : workType?.nameEn || '',
            },
          ]}
        />
        <p className="text-gray-600 dark:text-gray-300 mb-8 mt-2">
          {workType &&
            t('workTypeDescriptions.description', {
              workType:
                params.locale === 'pl'
                  ? workType.name.toLowerCase()
                  : workType.nameEn.toLowerCase(),
              level: t(`levels.${params.level}.name`).toLowerCase(),
            })}
        </p>

        <Filters
          onFilterChange={handleFilterChange}
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
            workType={params.workType as string}
          />
        )}
      </div>
    </Layout>
  );
}
