// src/components/home/ComparisonSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';

const ComparisonSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('ComparisonSection');

  const features = [
    { key: 'speed', traditional: false, ai: true },
    { key: 'cost', traditional: false, ai: true },
    { key: 'availability', traditional: false, ai: true },
    { key: 'quality', traditional: true, ai: true },
    { key: 'sources', traditional: true, ai: true },
    { key: 'revisions', traditional: false, ai: true },
  ];

  return (
    <section
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'}`}
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('title')}
          </h2>
          <p
            className={`text-xl ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('subtitle')}
          </p>
        </motion.div>

        <motion.div
          className={`rounded-xl overflow-hidden shadow-2xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
            <div></div>
            <div className="text-center">
              <h3
                className={`font-semibold text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {t('traditional')}
              </h3>
            </div>
            <div className="text-center">
              <h3
                className={`font-semibold text-lg ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                {t('smartedu')}
              </h3>
            </div>
          </div>

          {/* Features */}
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              className={`grid grid-cols-3 gap-4 p-6 ${
                index !== features.length - 1
                  ? 'border-b border-gray-200 dark:border-gray-700'
                  : ''
              }`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t(`features.${feature.key}`)}
              </div>
              <div className="flex justify-center">
                {feature.traditional ? (
                  <Check className="w-6 h-6 text-green-500" />
                ) : (
                  <X className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div className="flex justify-center">
                {feature.ai ? (
                  <Check className="w-6 h-6 text-green-500" />
                ) : (
                  <X className="w-6 h-6 text-red-500" />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
