// src/components/examples/ExamplePageContent.tsx
'use client';
import { useRef, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ContentActions } from '@/components/examples/ContentActions';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { RelatedExamples } from '@/components/examples/RelatedExamples';
import { SignupBanner } from '@/components/examples/SignupBanner';
import Layout from '@/components/layout/Layout';
import { useTranslations } from 'next-intl';
import { Example } from '@/types/example';
import { getRelatedExamples, getExampleBySlug } from '@/services/examples';
import { useHomeTracking } from '@/hooks/useHomeTracking';

export default function ExamplePage() {
  const { trackEvent } = useHomeTracking('ExampleWorkSite');
  const pageViewTracked = useRef(false);
  const t = useTranslations('examples');
  const params = useParams();
  const [example, setExample] = useState<Example | null>(null);
  const [loading, setLoading] = useState(true);
  const { locale, level, workType, subject, slug } = params;
  const [similarExamples, setSimilarExamples] = useState<Example[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const exampleData = await getExampleBySlug(
          locale as string,
          level as string,
          workType as string,
          subject as string,
          slug as string
        );

        // Usuwamy czyszczenie HTML, zostawiamy tylko podstawowe dekodowanie encji HTML
        const cleanedExample = {
          ...exampleData,
          content: exampleData.content
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>'),
          contentEn: exampleData.contentEn
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>'),
        };

        setExample(cleanedExample);
        const relatedData = await getRelatedExamples(cleanedExample);
        setSimilarExamples(relatedData);
      } catch (error) {
        console.error('Error details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (level && workType && subject && slug) {
      fetchData();
    }
  }, [params]);

  useEffect(() => {
    if (!pageViewTracked.current) {
      pageViewTracked.current = true;
      trackEvent('pageView', {
        component: 'ExamplePage',
        exampleId: slug,
        path: window.location.pathname,
        level,
        subject,
        workType,
      });
    }
  }, []);

  useEffect(() => {
    const fetchExample = async () => {
      try {
        const data = await getExampleBySlug(
          locale as string,
          level as string,
          workType as string,
          subject as string,
          slug as string
        );

        setExample(data);
      } catch (error) {
        console.error('Error details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (level && workType && subject && slug) {
      fetchExample();
    }
  }, [params]);

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (!example) {
    return <div>Nie znaleziono przykładu</div>;
  }

  const workTypeSlug = example.workType.slugEn;
  const subjectSlug = example.subject.slugEn;

  return (
    <Layout title={example.title}>
      {/* Zmieniam container aby był bardziej responsywny */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-8 sm:mt-6 lg:mt-10">
        {/* Dodaję lepsze breakpointy dla układu flex */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Główna treść - poprawiona responsywność */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-2 sm:mb-4">
              {locale === 'en' ? example.titleEn : example.title}
            </h1>

            {/* Breadcrumbs z lepszym paddingiem na mobile */}
            <div className="mb-4 sm:mb-6 lg:mb-8 overflow-x-auto">
              <Breadcrumbs
                items={[
                  { label: t('title'), href: `/${locale}/examples` },
                  {
                    label: t(`levels.${example.level}.name`),
                    href: `/${locale}/examples/${example.level}`,
                  },
                  {
                    label:
                      locale === 'en'
                        ? example.workType.nameEn
                        : example.workType.name,
                    href: `/${locale}/examples/${example.level}/${workTypeSlug}`,
                  },
                  {
                    label:
                      locale === 'en'
                        ? example.subject.nameEn
                        : example.subject.name,
                    href: `/${locale}/examples/${example.level}/${workTypeSlug}/${subjectSlug}`,
                  },
                  { label: locale === 'en' ? example.titleEn : example.title },
                ]}
              />
            </div>
            <div className="mb-4">
              <p className="text-gray-500 mb-2">{t('createdBy')}</p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {example.tags &&
                  example.tags.length > 0 &&
                  example.tags[0] !== '' && (
                    <>
                      <span className="text-gray-600">{t('tags')}:</span>
                      {example.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </>
                  )}

                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{t('length')}:</span>
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm whitespace-nowrap">
                    {t(`lengths.${example.length}`)}
                  </span>
                </div>
              </div>
            </div>

            {/* Treść artykułu z lepszym paddingiem */}
            <article className="article-content prose max-w-none">
              <ContentActions
                content={locale === 'en' ? example.contentEn : example.content}
                title={locale === 'en' ? example.titleEn : example.title}
                exampleId={example._id}
              />
              <div
                className="overflow-x-auto"
                dangerouslySetInnerHTML={{
                  __html: locale === 'en' ? example.contentEn : example.content,
                }}
              />
            </article>
          </div>

          {/* Sidebar - poprawiona responsywność */}
          <div className="w-full lg:w-80 mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-12 p-4 sm:p-6 rounded-lg shadow-sm">
              <SignupBanner />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
