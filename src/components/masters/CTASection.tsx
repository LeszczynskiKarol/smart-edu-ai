// src/components/masters/CTASection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  Clock,
  Shield,
  Award,
} from 'lucide-react';

const CTASection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('MastersThesis');

  const features = [
    {
      icon: Clock,
      text: t('cta.features.fast'),
    },
    {
      icon: Shield,
      text: t('cta.features.secure'),
    },
    {
      icon: Award,
      text: t('cta.features.quality'),
    },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900'
          : 'bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600'
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold text-white">
                {t('cta.badge')}
              </span>
            </motion.div>

            {/* Title */}
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('cta.title')}
            </h2>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              {t('cta.subtitle')}
            </p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
                >
                  <feature.icon className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">
                    {feature.text}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/50 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    {t('cta.button')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex flex-wrap justify-center gap-6"
            >
              {[
                t('cta.trust.indicator1'),
                t('cta.trust.indicator2'),
                t('cta.trust.indicator3'),
              ].map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-sm text-white/90">{indicator}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {[
              { value: '80-120', label: t('cta.stats.pages') },
              { value: '249 zł', label: t('cta.stats.price') },
              { value: '90-120 min', label: t('cta.stats.time') },
              { value: '24/7', label: t('cta.stats.support') },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <div className="text-3xl font-bold mb-2 text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
