// src/components/composition/ProcessSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  UserPlus,
  FileText,
  Clock,
  Download,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const ProcessSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Wypracowanie');
  const locale = useLocale();

  const steps = [
    {
      icon: UserPlus,
      titleKey: 'process.steps.account.title',
      descriptionKey: 'process.steps.account.description',
      items: [
        'process.steps.account.item1',
        'process.steps.account.item2',
        'process.steps.account.item3',
      ],
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      titleKey: 'process.steps.details.title',
      descriptionKey: 'process.steps.details.description',
      items: [
        'process.steps.details.item1',
        'process.steps.details.item2',
        'process.steps.details.item3',
      ],
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Clock,
      titleKey: 'process.steps.wait.title',
      descriptionKey: 'process.steps.wait.description',
      items: [
        'process.steps.wait.item1',
        'process.steps.wait.item2',
        'process.steps.wait.item3',
      ],
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Download,
      titleKey: 'process.steps.download.title',
      descriptionKey: 'process.steps.download.description',
      items: [
        'process.steps.download.item1',
        'process.steps.download.item2',
        'process.steps.download.item3',
      ],
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section
      className={`py-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
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
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}
            >
              {t('process.badge')}
            </span>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('process.title')}
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('process.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500 to-transparent z-0" />
                )}

                <div
                  className={`relative rounded-2xl p-6 h-full ${
                    theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200 shadow-lg'
                  }`}
                >
                  {/* Step Number */}
                  <div
                    className={`absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-bold shadow-lg`}
                  >
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {t(step.titleKey)}
                  </h3>

                  {/* Description */}
                  <p
                    className={`mb-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {t(step.descriptionKey)}
                  </p>

                  {/* Items */}
                  <ul className="space-y-2">
                    {step.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle
                          className={`w-4 h-4 flex-shrink-0 ${
                            theme === 'dark'
                              ? 'text-green-400'
                              : 'text-green-600'
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {t(item)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href={`/${locale}/register`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            {t('process.cta')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
