// src/components/report/ProcessSection.tsx
'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, FileText, Clock, Download } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';

const ProcessSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('ProcessSection');
  const sectionRef = useRef<HTMLElement>(null);

  const steps = [
    {
      title: t('steps.account.title'),
      description: t('steps.account.description'),
      icon: UserPlus,
    },
    {
      title: t('steps.details.title'),
      description: t('steps.details.description'),
      icon: FileText,
    },
    {
      title: t('steps.wait.title'),
      description: t('steps.wait.description'),
      icon: Clock,
    },
    {
      title: t('steps.download.title'),
      description: t('steps.download.description'),
      icon: Download,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`py-10 md:py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className={`text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('title')}
        </motion.h2>
        <div className="relative">
          <div
            className={`hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 ${
              theme === 'dark' ? 'bg-blue-700' : 'bg-blue-200'
            }`}
          ></div>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative mb-8 last:mb-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`flex flex-col md:flex-row items-center ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
                  <div
                    className={`p-6 rounded-lg shadow-lg ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        theme === 'dark' ? 'text-blue-300' : 'text-gray-800'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-base ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                    theme === 'dark' ? 'bg-blue-700' : 'bg-blue-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </motion.div>
                <div className="hidden md:block w-1/2"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
