// src/app/[locale]/examples/[category]/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/Layout';
import ExamplePageClient from '@/components/examples/ExamplePageClient';

const validCategories = ['bachelor', 'master', 'coursework'];

async function getExample(category: string, slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/thesis-examples/${category}/${slug}`,
    {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function generateMetadata({
  params: { locale, category, slug },
}: {
  params: { locale: string; category: string; slug: string };
}) {
  if (!validCategories.includes(category)) {
    return {};
  }

  const example = await getExample(category, slug);

  if (!example) {
    return {};
  }

  const title =
    locale === 'pl'
      ? example.metaTitlePl || example.title
      : example.metaTitleEn || example.titleEn;

  const description =
    locale === 'pl' ? example.metaDescriptionPl : example.metaDescriptionEn;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function ExamplePage({
  params: { locale, category, slug },
}: {
  params: { locale: string; category: string; slug: string };
}) {
  // ✅ DODAJ TĘ LINIJKĘ
  unstable_setRequestLocale(locale);

  if (!validCategories.includes(category)) {
    notFound();
  }

  const example = await getExample(category, slug);

  if (!example) {
    notFound();
  }

  const t = await getTranslations('examples');
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
          <ExamplePageClient
            locale={locale}
            category={category}
            title={title}
            content={content}
            subject={subject}
            breadcrumbs={breadcrumbs}
            example={example}
          />
        </div>
      </div>
    </Layout>
  );
}
