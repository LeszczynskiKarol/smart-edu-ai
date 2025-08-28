// src/components/page/BenefitsSection.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, Globe, Award, Download, Edit } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useTranslations } from 'next-intl';

interface BenefitsSectionProps {
  title: string;
  benefits: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({
  title,
  benefits,
}) => {
  console.log('BenefitsSection props:', { title, benefits });
  const { theme } = useTheme();

  return (
    <section
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
          {title}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-lg shadow-lg ${
                theme === 'dark'
                  ? 'bg-gray-800 bg-opacity-50'
                  : 'bg-white bg-opacity-75'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4">
                {/* Dynamiczne importowanie ikon */}
                <DynamicIcon icon={benefit.icon} className="mr-2" />
                <h3
                  className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {benefit.title}
                </h3>
              </div>
              <p
                className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
