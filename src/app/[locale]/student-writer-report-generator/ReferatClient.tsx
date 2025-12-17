// src/app/[locale]/student-writer-report-generator/ReferatClient.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/referat/HeroSection';
import BenefitsSection from '@/components/referat/BenefitsSection';
import TypesSection from '@/components/referat/TypesSection';
import HowItWorksSection from '@/components/referat/HowItWorksSection';
import SubjectsSection from '@/components/referat/SubjectsSection';
import ProcessSection from '@/components/referat/ProcessSection';
import ReferatPricingSection from '@/components/referat/ReferatPricingSection';
import FAQSection from '@/components/referat/FAQSection';
import CTASection from '@/components/referat/CTASection';

export default function ReferatClient() {
  const t = useTranslations('Referat');

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <BenefitsSection />
        <TypesSection />
        <HowItWorksSection />
        <SubjectsSection />
        <ProcessSection />
        <ReferatPricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
