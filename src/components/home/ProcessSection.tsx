// src/components/home/ProcessSection.tsx
'use client';
import React, { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      ref={sectionRef}
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'}`}
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
          {t('title')}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto relative">
          {/* Linia procesu */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-400 opacity-20 hidden md:block -translate-x-1/2" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`relative ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12 md:translate-y-16'}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div
                className={`p-8 rounded-xl shadow-lg h-full transform transition-all duration-300 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg hover:bg-opacity-70'
                    : 'bg-white bg-opacity-75 backdrop-filter backdrop-blur-lg hover:bg-opacity-90'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                    }`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      <span className="text-blue-500 mr-2">0{index + 1}.</span>
                      {step.title}
                    </h3>
                    <p
                      className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      } leading-relaxed`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
