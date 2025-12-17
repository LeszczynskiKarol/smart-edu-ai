// src/components/composition/BenefitsSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  Zap,
  BookOpen,
  Languages,
  Award,
  Download,
  Shield,
  CheckCircle,
} from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Wypracowanie');

  const benefits = [
    {
      icon: Zap,
      titleKey: 'benefits.speed.title',
      descriptionKey: 'benefits.speed.description',
      features: [
        'benefits.speed.feature1',
        'benefits.speed.feature2',
        'benefits.speed.feature3',
      ],
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: BookOpen,
      titleKey: 'benefits.subjects.title',
      descriptionKey: 'benefits.subjects.description',
      features: [
        'benefits.subjects.feature1',
        'benefits.subjects.feature2',
        'benefits.subjects.feature3',
      ],
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Languages,
      titleKey: 'benefits.languages.title',
      descriptionKey: 'benefits.languages.description',
      features: [
        'benefits.languages.feature1',
        'benefits.languages.feature2',
        'benefits.languages.feature3',
      ],
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Award,
      titleKey: 'benefits.quality.title',
      descriptionKey: 'benefits.quality.description',
      features: [
        'benefits.quality.feature1',
        'benefits.quality.feature2',
        'benefits.quality.feature3',
      ],
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Download,
      titleKey: 'benefits.formats.title',
      descriptionKey: 'benefits.formats.description',
      features: [
        'benefits.formats.feature1',
        'benefits.formats.feature2',
        'benefits.formats.feature3',
      ],
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Shield,
      titleKey: 'benefits.privacy.title',
      descriptionKey: 'benefits.privacy.description',
      features: [
        'benefits.privacy.feature1',
        'benefits.privacy.feature2',
        'benefits.privacy.feature3',
      ],
      gradient: 'from-red-500 to-rose-500',
    },
  ];

  return (
    <section
      className={`py-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-6"
          >
            <Award className="w-5 h-5 text-purple-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}
            >
              {t('benefits.badge')}
            </span>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('benefits.title')}
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('benefits.subtitle')}
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-800/80'
                    : 'bg-gray-50 hover:bg-white hover:shadow-xl'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${benefit.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3
                  className={`text-xl font-bold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t(benefit.titleKey)}
                </h3>

                {/* Description */}
                <p
                  className={`mb-6 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t(benefit.descriptionKey)}
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
                        {t(feature)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Gradient Border on Hover */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  style={{
                    background: `linear-gradient(135deg, ${
                      benefit.gradient.includes('yellow')
                        ? 'rgba(234, 179, 8, 0.1)'
                        : benefit.gradient.includes('blue')
                          ? 'rgba(59, 130, 246, 0.1)'
                          : benefit.gradient.includes('green')
                            ? 'rgba(34, 197, 94, 0.1)'
                            : benefit.gradient.includes('purple')
                              ? 'rgba(168, 85, 247, 0.1)'
                              : benefit.gradient.includes('indigo')
                                ? 'rgba(99, 102, 241, 0.1)'
                                : 'rgba(239, 68, 68, 0.1)'
                    }, transparent)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
