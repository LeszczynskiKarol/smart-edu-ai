// src/components/referat/BenefitsSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  Zap,
  BookOpen,
  Globe,
  Award,
  FileText,
  Shield,
  CheckCircle,
} from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Referat');

  const benefits = [
    {
      icon: Zap,
      title: t('benefits.speed.title'),
      description: t('benefits.speed.description'),
      features: [
        t('benefits.speed.feature1'),
        t('benefits.speed.feature2'),
        t('benefits.speed.feature3'),
      ],
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: BookOpen,
      title: t('benefits.sources.title'),
      description: t('benefits.sources.description'),
      features: [
        t('benefits.sources.feature1'),
        t('benefits.sources.feature2'),
        t('benefits.sources.feature3'),
      ],
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Globe,
      title: t('benefits.languages.title'),
      description: t('benefits.languages.description'),
      features: [
        t('benefits.languages.feature1'),
        t('benefits.languages.feature2'),
        t('benefits.languages.feature3'),
      ],
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Award,
      title: t('benefits.quality.title'),
      description: t('benefits.quality.description'),
      features: [
        t('benefits.quality.feature1'),
        t('benefits.quality.feature2'),
        t('benefits.quality.feature3'),
      ],
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: FileText,
      title: t('benefits.formats.title'),
      description: t('benefits.formats.description'),
      features: [
        t('benefits.formats.feature1'),
        t('benefits.formats.feature2'),
        t('benefits.formats.feature3'),
      ],
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Shield,
      title: t('benefits.privacy.title'),
      description: t('benefits.privacy.description'),
      features: [
        t('benefits.privacy.feature1'),
        t('benefits.privacy.feature2'),
        t('benefits.privacy.feature3'),
      ],
      gradient: 'from-red-500 to-rose-500',
    },
  ];

  return (
    <section
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${
              theme === 'dark'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {t('benefits.badge')}
          </span>
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('benefits.title')}
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {t('benefits.subtitle')}
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative p-6 rounded-2xl transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-750'
                  : 'bg-gray-50 hover:bg-white hover:shadow-xl'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br ${benefit.gradient}`}
              >
                <benefit.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h3
                className={`text-xl font-bold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {benefit.title}
              </h3>

              {/* Description */}
              <p
                className={`mb-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {benefit.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {benefit.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle
                      className={`w-4 h-4 flex-shrink-0 ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Hover gradient */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
