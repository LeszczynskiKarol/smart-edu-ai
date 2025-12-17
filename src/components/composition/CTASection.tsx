// src/components/composition/CTASection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Award,
  CheckCircle,
} from 'lucide-react';

const CTASection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Wypracowanie');
  const locale = useLocale();

  const trustIndicators = [
    { icon: Shield, text: t('cta.trust.indicator1') },
    { icon: Clock, text: t('cta.trust.indicator2') },
    { icon: Award, text: t('cta.trust.indicator3') },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-8"
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">
              {t('cta.badge')}
            </span>
          </motion.div>

          {/* Title */}
          <h2
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('cta.title')}
          </h2>

          {/* Subtitle */}
          <p
            className={`text-xl md:text-2xl mb-10 max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('cta.subtitle')}
          </p>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-12"
          >
            <Link
              href={`/${locale}/register`}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
            >
              <Sparkles className="w-6 h-6" />
              {t('cta.button')}
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8">
            {trustIndicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-md'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {indicator.text}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 p-8 rounded-3xl ${
              theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700'
                : 'bg-white shadow-xl'
            }`}
          >
            {[
              { value: '5 min', label: t('cta.stats.time') },

              { value: '100%', label: t('cta.stats.quality') },
              { value: '24/7', label: t('cta.stats.support') },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p
                  className={`text-3xl md:text-4xl font-bold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {stat.value}
                </p>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
