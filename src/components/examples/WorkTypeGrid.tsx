// src/components/examples/WorkTypeGrid.tsx
'use client';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/context/ThemeContext';
import { WorkType } from '@/types/example';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileEdit, FileText, Book, PenTool } from 'lucide-react';

const workTypeIcons = {
  essay: FileText,
  paper: FileEdit,
  report: Book,
  presentation: PenTool,
};

interface WorkTypeGridProps {
  workTypes: WorkType[];
}

export function WorkTypeGrid({ workTypes }: WorkTypeGridProps) {
  const t = useTranslations('examples');
  const { theme } = useTheme();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Rodzaje prac</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {workTypes.map((workType) => {
          const Icon =
            workTypeIcons[workType.slugEn as keyof typeof workTypeIcons] ||
            FileText;
          return (
            <Link
              key={workType._id}
              href={`/${locale}/examples/secondary/${workType.slugEn}`}
              className={`p-6 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50'
              } shadow-lg`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-6 h-6 text-purple-500" />
                <span className="font-semibold">
                  {locale === 'pl' ? workType.name : workType.nameEn}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
