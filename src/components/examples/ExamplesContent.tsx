// src/components/examples/ExamplesContent.tsx
'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PaperList } from './PaperList';
import { CategoryAndSubjectGrid } from './CategoryAndSubjectGrid';
import {
  getAllWorkTypes,
  getAllSubjects,
  getAllExamples,
} from '@/services/examples';
import { WorkType, Subject, ExampleMeta } from '@/types/example';
import Loader from '@/components/ui/Loader';

export function ExamplesContent() {
  const t = useTranslations('examples');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    examples: ExampleMeta[];
    workTypes: WorkType[];
    subjects: Subject[];
  }>({
    examples: [],
    workTypes: [],
    subjects: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examples, workTypes, subjects] = await Promise.all([
          getAllExamples(), // zmiana tutaj
          getAllWorkTypes(),
          getAllSubjects(),
        ]);

        setData({ examples, workTypes, subjects });
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const examplesByLevel: Record<string, ExampleMeta[]> = {
    primary: data.examples.filter((ex) => ex.level === 'primary'),
    secondary: data.examples.filter((ex) => ex.level === 'secondary'),
    university: data.examples.filter((ex) => ex.level === 'university'),
  };

  return (
    <>
      <PaperList examples={data.examples} />
      {['primary', 'secondary', 'university'].map((level) => (
        <section key={level} className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            {t(`levels.${level}.name`)}
          </h2>
          <CategoryAndSubjectGrid
            level={level}
            workTypes={data.workTypes}
            subjects={data.subjects}
            examples={examplesByLevel[level]}
          />
        </section>
      ))}
    </>
  );
}
