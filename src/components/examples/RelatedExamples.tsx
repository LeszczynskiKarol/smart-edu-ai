// src/components/examples/RelatedExamples.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface RelatedExample {
  _id: string;
  title: string;
  titleEn: string;
  slug: string;
  slugEn: string;
  wordCount: number;
}

interface RelatedExamplesProps {
  exampleId: string;
  category: string;
  locale: string;
}

export default function RelatedExamples({
  exampleId,
  category,
  locale,
}: RelatedExamplesProps) {
  const t = useTranslations('examples');
  const [examples, setExamples] = useState<RelatedExample[]>([]);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/thesis-examples/related?exampleId=${exampleId}&category=${category}&limit=3`
    )
      .then((res) => res.json())
      .then((data) => setExamples(data))
      .catch((err) => console.error('Error fetching related examples:', err));
  }, [exampleId, category]);

  if (examples.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Related Examples</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {examples.map((example) => {
          const title = locale === 'pl' ? example.title : example.titleEn;
          const slug = locale === 'pl' ? example.slug : example.slugEn;

          return (
            <Link
              key={example._id}
              href={`/${locale}/examples/${category}/${slug}`}
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-semibold mb-2 line-clamp-2">{title}</h3>
              <p className="text-sm text-gray-600">
                {example.wordCount} {t('words')}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
