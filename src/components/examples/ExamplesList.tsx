// src/components/examples/ExamplesList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Example {
  _id: string;
  title: string;
  titleEn: string;
  slug: string;
  slugEn: string;
  subject?: string;
  subjectEn?: string;
  wordCount: number;
  views: number;
  featured: boolean;
}

interface ExamplesListProps {
  examples: Example[];
  category: string;
  locale: string;
}

export default function ExamplesList({
  examples,
  category,
  locale,
}: ExamplesListProps) {
  const t = useTranslations('examples');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExamples = examples.filter((example) => {
    const title = locale === 'pl' ? example.title : example.titleEn;
    const subject = locale === 'pl' ? example.subject : example.subjectEn;
    const searchLower = searchTerm.toLowerCase();

    return (
      title.toLowerCase().includes(searchLower) ||
      (subject && subject.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div>
      <div className="mb-8">
        <input
          type="text"
          placeholder={t('search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg"
        />
      </div>

      {filteredExamples.length === 0 ? (
        <p className="text-center text-gray-600 py-12">{t('noResults')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExamples.map((example) => {
            const title = locale === 'pl' ? example.title : example.titleEn;
            const slug = locale === 'pl' ? example.slug : example.slugEn;
            const subject =
              locale === 'pl' ? example.subject : example.subjectEn;

            return (
              <Link
                key={example._id}
                href={`/${locale}/examples/${category}/${slug}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                {example.featured && (
                  <span className="inline-block bg-yellow-400 text-xs px-2 py-1 rounded mb-2">
                    ⭐ Featured
                  </span>
                )}

                <h3 className="text-xl font-bold mb-2 line-clamp-2">{title}</h3>

                {subject && (
                  <p className="text-sm text-gray-600 mb-3">{subject}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {example.wordCount} {t('words')}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
