// src/components/masters/BenefitsSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  Clock,
  FileText,
  BookOpen,
  Award,
  Download,
  Shield,
  Zap,
  CheckCircle,
} from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('MastersThesis');

  const benefits = [
    {
      icon: Clock,
      titleKey: 'benefits.speed.title',
      descriptionKey: 'benefits.speed.description',
      gradient: 'from-purple-500 to-pink-500',
      features: [
        t('benefits.speed.feature1'),
        t('benefits.speed.feature2'),
        t('benefits.speed.feature3'),
      ],
    },
    {
      icon: FileText,
      titleKey: 'benefits.structure.title',
      descriptionKey: 'benefits.structure.description',
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        t('benefits.structure.feature1'),
        t('benefits.structure.feature2'),
        t('benefits.structure.feature3'),
      ],
    },
    {
      icon: BookOpen,
      titleKey: 'benefits.research.title',
      descriptionKey: 'benefits.research.description',
      gradient: 'from-green-500 to-emerald-500',
      features: [
        t('benefits.research.feature1'),
        t('benefits.research.feature2'),
        t('benefits.research.feature3'),
      ],
    },
    {
      icon: Award,
      titleKey: 'benefits.quality.title',
      descriptionKey: 'benefits.quality.description',
      gradient: 'from-yellow-500 to-orange-500',
      features: [
        t('benefits.quality.feature1'),
        t('benefits.quality.feature2'),
        t('benefits.quality.feature3'),
      ],
    },
    {
      icon: Download,
      titleKey: 'benefits.formats.title',
      descriptionKey: 'benefits.formats.description',
      gradient: 'from-indigo-500 to-purple-500',
      features: [
        t('benefits.formats.feature1'),
        t('benefits.formats.feature2'),
        t('benefits.formats.feature3'),
      ],
    },
    {
      icon: Shield,
      titleKey: 'benefits.privacy.title',
      descriptionKey: 'benefits.privacy.description',
      gradient: 'from-rose-500 to-pink-500',
      features: [
        t('benefits.privacy.feature1'),
        t('benefits.privacy.feature2'),
        t('benefits.privacy.feature3'),
      ],
    },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-b from-white via-purple-50 to-white'
      }`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className={`absolute top-1/4 -left-20 w-96 h-96 ${
            theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-400/20'
          } rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className={`absolute bottom-1/4 -right-20 w-96 h-96 ${
            theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-400/20'
          } rounded-full blur-3xl`}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
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
            <Zap className="w-5 h-5 text-purple-500" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div
                className={`relative h-full rounded-3xl p-8 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-lg'
                } transition-all duration-300 overflow-hidden`}
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div className="relative mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3
                  className={`text-xl font-bold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t(benefit.titleKey)}
                </h3>

                <p
                  className={`mb-6 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t(benefit.descriptionKey)}
                </p>

                {/* Features List */}
                <div className="space-y-3">
                  {benefit.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
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
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
