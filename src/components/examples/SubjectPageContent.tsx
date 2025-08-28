// src/components/examples/SubjectPageContent.tsx
'use client';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useTranslations } from 'next-intl';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ExampleList } from '@/components/examples/ExampleList';
import { Filters, FilterOptions } from '@/components/examples/Filters';
import { useEffect, useState } from 'react';
import { ExampleMeta, ExampleLength, Subject, WorkType } from '@/types/example';
import { getExamplesBySubject } from '@/services/examples';

export default function SubjectPage() {
  const params = useParams();
  const t = useTranslations('examples');
  const [examples, setExamples] = useState<ExampleMeta[]>([]);
  const [filteredExamples, setFilteredExamples] = useState<ExampleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);

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
        setLoading(true);

        const [examplesData, workTypesData] = await Promise.all([
          getExamplesBySubject(
            params.locale as string,
            params.level as string,
            params.subject as string
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-types`).then(
            (res) => res.json()
          ),
        ]);

        setExamples(examplesData);
        setFilteredExamples(examplesData);
        setWorkTypes(workTypesData);

        // Tutaj jest zmiana - bierzemy subject z pierwszego przykładu
        if (examplesData.length > 0) {
          setSubject(examplesData[0].subject);
        }
      } catch (error) {
        console.error('Błąd:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...examples];

    // Filtrowanie
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
      filtered = filtered.filter((ex) => ex.workType.slug === filters.workType);
    }

    if (filters.length) {
      filtered = filtered.filter((ex) => ex.length === filters.length);
    }

    // Sortowanie
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
    return <div>Loading...</div>;
  }

  return (
    <Layout
      title={
        params.locale === 'pl'
          ? examples[0]?.subject?.name || subject?.name || ''
          : examples[0]?.subject?.nameEn || subject?.nameEn || ''
      }
    >
      <div className="container mx-auto px-4 py-8 mt-10">
        <h1 className="text-3xl font-bold mb-2">
          {params.locale === 'pl'
            ? `${examples[0].subject.name || subject?.name} || ${t(`levels.${params.level}.name`)}`
            : `${examples[0].subject.nameEn || subject?.nameEn} || ${t(`levels.${params.level}.name`)}`}
        </h1>
        <Breadcrumbs
          items={[
            { label: t('title'), href: `/${params.locale}/examples` },
            {
              label: t(`levels.${params.level}.name`),
              href: `/${params.locale}/examples/${params.level}`,
            },
            {
              label: examples[0]?.workType
                ? params.locale === 'pl'
                  ? examples[0].workType.name
                  : examples[0].workType.nameEn
                : '',
              href: `/${params.locale}/examples/${params.level}/${params.workType}`,
            },
            {
              label: examples[0]?.subject
                ? params.locale === 'pl'
                  ? examples[0].subject.name
                  : examples[0].subject.nameEn
                : '',
            },
          ]}
        />
        <p className="text-gray-600 dark:text-gray-300 mb-8 mt-2">
          {examples.length > 0
            ? t('subjectDescriptions.description', {
                subject:
                  params.locale === 'pl'
                    ? examples[0].subject.name.toLowerCase()
                    : examples[0].subject.nameEn.toLowerCase(),
                level: t(`levels.${params.level}.name`).toLowerCase(),
              })
            : ''}
        </p>
        <Filters
          onFilterChange={handleFilterChange}
          workTypes={workTypes}
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
            subject={params.subject as string}
          />
        )}
      </div>
    </Layout>
  );
}
