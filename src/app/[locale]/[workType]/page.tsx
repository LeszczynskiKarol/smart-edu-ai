// src/app/[locale]/[workType]/page.tsx
import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import { notFound } from 'next/navigation';
import VideoSection from '@/components/page/VideoSection';
import HeroSection from '@/components/page/HeroSection';
import BenefitsSection from '@/components/page/BenefitsSection';
import ServicesSection from '@/components/page/ServicesSection';
import PricingSection from '@/components/home/PricingSection';
import ProcessSection from '@/components/page/ProcessSection';
import HowItWorksSection from '@/components/page/HowItWorksSection';
import EducationLevelsSection from '@/components/page/EducationLevelsSection';
import { PageData } from '@/types/page';

type PageParams = {
  params: {
    locale: string;
    workType: string;
  };
};

type Props = {
  params: { locale: string; workType: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smart-edu.ai';
  const page = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/${params.workType}`
  );
  const { locale } = params;

  if (!page.ok) return {};
  const data = await page.json();
  const path = `/${params.workType}`;

  return {
    title: params.locale === 'pl' ? data.metaTitle : data.metaTitleEn,
    description:
      params.locale === 'pl' ? data.metaDescription : data.metaDescriptionEn,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: {
        pl: `${baseUrl}/pl${path}`,
        en: `${baseUrl}/en${path}`,
      },
    },
  };
}

export default async function WorkTypePage({
  params: { locale, workType },
}: PageParams) {
  const pageResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/${workType}`
  );

  if (!pageResponse.ok) {
    notFound();
  }

  const data: PageData = await pageResponse.json();
  console.log('Otrzymane dane:', data);
  console.log('sectionsVisibility:', data.sectionsVisibility);
  console.log('benefits:', data.benefits);
  console.log('services:', data.services);
  return (
    <Layout title={locale === 'pl' ? data.title : data.titleEn}>
      {data.sectionsVisibility.hero && (
        <HeroSection
          title={locale === 'pl' ? data.heroTitle : data.heroTitleEn}
          subtitle={locale === 'pl' ? data.heroSubtitle : data.heroSubtitleEn}
          cta={locale === 'pl' ? data.heroCta : data.heroCtaEn}
          features={data.heroFeatures || []}
          heroImage={data.heroImage}
          locale={locale}
        />
      )}

      {data.sectionsVisibility.benefits && (
        <BenefitsSection
          title={
            locale === 'pl'
              ? data.benefitsSectionTitle
              : data.benefitsSectionTitleEn
          }
          benefits={data.benefits.map((benefit) => ({
            title: locale === 'pl' ? benefit.title : benefit.titleEn,
            description:
              locale === 'pl' ? benefit.description : benefit.descriptionEn,
            icon: benefit.icon,
          }))}
        />
      )}

      {data.sectionsVisibility.process && (
        <ProcessSection
          title={
            locale === 'pl'
              ? data.processSectionTitle
              : data.processSectionTitleEn
          }
          steps={data.processSteps.map((step) => ({
            title: locale === 'pl' ? step.title : step.titleEn,
            description:
              locale === 'pl' ? step.description : step.descriptionEn,
          }))}
        />
      )}

      {data.sectionsVisibility.services && (
        <ServicesSection
          title={
            locale === 'pl'
              ? data.servicesSectionTitle
              : data.servicesSectionTitleEn
          }
          services={data.services.map((service) => ({
            title: locale === 'pl' ? service.title : service.titleEn,
            description:
              locale === 'pl' ? service.description : service.descriptionEn,
            icon: service.icon,
            price: service.price,
          }))}
        />
      )}

      {data.sectionsVisibility.video && (
        <VideoSection
          title={locale === 'pl' ? data.videoTitle : data.videoTitleEn}
          description={
            locale === 'pl' ? data.videoDescription : data.videoDescriptionEn
          }
          url={data.videoUrl}
        />
      )}

      {data.sectionsVisibility.howItWorks && (
        <HowItWorksSection
          title={
            locale === 'pl'
              ? data.howItWorksSectionTitle
              : data.howItWorksSectionTitleEn
          }
          steps={data.howItWorksSteps.map((step) => ({
            title: locale === 'pl' ? step.title : step.titleEn,
            description:
              locale === 'pl' ? step.description : step.descriptionEn,
            icon: step.icon,
          }))}
        />
      )}

      {data.sectionsVisibility.educationLevels && (
        <EducationLevelsSection
          title={
            locale === 'pl'
              ? data.educationLevelsSectionTitle
              : data.educationLevelsSectionTitleEn
          }
          levels={data.educationLevels.map((level) => ({
            title: locale === 'pl' ? level.title : level.titleEn,
            description:
              locale === 'pl' ? level.description : level.descriptionEn,
            icon: level.icon,
          }))}
        />
      )}

      {data.sectionsVisibility.pricing && (
        <PricingSection
          title={
            locale === 'pl'
              ? data.pricingSectionTitle
              : data.pricingSectionTitleEn
          }
          plans={data.pricingPlans.map((plan) => ({
            name: locale === 'pl' ? plan.name : plan.nameEn,
            price: plan.price,
            features: locale === 'pl' ? plan.features : plan.featuresEn,
            isPopular: plan.isPopular,
          }))}
        />
      )}
    </Layout>
  );
}
