// src/app/[locale]/composition/WypracowanieClient.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import HeroSection from '@/components/composition/HeroSection';
import BenefitsSection from '@/components/composition/BenefitsSection';
import HowItWorksSection from '@/components/composition/HowItWorksSection';
import TypesSection from '@/components/composition/TypesSection';
import SubjectsSection from '@/components/composition/SubjectsSection';
import ProcessSection from '@/components/composition/ProcessSection';
import WypracowaniePricingSection from '@/components/composition/WypracowaniePricingSection';
import FAQSection from '@/components/composition/FAQSection';
import CTASection from '@/components/composition/CTASection';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function WypracowanieClient() {
  const t = useTranslations('Wypracowanie');

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
        <WypracowaniePricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
