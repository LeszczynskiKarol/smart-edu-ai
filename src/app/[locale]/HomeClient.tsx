// src/app/[locale]/HomeClient.tsx
'use client';
import ComparisonExport from '@/components/comparison/ComparisonExport';
import React from 'react';
import { useTranslations } from 'next-intl';
import VideoSection from '@/components/home/VideoSection';
import HeroSection from '@/components/home/HeroSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import ServicesSection from '@/components/home/ServicesSection';
import PricingSection from '@/components/home/PricingSection';
import ProcessSection from '@/components/home/ProcessSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import EducationLevelsSection from '@/components/home/EducationLevelsSection';

export default function HomeClient() {
  const t = useTranslations('Home');

  return (
    <>
      <HeroSection
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        cta={t('heroCta')}
      />
      <ComparisonExport />
      <VideoSection />
      <BenefitsSection />
      <HowItWorksSection />
      <ProcessSection />
      <ServicesSection />
      <EducationLevelsSection />
      <PricingSection />
    </>
  );
}
