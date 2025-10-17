// src/app/[locale]/student-writer-report-generator/ReportGeneratorClient.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import HeroSection from '@/components/report/HeroSection';
import BenefitsSection from '@/components/report/BenefitsSection';
import ServicesSection from '@/components/report/ServicesSection';
import PricingSection from '@/components/home/PricingSection';
import ProcessSection from '@/components/report/ProcessSection';
import HowItWorksSection from '@/components/report/HowItWorksSection';
import EducationLevelsSection from '@/components/report/EducationLevelsSection';

export default function ReportGeneratorClient() {
  const t = useTranslations('HomeHero');

  return (
    <>
      <HeroSection
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        cta={t('heroCta')}
      />
      <BenefitsSection />
      <HowItWorksSection />
      <ProcessSection />

      <EducationLevelsSection />
      <PricingSection />
    </>
  );
}
