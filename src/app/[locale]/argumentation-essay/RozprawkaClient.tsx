// src/app/[locale]/rozprawka/RozprawkaClient.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import HeroSection from '@/components/rozprawka/HeroSection';
import BenefitsSection from '@/components/rozprawka/BenefitsSection';
import HowItWorksSection from '@/components/rozprawka/HowItWorksSection';
import TypesSection from '@/components/rozprawka/TypesSection';
import StructureSection from '@/components/rozprawka/StructureSection';
import ProcessSection from '@/components/rozprawka/ProcessSection';
import RozprawkaPricingSection from '@/components/rozprawka/RozprawkaPricingSection';
import FAQSection from '@/components/rozprawka/FAQSection';
import CTASection from '@/components/rozprawka/CTASection';

export default function RozprawkaClient() {
  const t = useTranslations('Rozprawka');

  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <TypesSection />
      <HowItWorksSection />
      <StructureSection />
      <ProcessSection />
      <RozprawkaPricingSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
