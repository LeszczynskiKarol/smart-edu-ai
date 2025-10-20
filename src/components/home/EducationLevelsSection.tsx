// src/components/home/HowItWorksSection_new.tsx
'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Edit, Search, Cpu, FileText, ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';

const HowItWorksSection: React.FC = () => {
  const { theme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const t = useTranslations('HowItWorksSection');
  const sectionRef = useRef<HTMLElement>(null);
  const { trackEvent } = useHomeTracking('HowItWorksSection');

  const steps = [
    {
      icon: Edit,
      title: t('steps.analysis.title'),
      description: t('steps.analysis.description'),
      gradient: 'from-blue-500 to-cyan-500',
      details: [
        'Wpisz temat pracy',
        'Wybierz poziom i długość',
        'Dodaj wymagania',
      ],
    },
    {
      icon: Search,
      title: t('steps.research.title'),
      description: t('steps.research.description'),
      gradient: 'from-purple-500 to-pink-500',
      details: [
        'AI analizuje temat',
        'Wyszukuje źródła',
        'Weryfikuje informacje',
      ],
    },
    {
      icon: Cpu,
      title: t('steps.processing.title'),
      description: t('steps.processing.description'),
      gradient: 'from-green-500 to-emerald-500',
      details: [
        'Generuje treść',
        'Strukturyzuje dokument',
        'Formatuje profesjonalnie',
      ],
    },
    {
      icon: FileText,
      title: t('steps.delivery.title'),
      description: t('steps.delivery.description'),
      gradient: 'from-orange-500 to-red-500',
      details: [
        'Pobierz PDF/DOCX',
        'Edytuj online',
        'Eksportuj w różnych formatach',
      ],
    },
  ];

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    trackEvent('interaction', {
      action: 'step_click',
      stepIndex: index,
      stepTitle: steps[index].title,
      currentStep: activeStep,
    });
  };

  return (
    <section
      ref={sectionRef}
      className={`py-24 relative overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${
              theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            } 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6"
          >
            <Cpu className="w-5 h-5 text-blue-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              Jak to działa
            </span>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('title')}
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Prosty proces w 4 krokach od pomysłu do gotowej pracy
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto mb-16">
          {/* Left: Steps Navigation */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleStepClick(index)}
                className={`relative cursor-pointer group ${
                  activeStep === index ? 'scale-105' : ''
                } transition-transform duration-300`}
              >
                <div
                  className={`relative rounded-2xl p-6 ${
                    activeStep === index
                      ? theme === 'dark'
                        ? 'bg-gray-800 border-2 border-blue-500 shadow-xl shadow-blue-500/20'
                        : 'bg-white border-2 border-blue-500 shadow-xl'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                        : 'bg-white border border-gray-200 hover:shadow-lg'
                  } transition-all duration-300`}
                >
                  {/* Step Number & Icon */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {/* Step Number Badge */}
                      <div
                        className={`absolute -left-3 -top-3 w-10 h-10 rounded-full ${
                          activeStep === index
                            ? `bg-gradient-to-br ${step.gradient}`
                            : theme === 'dark'
                              ? 'bg-gray-700'
                              : 'bg-gray-200'
                        } flex items-center justify-center font-bold text-white shadow-lg`}
                      >
                        {index + 1}
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-xl ${
                          activeStep === index
                            ? `bg-gradient-to-br ${step.gradient}`
                            : theme === 'dark'
                              ? 'bg-gray-700'
                              : 'bg-gray-100'
                        } flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
                      >
                        <step.icon
                          className={`w-7 h-7 ${
                            activeStep === index
                              ? 'text-white'
                              : theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-600'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-bold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-sm mb-3 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {step.description}
                      </p>

                      {/* Details List */}
                      <AnimatePresence>
                        {activeStep === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            {step.details.map((detail, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-2"
                              >
                                <Check
                                  className={`w-4 h-4 ${
                                    theme === 'dark'
                                      ? 'text-green-400'
                                      : 'text-green-600'
                                  }`}
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
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Arrow Indicator */}
                    {activeStep === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center`}
                      >
                        <ArrowRight className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Progress Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-10 bottom-0 transform translate-y-full w-0.5 h-4 ${
                        activeStep > index
                          ? 'bg-gradient-to-b ' + step.gradient
                          : theme === 'dark'
                            ? 'bg-gray-700'
                            : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="sticky top-24"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className={`relative rounded-3xl overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-2 border-gray-700'
                    : 'bg-white border-2 border-gray-200'
                } shadow-2xl`}
              >
                {/* Mockup Header */}
                <div
                  className={`flex items-center gap-2 px-6 py-4 ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
                  } border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div
                    className={`flex-1 text-center text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Krok {activeStep + 1}: {steps[activeStep].title}
                  </div>
                </div>

                {/* Mockup Content */}
                <div className="p-8 min-h-[400px]">
                  <div
                    className={`w-full h-full rounded-2xl bg-gradient-to-br ${steps[activeStep].gradient} opacity-10 flex items-center justify-center relative overflow-hidden`}
                  >
                    {/* Central Icon */}
                    {(() => {
                      const StepIcon = steps[activeStep].icon;
                      return (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', duration: 0.8 }}
                          className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${steps[activeStep].gradient} flex items-center justify-center shadow-2xl`}
                        >
                          <StepIcon className="w-16 h-16 text-white" />
                        </motion.div>
                      );
                    })()}

                    {/* Floating Elements */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          y: [0, -20, 0],
                        }}
                        transition={{
                          duration: 2 + i,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                        className={`absolute ${
                          i === 0
                            ? 'top-8 left-8'
                            : i === 1
                              ? 'bottom-8 right-8'
                              : 'top-1/2 right-8'
                        } w-16 h-16 rounded-2xl ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                        } shadow-xl`}
                      />
                    ))}
                  </div>

                  {/* Step Details Below */}
                  <div className="mt-6 space-y-3">
                    {steps[activeStep].details.map((detail, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${steps[activeStep].gradient} flex items-center justify-center flex-shrink-0`}
                        >
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {detail}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Rozpocznij teraz
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
