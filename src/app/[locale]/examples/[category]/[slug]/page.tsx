// src/app/[locale]/examples/[category]/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ChevronRight, Clock, FileText } from 'lucide-react';
import ExampleContent from '@/components/examples/ExampleContent';
import ExampleSidebar from '@/components/examples/ExampleSidebar';
import TableOfContents from '@/components/examples/TableOfContents';

export default function ExamplePage({
  params: { locale, category, slug },
}: {
  params: { locale: string; category: string; slug: string };
}) {
  const [example, setExample] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations('examples');

  useEffect(() => {
    async function fetchExample() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/thesis-examples/${category}/${slug}`
      );
      if (res.ok) {
        const data = await res.json();
        setExample(data);
      }
    }
    fetchExample();
  }, [category, slug]);

  if (!example) {
    return (
      <Layout title="">
        <div className="container mx-auto px-4 py-8 mt-14">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const title = locale === 'pl' ? example.title : example.titleEn;
  const content = locale === 'pl' ? example.content : example.contentEn;
  const subject = locale === 'pl' ? example.subject : example.subjectEn;

  const breadcrumbs = [
    { label: t('title'), href: `/${locale}/examples` },
    { label: t(`${category}.title`), href: `/${locale}/examples/${category}` },
    { label: title, href: '' },
  ];

  return (
    <Layout title={t(`${category}.title`)}>
      <div className="container mx-auto px-4 py-8 mt-14">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block lg:w-1/5">
            <TableOfContents
              content={content}
              locale={locale}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          </aside>

          <article className="flex-1 lg:w-3/5">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {crumb.label}
                      </span>
                    )}
                  </div>
                ))}
              </nav>

              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {title}
                </h1>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{subject}</span>
                  </div>
                  {example.readTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {example.readTime}{' '}
                        {locale === 'pl' ? 'min czytania' : 'min read'}
                      </span>
                    </div>
                  )}
                </div>
              </header>

              <div className="lg:hidden mb-6">
                <TableOfContents
                  content={content}
                  locale={locale}
                  mobile
                  isExpanded={isExpanded}
                  setIsExpanded={setIsExpanded}
                />
              </div>

              <ExampleContent
                content={content}
                title={title}
                locale={locale}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
              />
            </div>
          </article>

          <aside className="lg:w-1/5">
            <ExampleSidebar locale={locale} />
          </aside>
        </div>
      </div>
    </Layout>
  );
}
