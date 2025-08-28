// src/components/examples/ExampleCategories.tsx
'use client';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/context/ThemeContext';
import { EducationLevel } from '@/types/example';
import Link from 'next/link';
import { Book, GraduationCap, School } from 'lucide-react';

const educationLevels: { id: EducationLevel; icon: any }[] = [
  { id: 'primary', icon: School },
  { id: 'secondary', icon: Book },
  { id: 'university', icon: GraduationCap },
];

export function ExampleCategories() {
  const t = useTranslations('examples');
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {educationLevels.map((level) => (
        <Link
          key={level.id}
          href={`/examples/${level.id}`}
          className={`p-6 rounded-lg transition-all ${
            theme === 'dark'
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-white hover:bg-gray-50'
          } shadow-lg`}
        >
          <div className="flex items-center mb-4">
            <level.icon className="w-8 h-8 mr-3 text-blue-500" />
            <h2 className="text-xl font-semibold">
              {t(`levels.${level.id}.name`)}
            </h2>
          </div>
        </Link>
      ))}
    </div>
  );
}
