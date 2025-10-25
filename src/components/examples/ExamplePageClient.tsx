// src/components/examples/ExamplePageClient.tsx
'use client';

import { useState } from 'react';
import { Clock, FileText } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useTranslations } from 'next-intl';
import ExampleContent from './ExampleContent';
import ExampleSidebar from './ExampleSidebar';
import TableOfContents from './TableOfContents';

interface Breadcrumb {
  label: string;
  href: string;
}

interface ExamplePageClientProps {
  locale: string;
  category: string;
  title: string;
  content: string;
  subject?: string;
  breadcrumbs: Breadcrumb[];
  example: any;
}

export default function ExamplePageClient({
  locale,
  category,
  title,
  content,
  subject,
  breadcrumbs,
  example,
}: ExamplePageClientProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations('examples');

  return (
    <>
      {/* Table of Contents - Left Sidebar */}
      <aside className="hidden lg:block lg:w-1/5">
        <TableOfContents
          content={content}
          locale={locale}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </aside>

      {/* Main Content - Center */}
      <article className="flex-1 lg:w-3/5">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {subject && (
                <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                  <FileText className="w-4 h-4" />
                  <span>{subject}</span>
                </div>
              )}
              {example.wordCount > 0 && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>
                    {example.wordCount} {t('words')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(example.createdAt).toLocaleDateString(
                    locale === 'pl' ? 'pl-PL' : 'en-US'
                  )}
                </span>
              </div>
            </div>
          </header>

          {/* Mobile TOC */}
          <div className="lg:hidden mb-6">
            <TableOfContents
              content={content}
              locale={locale}
              mobile
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          </div>

          {/* Content with Actions */}
          <ExampleContent
            content={content}
            title={title}
            locale={locale}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        </div>
      </article>

      {/* CTA Sidebar - Right */}
      <aside className="lg:w-1/5">
        <ExampleSidebar locale={locale} />
      </aside>
    </>
  );
}
