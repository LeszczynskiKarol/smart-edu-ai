// src/app/[locale]/[workType]/[subject]/page.tsx
import { Metadata } from 'next';
import PageContent from '@/components/PageContent';
import { notFound } from 'next/navigation';

type PageParams = {
  params: {
    locale: string;
    workType: string;
    subject: string;
  };
};

type Props = {
  params: { locale: string; workType: string; subject: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/${params.workType}/${params.subject}`
  );

  if (!page.ok) return {};

  const data = await page.json();

  return {
    title: params.locale === 'pl' ? data.metaTitle : data.metaTitleEn,
    description:
      params.locale === 'pl' ? data.metaDescription : data.metaDescriptionEn,
  };
}

export default async function SubjectPage({
  params: { locale, workType, subject },
}: PageParams) {
  const pageResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/${workType}/${subject}`
  );

  if (!pageResponse.ok) {
    notFound();
  }

  const data = await pageResponse.json();

  return (
    <PageContent
      title={locale === 'pl' ? data.title : data.titleEn}
      content={locale === 'pl' ? data.content : data.contentEn}
      metaDescription={
        locale === 'pl' ? data.metaDescription : data.metaDescriptionEn
      }
    />
  );
}
