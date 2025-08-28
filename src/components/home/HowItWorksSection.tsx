// src/components/home/HowItWorksSection.tsx
'use client';
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Edit, Search, Cpu, FileText } from 'lucide-react';
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
    },
    {
      icon: Search,
      title: t('steps.research.title'),
      description: t('steps.research.description'),
    },
    {
      icon: Cpu,
      title: t('steps.processing.title'),
      description: t('steps.processing.description'),
    },
    {
      icon: FileText,
      title: t('steps.delivery.title'),
      description: t('steps.delivery.description'),
    },
  ];

  // Dodana funkcja handleStepClick do obsługi kliknięć
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
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('title')}
        </motion.h2>

        <div className="relative mb-12">
          <svg
            className="w-full h-auto"
            viewBox="0 0 400 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 25 H380"
              stroke={theme === 'dark' ? '#3B82F6' : '#2563EB'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5 5"
            />
            {steps.map((_, index) => (
              <motion.circle
                key={index}
                cx={20 + index * 120}
                cy="25"
                r="10"
                fill={
                  activeStep >= index
                    ? theme === 'dark'
                      ? '#3B82F6'
                      : '#2563EB'
                    : theme === 'dark'
                      ? '#1F2937'
                      : '#E5E7EB'
                }
                stroke={theme === 'dark' ? '#3B82F6' : '#2563EB'}
                strokeWidth="2"
                initial={false}
                animate={{ scale: activeStep === index ? 1.2 : 1 }}
                transition={{ duration: 0.3 }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleStepClick(index)}
              />
            ))}
          </svg>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                theme === 'dark'
                  ? activeStep === index
                    ? 'bg-gray-800'
                    : 'bg-gray-900 hover:bg-gray-800'
                  : activeStep === index
                    ? 'bg-white'
                    : 'bg-gray-50 hover:bg-white'
              }`}
              onClick={() => handleStepClick(index)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <step.icon
                className={`w-12 h-12 mx-auto mb-4 ${
                  activeStep >= index
                    ? theme === 'dark'
                      ? 'text-blue-400'
                      : 'text-blue-600'
                    : theme === 'dark'
                      ? 'text-gray-600'
                      : 'text-gray-400'
                }`}
              />
              <h3
                className={`text-lg font-semibold text-center mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {step.title}
              </h3>
              <p
                className={`text-sm text-center ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
