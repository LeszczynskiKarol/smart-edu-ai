// src/components/home/TrustSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  CheckCircle,
  Clock,
  FileCheck,
  Users,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';

const TrustSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('TrustSection');

  const trustFeatures = [
    {
      icon: Shield,
      title: t('features.privacy.title'),
      description: t('features.privacy.description'),
    },
    {
      icon: Lock,
      title: t('features.security.title'),
      description: t('features.security.description'),
    },
    {
      icon: CheckCircle,
      title: t('features.quality.title'),
      description: t('features.quality.description'),
    },
    {
      icon: Clock,
      title: t('features.delivery.title'),
      description: t('features.delivery.description'),
    },
    {
      icon: FileCheck,
      title: t('features.originality.title'),
      description: t('features.originality.description'),
    },
    {
      icon: Users,
      title: t('features.support.title'),
      description: t('features.support.description'),
    },
  ];

  return (
    <section
      className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4">
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
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-xl ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
              } hover:shadow-xl transition-all duration-300`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                  theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}
              >
                <feature.icon
                  className={`w-7 h-7 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {feature.title}
              </h3>
              <p
                className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
