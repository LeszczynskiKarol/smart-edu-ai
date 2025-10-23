// src/app/[locale]/bachelors-thesis/BachelorsThesisClient.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import HeroSection from '@/components/bachelors/HeroSection';
import BenefitsSection from '@/components/bachelors/BenefitsSection';
import HowItWorksSection from '@/components/bachelors/HowItWorksSection';
import ProcessSection from '@/components/bachelors/ProcessSection';
import StructureSection from '@/components/bachelors/StructureSection';
import PricingSection from '@/components/home/PricingSection';
import FAQSection from '@/components/bachelors/FAQSection';
import CTASection from '@/components/bachelors/CTASection';

export default function BachelorsThesisClient() {
  const t = useTranslations('BachelorsThesis');

  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <StructureSection />
      <ProcessSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
