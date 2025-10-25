// src/app/[locale]/masters-thesis/MastersThesisClient.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import HeroSection from '@/components/masters/HeroSection';
import BenefitsSection from '@/components/masters/BenefitsSection';
import HowItWorksSection from '@/components/masters/HowItWorksSection';
import ProcessSection from '@/components/masters/ProcessSection';
import StructureSection from '@/components/masters/StructureSection';
import PricingSection from '@/components/home/PricingSection';
import FAQSection from '@/components/masters/FAQSection';
import CTASection from '@/components/masters/CTASection';

export default function MastersThesisClient() {
  const t = useTranslations('MastersThesis');

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
