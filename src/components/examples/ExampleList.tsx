// src/components/examples/ExampleList.tsx
'use client';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/context/ThemeContext';
import { ExampleMeta } from '@/types/example';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

interface ExampleListProps {
  examples: ExampleMeta[];
  level: string;
  subject?: string;
  workType?: string;
}

export function ExampleList({
  examples,
  level,
  subject,
  workType,
}: ExampleListProps) {
  const t = useTranslations('examples');
  const { theme } = useTheme();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="space-y-6">
      {examples.map((example, index) => (
        <motion.div
          key={example._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Link
            href={`/${locale}/examples/${level}/${example.workType.slugEn}/${example.subject.slugEn}/${example.slugEn}`}
            className={`block p-6 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-50'
            } shadow-lg`}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {locale === 'pl' ? example.title : example.titleEn}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t(`lengths.${example.length}`)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2 self-center">
                <Link
                  href={`/${locale}/examples/${level}/${example.workType.slugEn}`}
                  className="px-4 py-2 text-sm rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors cursor-pointer flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="mr-1">📝</span>
                  {locale === 'pl'
                    ? example.workType.name
                    : example.workType.nameEn}
                </Link>
                <Link
                  href={`/${locale}/examples/${level}/${example.workType.slugEn}/${example.subject.slugEn}`}
                  className="px-4 py-2 text-sm rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="mr-1">📚</span>
                  {locale === 'pl'
                    ? example.subject.name
                    : example.subject.nameEn}
                </Link>
                <Link
                  href={`/${locale}/examples/${level}`}
                  className="px-4 py-2 text-sm rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors cursor-pointer flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="mr-1">🎓</span>
                  {t(`levels.${example.level}.name`)}
                </Link>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
