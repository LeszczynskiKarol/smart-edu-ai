// src/components/referat/ProcessSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  UserPlus,
  FileText,
  Clock,
  Download,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const ProcessSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Referat');

  const steps = [
    {
      icon: UserPlus,
      title: t('process.steps.account.title'),
      description: t('process.steps.account.description'),
      items: [
        t('process.steps.account.item1'),
        t('process.steps.account.item2'),
        t('process.steps.account.item3'),
      ],
      color: 'blue',
    },
    {
      icon: FileText,
      title: t('process.steps.details.title'),
      description: t('process.steps.details.description'),
      items: [
        t('process.steps.details.item1'),
        t('process.steps.details.item2'),
        t('process.steps.details.item3'),
      ],
      color: 'purple',
    },
    {
      icon: Clock,
      title: t('process.steps.wait.title'),
      description: t('process.steps.wait.description'),
      items: [
        t('process.steps.wait.item1'),
        t('process.steps.wait.item2'),
        t('process.steps.wait.item3'),
      ],
      color: 'green',
    },
    {
      icon: Download,
      title: t('process.steps.download.title'),
      description: t('process.steps.download.description'),
      items: [
        t('process.steps.download.item1'),
        t('process.steps.download.item2'),
        t('process.steps.download.item3'),
      ],
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: {
      bg: theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100',
      text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500',
      line: theme === 'dark' ? 'bg-blue-500' : 'bg-blue-500',
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100',
      text: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      gradient: 'from-purple-500 to-pink-500',
      line: theme === 'dark' ? 'bg-purple-500' : 'bg-purple-500',
    },
    green: {
      bg: theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100',
      text: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      gradient: 'from-green-500 to-emerald-500',
      line: theme === 'dark' ? 'bg-green-500' : 'bg-green-500',
    },
    orange: {
      bg: theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100',
      text: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      gradient: 'from-orange-500 to-amber-500',
      line: theme === 'dark' ? 'bg-orange-500' : 'bg-orange-500',
    },
  };

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
            {t('process.badge')}
          </span>
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('process.title')}
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {t('process.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line (desktop) */}
          <div
            className={`hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 transform -translate-x-1/2 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          />

          <div className="space-y-12">
            {steps.map((step, index) => {
              const colors =
                colorClasses[step.color as keyof typeof colorClasses];
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div
                    className={`md:flex items-center ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Content card */}
                    <div
                      className={`md:w-5/12 ${
                        isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'
                      }`}
                    >
                      <div
                        className={`p-6 rounded-xl ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-3 mb-4 ${
                            isEven ? 'md:justify-end' : ''
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colors.gradient} md:hidden`}
                          >
                            <step.icon className="w-5 h-5 text-white" />
                          </div>
                          <h3
                            className={`text-xl font-bold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {step.title}
                          </h3>
                        </div>

                        <p
                          className={`mb-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {step.description}
                        </p>

                        <ul
                          className={`space-y-2 ${
                            isEven ? 'md:items-end' : ''
                          }`}
                        >
                          {step.items.map((item, idx) => (
                            <li
                              key={idx}
                              className={`flex items-center gap-2 ${
                                isEven ? 'md:flex-row-reverse' : ''
                              }`}
                            >
                              <CheckCircle
                                className={`w-4 h-4 flex-shrink-0 ${colors.text}`}
                              />
                              <span
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                }`}
                              >
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Center icon (desktop) */}
                    <div className="hidden md:flex md:w-2/12 justify-center">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${colors.gradient} z-10 shadow-lg`}
                      >
                        <step.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Empty space for alignment */}
                    <div className="hidden md:block md:w-5/12" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {t('process.cta')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
