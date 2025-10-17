// src/app/[locale]/examples/[category]/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ChevronRight, Clock, FileText } from 'lucide-react';
import ExampleContent from '@/components/examples/ExampleContent';
import ExampleSidebar from '@/components/examples/ExampleSidebar';
import TableOfContents from '@/components/examples/TableOfContents';

// ... reszta kodu ...

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
        <div>Loading...</div>
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
              {/* ... breadcrumbs i header ... */}

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
        </div>
      </div>
    </Layout>
  );
}
