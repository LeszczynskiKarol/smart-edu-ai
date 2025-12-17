// src/components/rozprawka/RozprawkaPricintSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Check,
  Sparkles,
  Clock,
  Zap,
  Shield,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations, useLocale } from 'next-intl';
import { useExchangeRate, convertPLNtoUSD } from '@/hooks/useExchangeRate';

interface PricingTier {
  id: string;
  words: number;
  pages: string;
  pricePLN: number;
  popular?: boolean;
}

const RozprawkaPricingSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Rozprawka.pricing');
  const locale = useLocale();
  const { rate, loading } = useExchangeRate();

  const currentRate = loading ? 4.0 : rate;

  const formatPrice = (pricePLN: number) => {
    if (locale === 'pl') {
      return `${pricePLN.toFixed(2)} zł`;
    } else {
      const priceUSD = convertPLNtoUSD(pricePLN, currentRate);
      return `$${priceUSD.toFixed(2)}`;
    }
  };

  // Cennik: 1000 znaków = 3.99 zł, ~8 znaków/słowo
  const pricingTiers: PricingTier[] = [
    { id: 'very-short', words: 250, pages: '~1', pricePLN: 7.98 },
    { id: 'short', words: 350, pages: '~1.5-2', pricePLN: 11.96 },
    { id: 'medium', words: 500, pages: '~2', pricePLN: 15.96, popular: true },
    { id: 'long', words: 800, pages: '~4', pricePLN: 27.92 },
    { id: 'very-long', words: 1300, pages: '~5-6', pricePLN: 41.5 },
    { id: 'mega', words: 2500, pages: '~11', pricePLN: 79.8 },
    { id: 'longest', words: 4000, pages: '~17', pricePLN: 127.68 },
  ];

  const features = [
    { icon: Zap, text: t('features.instant') },
    { icon: Shield, text: t('features.secure') },
    { icon: Clock, text: t('features.available') },
    { icon: CreditCard, text: t('features.payAsYouGo') },
  ];

  return (
    <section
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('title')}
          </h2>
          <p
            className={`text-xl max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <motion.div
          className={`max-w-5xl mx-auto rounded-2xl overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-xl mb-12`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FileText className="w-8 h-8" />
              <h3 className="text-2xl font-bold">{t('tableTitle')}</h3>
            </div>
            <p className="text-center text-white/80 text-sm">
              {t('tableSubtitle')}
            </p>
          </div>

          {/* Pricing Items */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                className={`flex items-center justify-between p-4 md:p-6 ${
                  tier.popular
                    ? theme === 'dark'
                      ? 'bg-purple-900/20 border-l-4 border-purple-500'
                      : 'bg-purple-50 border-l-4 border-purple-500'
                    : ''
                } hover:${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Left: Description */}
                <div className="flex items-center gap-4">
                  {tier.popular && (
                    <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold">
                      <Sparkles className="w-3 h-3" />
                      {t('popular')}
                    </div>
                  )}
                  <div>
                    <div
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {t(`tiers.${tier.id}.name`)}
                    </div>
                    <div
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {tier.pages} {t('pages')}, {tier.words} {t('words')}
                    </div>
                  </div>
                </div>

                {/* Right: Price */}
                <div className="text-right">
                  <div
                    className={`text-2xl font-bold ${
                      tier.popular
                        ? 'text-purple-500'
                        : theme === 'dark'
                          ? 'text-blue-400'
                          : 'text-blue-600'
                    }`}
                  >
                    {formatPrice(tier.pricePLN)}
                  </div>
                  {tier.popular && (
                    <div className="md:hidden text-xs text-purple-500 font-medium">
                      {t('popular')}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Base Price Info */}
          <div
            className={`p-4 text-center text-sm ${
              theme === 'dark'
                ? 'bg-gray-700/50 text-gray-400'
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            {t('basePriceInfo', { price: formatPrice(3.99) })}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-md`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {feature.text}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            {t('cta')}
          </Link>
          <p
            className={`mt-4 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {t('ctaSubtext')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default RozprawkaPricingSection;
