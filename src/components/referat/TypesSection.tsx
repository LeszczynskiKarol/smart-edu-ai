// src/components/referat/TypesSection.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  GraduationCap,
  School,
  BarChart3,
  GitCompare,
  HelpCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';

const TypesSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Referat');
  const [activeType, setActiveType] = useState(0);

  const reportTypes = [
    {
      id: 'scientific',
      icon: GraduationCap,
      title: t('types.scientific.title'),
      description: t('types.scientific.description'),
      features: t.raw('types.scientific.features') as string[],
      examples: t.raw('types.scientific.examples') as string[],
      color: 'blue',
    },
    {
      id: 'school',
      icon: School,
      title: t('types.school.title'),
      description: t('types.school.description'),
      features: t.raw('types.school.features') as string[],
      examples: t.raw('types.school.examples') as string[],
      color: 'green',
    },
    {
      id: 'analytical',
      icon: BarChart3,
      title: t('types.analytical.title'),
      description: t('types.analytical.description'),
      features: t.raw('types.analytical.features') as string[],
      examples: t.raw('types.analytical.examples') as string[],
      color: 'purple',
    },
    {
      id: 'comparative',
      icon: GitCompare,
      title: t('types.comparative.title'),
      description: t('types.comparative.description'),
      features: t.raw('types.comparative.features') as string[],
      examples: t.raw('types.comparative.examples') as string[],
      color: 'orange',
    },
    {
      id: 'problem',
      icon: HelpCircle,
      title: t('types.problem.title'),
      description: t('types.problem.description'),
      features: t.raw('types.problem.features') as string[],
      examples: t.raw('types.problem.examples') as string[],
      color: 'red',
    },
  ];

  const colorClasses = {
    blue: {
      bg: theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100',
      text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      border: theme === 'dark' ? 'border-blue-500' : 'border-blue-500',
      gradient: 'from-blue-500 to-cyan-500',
    },
    green: {
      bg: theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100',
      text: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      border: theme === 'dark' ? 'border-green-500' : 'border-green-500',
      gradient: 'from-green-500 to-emerald-500',
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100',
      text: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      border: theme === 'dark' ? 'border-purple-500' : 'border-purple-500',
      gradient: 'from-purple-500 to-pink-500',
    },
    orange: {
      bg: theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100',
      text: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      border: theme === 'dark' ? 'border-orange-500' : 'border-orange-500',
      gradient: 'from-orange-500 to-amber-500',
    },
    red: {
      bg: theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100',
      text: theme === 'dark' ? 'text-red-400' : 'text-red-600',
      border: theme === 'dark' ? 'border-red-500' : 'border-red-500',
      gradient: 'from-red-500 to-rose-500',
    },
  };

  const activeReport = reportTypes[activeType];
  const activeColors =
    colorClasses[activeReport.color as keyof typeof colorClasses];

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
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${
              theme === 'dark'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {t('types.badge')}
          </span>
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('types.title')}
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {t('types.subtitle')}
          </p>
        </motion.div>

        {/* Types Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {reportTypes.map((type, index) => {
            const colors =
              colorClasses[type.color as keyof typeof colorClasses];
            const isActive = activeType === index;

            return (
              <motion.button
                key={type.id}
                onClick={() => setActiveType(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <type.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{type.title}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Active Type Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            } shadow-xl`}
          >
            <div className="grid lg:grid-cols-2">
              {/* Left - Info */}
              <div className="p-8 lg:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeColors.gradient}`}
                  >
                    <activeReport.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {activeReport.title}
                    </h3>
                  </div>
                </div>

                <p
                  className={`text-lg mb-8 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {activeReport.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <h4
                    className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {t('types.featuresLabel')}
                  </h4>
                  <ul className="space-y-3">
                    {activeReport.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${activeColors.text}`}
                        />
                        <span
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        >
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right - Examples */}
              <div
                className={`p-8 lg:p-10 ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
                }`}
              >
                <h4
                  className={`text-sm font-semibold uppercase tracking-wider mb-6 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {t('types.examplesLabel')}
                </h4>
                <div className="space-y-4">
                  {activeReport.examples.map((example, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-3 p-4 rounded-xl ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                      }`}
                    >
                      <FileText
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${activeColors.text}`}
                      />
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {example}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TypesSection;
