// src/components/home/EducationLevelsSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import { GraduationCap, Book, School } from 'lucide-react';

interface EducationLevel {
  id: string;
  titleKey: string;
  icon: React.ComponentType<{ className?: string }>;
  subjectsKey: string;
}

const EducationLevelsSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('EducationLevelsSection');

  const educationLevels: EducationLevel[] = [
    {
      id: 'primary',
      titleKey: 'levels.primary.title',
      icon: School,
      subjectsKey: 'levels.primary.subjects',
    },
    {
      id: 'secondary',
      titleKey: 'levels.secondary.title', // Zakładam, że trzeba będzie zaktualizować tłumaczenia
      icon: Book,
      subjectsKey: 'levels.secondary.subjects', // Tu również trzeba będzie połączyć subjects z obu poziomów
    },
    {
      id: 'university',
      titleKey: 'levels.university.title',
      icon: GraduationCap,
      subjectsKey: 'levels.university.subjects',
    },
  ];

  return (
    <section
      className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {educationLevels.map((level, index) => {
            const Icon = level.icon;
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`
    rounded-xl p-6
    ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
    transition-all duration-300 ease-in-out
    shadow-lg hover:scale-105
  `}
              >
                <div className="flex items-center justify-center mb-4">
                  <Icon
                    className={`w-12 h-12 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />
                </div>
                <h3
                  className={`text-xl font-semibold text-center mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t(level.titleKey)}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {t
                    .raw(level.subjectsKey)
                    .map((subject: string, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className={`
                        text-sm px-3 py-2 rounded-lg
                        ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
                        ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                      `}
                      >
                        {subject}
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={`text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <p className="text-lg">{t('footer')}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default EducationLevelsSection;
