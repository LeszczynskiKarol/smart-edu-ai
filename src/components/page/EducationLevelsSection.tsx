// src/components/page/EducationLevelsSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import { GraduationCap, Book, School } from 'lucide-react';

interface EducationLevelsSectionProps {
  title: string;
  levels: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

interface EducationLevel {
  id: string;
  titleKey: string;
  icon: React.ComponentType<{ className?: string }>;
  subjectsKey: string;
}

const EducationLevelsSection: React.FC<EducationLevelsSectionProps> = ({
  title,
  levels,
}) => {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {levels.map((level, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-xl p-6 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } transition-all duration-300 ease-in-out shadow-lg hover:scale-105`}
            >
              <div className="flex items-center justify-center mb-4">
                <DynamicIcon
                  icon={level.icon}
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
                {level.title}
              </h3>
              <p
                className={`text-center ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {level.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationLevelsSection;
