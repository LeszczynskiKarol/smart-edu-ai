// src/components/referat/HowItWorksSection.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  Edit3,
  Search,
  Cpu,
  Download,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Referat');
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: Edit3,
      title: t('howItWorks.steps.input.title'),
      description: t('howItWorks.steps.input.description'),
      details: [
        t('howItWorks.steps.input.detail1'),
        t('howItWorks.steps.input.detail2'),
        t('howItWorks.steps.input.detail3'),
      ],
      color: 'blue',
    },
    {
      icon: Search,
      title: t('howItWorks.steps.research.title'),
      description: t('howItWorks.steps.research.description'),
      details: [
        t('howItWorks.steps.research.detail1'),
        t('howItWorks.steps.research.detail2'),
        t('howItWorks.steps.research.detail3'),
      ],
      color: 'purple',
    },
    {
      icon: Cpu,
      title: t('howItWorks.steps.generation.title'),
      description: t('howItWorks.steps.generation.description'),
      details: [
        t('howItWorks.steps.generation.detail1'),
        t('howItWorks.steps.generation.detail2'),
        t('howItWorks.steps.generation.detail3'),
      ],
      color: 'green',
    },
    {
      icon: Download,
      title: t('howItWorks.steps.download.title'),
      description: t('howItWorks.steps.download.description'),
      details: [
        t('howItWorks.steps.download.detail1'),
        t('howItWorks.steps.download.detail2'),
        t('howItWorks.steps.download.detail3'),
      ],
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: {
      bg: theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100',
      text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500',
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100',
      text: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      gradient: 'from-purple-500 to-pink-500',
    },
    green: {
      bg: theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100',
      text: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      gradient: 'from-green-500 to-emerald-500',
    },
    orange: {
      bg: theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100',
      text: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      gradient: 'from-orange-500 to-amber-500',
    },
  };

  return (
    <section
      id="how-it-works"
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
            {t('howItWorks.badge')}
          </span>
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('howItWorks.title')}
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Steps navigation */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const colors =
                colorClasses[step.color as keyof typeof colorClasses];
              const isActive = activeStep === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveStep(index)}
                  className={`cursor-pointer p-6 rounded-xl transition-all duration-300 ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-gray-800 shadow-lg'
                        : 'bg-white shadow-lg'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 hover:bg-gray-800'
                        : 'bg-gray-50 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Step number / icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? `bg-gradient-to-br ${colors.gradient}`
                          : colors.bg
                      }`}
                    >
                      {isActive ? (
                        <step.icon className="w-6 h-6 text-white" />
                      ) : (
                        <span className={`font-bold text-lg ${colors.text}`}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-semibold text-lg ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {step.title}
                        </h3>
                        <ChevronRight
                          className={`w-5 h-5 transition-transform duration-300 ${
                            isActive ? 'rotate-90' : ''
                          } ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {step.description}
                      </p>

                      {/* Details (visible when active) */}
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                          <ul className="space-y-2">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle
                                  className={`w-4 h-4 ${colors.text}`}
                                />
                                <span
                                  className={`text-sm ${
                                    theme === 'dark'
                                      ? 'text-gray-300'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {detail}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right - Visual mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div
              className={`p-8 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              {/* Mockup content */}
              <div className="mb-6">
                <div
                  className={`text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {t('howItWorks.mockup.step', {
                    number: activeStep + 1,
                    title: steps[activeStep].title,
                  })}
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${
                      colorClasses[
                        steps[activeStep].color as keyof typeof colorClasses
                      ].gradient
                    }`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((activeStep + 1) / steps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Animated content based on step */}
              <div
                className={`p-6 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                } min-h-[200px]`}
              >
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                        colorClasses[
                          steps[activeStep].color as keyof typeof colorClasses
                        ].gradient
                      }`}
                    >
                      {React.createElement(steps[activeStep].icon, {
                        className: 'w-5 h-5 text-white',
                      })}
                    </div>
                    <h4
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {steps[activeStep].title}
                    </h4>
                  </div>

                  {/* Simulated UI elements */}
                  <div className="space-y-3">
                    {steps[activeStep].details.map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className={`h-10 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    setActiveStep(Math.min(steps.length - 1, activeStep + 1))
                  }
                  disabled={activeStep === steps.length - 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeStep === steps.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  } ${
                    theme === 'dark'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {t('howItWorks.next')} →
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <div
              className={`absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl ${
                theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-400/30'
              }`}
            />
            <div
              className={`absolute -bottom-4 -left-4 w-32 h-32 rounded-full blur-2xl ${
                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-400/30'
              }`}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
