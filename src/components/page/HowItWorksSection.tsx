// src/components/page/HowItWorksSection.tsx
'use client';
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Edit, Search, Cpu, FileText } from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useTranslations } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';

interface HowItWorksSectionProps {
  title: string;
  steps: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  title,
  steps,
}) => {
  const { theme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const t = useTranslations('HowItWorksSection');
  const sectionRef = useRef<HTMLElement>(null);
  const { trackEvent } = useHomeTracking('HowItWorksSection');

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
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-lg cursor-pointer transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <DynamicIcon
                icon={step.icon}
                className={`w-12 h-12 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
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
