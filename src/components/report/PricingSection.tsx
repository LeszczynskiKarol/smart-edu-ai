// src/components/report/PricingSection.tsx

'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations, useLocale } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';

const PricingSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('PricingSection');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const { trackCTAClick } = useHomeTracking('PricingSection');

  const handleCTAClick = () => {
    trackCTAClick('pricing_register', {
      currentPrice: locale === 'pl' ? '3,99 zł' : '$0.99',
      locale: locale,
      features: features.length,
    });
  };

  // Logika ceny w zależności od lokalizacji
  const price = locale === 'pl' ? '3,99 zł' : '$0.99';

  // Pobierz features jako tablicę - musimy użyć getAll() zamiast zwykłego t()
  const features: string[] = t.raw('features') as string[];

  return (
    <section
      ref={sectionRef}
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'}`}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('title')}
        </motion.h2>
        <motion.div
          className={`max-w-4xl mx-auto rounded-lg shadow-xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg'
              : 'bg-white bg-opacity-75 backdrop-filter backdrop-blur-lg'
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-8">
            {/*<div className="flex items-center justify-center mb-8">
              <span
                className={`text-lg mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
              >
                {t('priceFrom')}
              </span>
              <span
                className={`text-5xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
              >
                {price}
              </span>
              <span
                className={`text-xl ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {t('priceUnit')}
              </span>
            </div>
            <p
              className={`text-center mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
            >
              {t('discount')}
            </p>*/}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {features.map((feature: string, index: number) => (
                <motion.div
                  key={index}
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Check
                    className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mr-2`}
                  />
                  <span
                    className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                onClick={handleCTAClick}
                className={`btn ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white px-8 py-3 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:-translate-y-1 inline-flex items-center justify-center w-full`}
              >
                {t('cta')}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
