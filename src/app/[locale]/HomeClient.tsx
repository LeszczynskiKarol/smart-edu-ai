// src/app/[locale]/HomeClient.tsx
'use client';

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
import FAQSection from '@/components/home/FAQSection';
import TrustSection from '@/components/home/TrustSection';

export default function HomeClient() {
  const t = useTranslations('Home');

  return (
    <>
      <HeroSection
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        cta={t('heroCta')}
      />
      <VideoSection />
      <BenefitsSection />
      <TrustSection />
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <ProcessSection />

      <ServicesSection />
      <EducationLevelsSection />
      <div id="faq">
        <FAQSection />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
    </>
  );
}
