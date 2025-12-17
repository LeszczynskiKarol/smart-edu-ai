// src/components/referat/ReferatPricingSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations, useLocale } from 'next-intl';
import {
  Zap,
  Shield,
  Clock,
  CreditCard,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const ReferatPricingSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Referat');
  const locale = useLocale();

  // Pricing tiers based on character count (3.99 zł per 1000 chars)
  const pricingTiers = [
    {
      id: 'very-short',
      name: t('pricing.tiers.very-short.name'),
      words: 250,
      pages: '~1',
      pricePLN: 7.98,
      priceUSD: 2.0,
    },
    {
      id: 'short',
      name: t('pricing.tiers.short.name'),
      words: 350,
      pages: '~1.5-2',
      pricePLN: 11.96,
      priceUSD: 3.0,
    },
    {
      id: 'medium',
      name: t('pricing.tiers.medium.name'),
      words: 500,
      pages: '~2',
      pricePLN: 15.96,
      priceUSD: 4.0,
      popular: true,
    },
    {
      id: 'long',
      name: t('pricing.tiers.long.name'),
      words: 800,
      pages: '~4',
      pricePLN: 27.92,
      priceUSD: 7.0,
    },
    {
      id: 'very-long',
      name: t('pricing.tiers.very-long.name'),
      words: 1300,
      pages: '~5-6',
      pricePLN: 41.5,
      priceUSD: 10.5,
    },
    {
      id: 'mega',
      name: t('pricing.tiers.mega.name'),
      words: 2500,
      pages: '~11',
      pricePLN: 79.8,
      priceUSD: 20.0,
    },
    {
      id: 'longest',
      name: t('pricing.tiers.longest.name'),
      words: 4000,
      pages: '~17',
      pricePLN: 127.68,
      priceUSD: 32.0,
    },
  ];

  const formatPrice = (pricePLN: number, priceUSD: number) => {
    if (locale === 'pl') {
      return `${pricePLN.toFixed(2).replace('.', ',')} zł`;
    }
    return `$${priceUSD.toFixed(2)}`;
  };

  const features = [
    { icon: Zap, text: t('pricing.features.instant') },
    { icon: Shield, text: t('pricing.features.secure') },
    { icon: Clock, text: t('pricing.features.available') },
    { icon: CreditCard, text: t('pricing.features.payAsYouGo') },
  ];

  return (
    <section
      className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('pricing.title')}
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        {/* Pricing Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`max-w-4xl mx-auto rounded-2xl overflow-hidden ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          } shadow-xl`}
        >
          {/* Table Header */}
          <div
            className={`p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-blue-600'
            }`}
          >
            <h3 className="text-xl font-bold text-white text-center">
              {t('pricing.tableTitle')}
            </h3>
            <p className="text-blue-100 text-center mt-1 text-sm">
              {t('pricing.tableSubtitle')}
            </p>
          </div>

          {/* Table Body */}
          <div className="p-6">
            <div className="space-y-3">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                    tier.popular
                      ? theme === 'dark'
                        ? 'bg-blue-500/20 ring-2 ring-blue-500'
                        : 'bg-blue-50 ring-2 ring-blue-500'
                      : theme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-750'
                        : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Popular badge */}
                  {tier.popular && (
                    <div className="absolute -top-2 right-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                        <Sparkles className="w-3 h-3" />
                        {t('pricing.popular')}
                      </span>
                    </div>
                  )}

                  {/* Left - Name and details */}
                  <div className="flex items-center gap-4">
                    <div>
                      <h4
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {tier.name}
                      </h4>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {tier.pages} {t('pricing.pages')} • {tier.words}{' '}
                        {t('pricing.words')}
                      </p>
                    </div>
                  </div>

                  {/* Right - Price */}
                  <div className="text-right">
                    <div
                      className={`text-xl font-bold ${
                        tier.popular
                          ? 'text-blue-600 dark:text-blue-400'
                          : theme === 'dark'
                            ? 'text-white'
                            : 'text-gray-900'
                      }`}
                    >
                      {formatPrice(tier.pricePLN, tier.priceUSD)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Base price info */}
            <p
              className={`text-center text-sm mt-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {t('pricing.basePriceInfo', {
                price: locale === 'pl' ? '3,99 zł' : '$1.00',
              })}
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 mt-12"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              <feature.icon
                className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              />
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {t('pricing.cta')}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p
            className={`mt-4 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {t('pricing.ctaSubtext')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ReferatPricingSection;
