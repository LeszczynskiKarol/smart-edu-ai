// src/components/examples/SubjectGrid.tsx
'use client';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/context/ThemeContext';
import { Subject } from '@/types/example';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';

interface SubjectGridProps {
  subjects: Subject[];
}

export function SubjectGrid({ subjects }: SubjectGridProps) {
  const t = useTranslations('examples');
  const { theme } = useTheme();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Przedmioty</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {subjects.map((subject) => (
          <Link
            key={subject._id}
            href={`/${locale}/examples/secondary/paper/${subject.slugEn}`}
            className={`p-6 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-50'
            } shadow-lg`}
          >
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-green-500" />
              <span className="font-semibold">
                {locale === 'pl' ? subject.name : subject.nameEn}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
