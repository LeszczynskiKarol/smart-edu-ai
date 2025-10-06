// src/components/home/PricingSection.tsx
'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, FileText, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations, useLocale } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import { useExchangeRate, convertPLNtoUSD } from '@/hooks/useExchangeRate';

const PricingSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('PricingSection');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const { trackCTAClick } = useHomeTracking('PricingSection');
  const { rate, loading } = useExchangeRate();

  const currentRate = loading ? 4.0 : rate;

  const formatPrice = (pricePLN: number) => {
    if (locale === 'pl') {
      return `${pricePLN} zł`;
    } else {
      const priceUSD = convertPLNtoUSD(pricePLN, currentRate);
      return `$${priceUSD.toFixed(2)}`;
    }
  };

  const pricingPlans = [
    {
      id: 'bachelor',
      icon: GraduationCap,
      title: t('plans.bachelor.title'),
      subtitle: t('plans.bachelor.subtitle'),
      price: formatPrice(199),
      features: t.raw('plans.bachelor.features') as string[],
      popular: false,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'master',
      icon: Award,
      title: t('plans.master.title'),
      subtitle: t('plans.master.subtitle'),
      price: formatPrice(249),
      features: t.raw('plans.master.features') as string[],
      popular: true,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'regular',
      icon: FileText,
      title: t('plans.regular.title'),
      subtitle: t('plans.regular.subtitle'),
      priceFrom: true,
      price: formatPrice(7.98),
      features: t.raw('plans.regular.features') as string[],
      popular: false,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const handleCTAClick = (planId: string) => {
    trackCTAClick(`pricing_${planId}`, {
      locale: locale,
      plan: planId,
    });
  };

  return (
    <section
      ref={sectionRef}
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            className={`text-xl ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div
                      className={`flex items-center gap-1 px-4 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${plan.gradient}`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {t('popularBadge')}
                    </div>
                  </div>
                )}

                <motion.div
                  className={`relative h-full rounded-2xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } shadow-xl ${
                    plan.popular ? 'ring-2 ring-purple-500 lg:scale-105' : ''
                  }`}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Gradient Header */}
                  <div
                    className={`p-8 bg-gradient-to-br ${plan.gradient} text-white`}
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-2">
                      {plan.title}
                    </h3>
                    <p className="text-white/90 text-center text-sm mb-6">
                      {plan.subtitle}
                    </p>
                    <div className="text-center">
                      {plan.priceFrom && (
                        <span className="text-sm font-medium block mb-1">
                          {t('priceFrom')}
                        </span>
                      )}
                      <div className="text-4xl font-bold">{plan.price}</div>
                      {!plan.priceFrom && (
                        <span className="text-sm text-white/80">
                          {t('priceUnit')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br ${plan.gradient}`}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            }`}
                          >
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/register"
                        onClick={() => handleCTAClick(plan.id)}
                        className={`block w-full py-3 px-6 rounded-xl text-center font-semibold transition-all duration-300 ${
                          plan.popular
                            ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-xl`
                            : theme === 'dark'
                              ? 'bg-gray-700 text-white hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {t('cta')}
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Pricing Info */}
        <motion.div
          className={`max-w-4xl mx-auto p-6 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h4
            className={`text-lg font-semibold mb-4 text-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('regularPricing.title')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {(
              [
                { words: 250, price: 7.98 },
                { words: 350, price: 11.96 },
                { words: 500, price: 15.95 },
                { words: 800, price: 27.92 },
                { words: 1300, price: 39.88 },
                { words: 2500, price: 79.76 },
              ] as const
            ).map((item, idx) => (
              <div
                key={idx}
                className={`text-center p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {item.words} {t('words')}
                </div>
                <div
                  className={`text-lg font-bold mt-1 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {formatPrice(item.price)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
