// src/components/composition/HowItWorksSection.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  PenTool,
  Search,
  Cpu,
  Download,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Wypracowanie');
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: PenTool,
      titleKey: 'howItWorks.steps.input.title',
      descriptionKey: 'howItWorks.steps.input.description',
      details: [
        'howItWorks.steps.input.detail1',
        'howItWorks.steps.input.detail2',
        'howItWorks.steps.input.detail3',
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Search,
      titleKey: 'howItWorks.steps.research.title',
      descriptionKey: 'howItWorks.steps.research.description',
      details: [
        'howItWorks.steps.research.detail1',
        'howItWorks.steps.research.detail2',
        'howItWorks.steps.research.detail3',
      ],
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Cpu,
      titleKey: 'howItWorks.steps.generation.title',
      descriptionKey: 'howItWorks.steps.generation.description',
      details: [
        'howItWorks.steps.generation.detail1',
        'howItWorks.steps.generation.detail2',
        'howItWorks.steps.generation.detail3',
      ],
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Download,
      titleKey: 'howItWorks.steps.download.title',
      descriptionKey: 'howItWorks.steps.download.description',
      details: [
        'howItWorks.steps.download.detail1',
        'howItWorks.steps.download.detail2',
        'howItWorks.steps.download.detail3',
      ],
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section
      id="how-it-works"
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
            <Cpu className="w-5 h-5 text-purple-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}
            >
              {t('howItWorks.badge')}
            </span>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('howItWorks.title')}
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          {/* Progress Bar */}
          <div className="hidden md:flex items-center justify-between mb-12 relative">
            <div
              className={`absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            />
            <motion.div
              className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: '0%' }}
              animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            {steps.map((step, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index <= activeStep
                    ? `bg-gradient-to-br ${step.color} text-white shadow-lg`
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-400'
                      : 'bg-white text-gray-500 shadow-md'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <step.icon className="w-6 h-6" />
              </motion.button>
            ))}
          </div>

          {/* Step Content */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Info */}
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${steps[activeStep].color} flex items-center justify-center shadow-lg`}
                >
                  {(() => {
                    const Icon = steps[activeStep].icon;
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <div>
                  <span
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  >
                    {
                      t('howItWorks.mockup.step', {
                        number: activeStep + 1,
                        title: '',
                      }).split(':')[0]
                    }
                  </span>
                  <h3
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {t(steps[activeStep].titleKey)}
                  </h3>
                </div>
              </div>

              <p
                className={`text-lg mb-6 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t(steps[activeStep].descriptionKey)}
              </p>

              <ul className="space-y-3">
                {steps[activeStep].details.map((detail, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle
                      className={`w-5 h-5 ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`}
                    />
                    <span
                      className={
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }
                    >
                      {t(detail)}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Navigation */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeStep === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105'
                  } ${
                    theme === 'dark'
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-900 shadow-md'
                  }`}
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    setActiveStep(Math.min(steps.length - 1, activeStep + 1))
                  }
                  disabled={activeStep === steps.length - 1}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeStep === steps.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105'
                  } bg-gradient-to-r from-purple-500 to-blue-500 text-white`}
                >
                  {t('howItWorks.next') || 'Dalej'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              key={`visual-${activeStep}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`rounded-3xl overflow-hidden shadow-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div
                className={`p-6 bg-gradient-to-br ${steps[activeStep].color}`}
              >
                <h4 className="text-white font-bold text-lg">
                  {t('howItWorks.mockup.step', {
                    number: activeStep + 1,
                    title: t(steps[activeStep].titleKey),
                  })}
                </h4>
              </div>
              <div className="p-6 space-y-4">
                {steps[activeStep].details.map((detail, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className={`p-4 rounded-xl ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${steps[activeStep].color} flex items-center justify-center`}
                      >
                        <span className="text-white font-bold text-sm">
                          {idx + 1}
                        </span>
                      </div>
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {t(detail)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
