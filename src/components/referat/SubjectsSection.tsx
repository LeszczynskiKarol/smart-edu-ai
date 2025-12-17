// src/components/referat/SubjectsSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations, useLocale } from 'next-intl';
import {
  BookOpen,
  Clock,
  Globe,
  Leaf,
  Users,
  Palette,
  Microscope,
  Calculator,
  CheckCircle,
} from 'lucide-react';

const SubjectsSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Referat');
  const locale = useLocale();

  const subjects = [
    {
      icon: BookOpen,
      title: t('subjects.polish.title'),
      items: t.raw('subjects.polish.items') as string[],
      color: 'blue',
    },
    {
      icon: Clock,
      title: t('subjects.history.title'),
      items: t.raw('subjects.history.items') as string[],
      color: 'amber',
    },
    {
      icon: Globe,
      title: t('subjects.geography.title'),
      items: t.raw('subjects.geography.items') as string[],
      color: 'green',
    },
    {
      icon: Leaf,
      title: t('subjects.biology.title'),
      items: t.raw('subjects.biology.items') as string[],
      color: 'emerald',
    },
    {
      icon: Users,
      title: t('subjects.civics.title'),
      items: t.raw('subjects.civics.items') as string[],
      color: 'purple',
    },
    {
      icon: Palette,
      title: t('subjects.art.title'),
      items: t.raw('subjects.art.items') as string[],
      color: 'pink',
    },
    {
      icon: Microscope,
      title: t('subjects.chemistry.title'),
      items: t.raw('subjects.chemistry.items') as string[],
      color: 'orange',
    },
    {
      icon: Calculator,
      title: t('subjects.physics.title'),
      items: t.raw('subjects.physics.items') as string[],
      color: 'cyan',
    },
  ];

  const colorClasses = {
    blue: {
      bg: theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100',
      text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500',
    },
    amber: {
      bg: theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100',
      text: theme === 'dark' ? 'text-amber-400' : 'text-amber-600',
      gradient: 'from-amber-500 to-yellow-500',
    },
    green: {
      bg: theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100',
      text: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      gradient: 'from-green-500 to-emerald-500',
    },
    emerald: {
      bg: theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100',
      text: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600',
      gradient: 'from-emerald-500 to-teal-500',
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100',
      text: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      gradient: 'from-purple-500 to-pink-500',
    },
    pink: {
      bg: theme === 'dark' ? 'bg-pink-500/20' : 'bg-pink-100',
      text: theme === 'dark' ? 'text-pink-400' : 'text-pink-600',
      gradient: 'from-pink-500 to-rose-500',
    },
    orange: {
      bg: theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100',
      text: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      gradient: 'from-orange-500 to-red-500',
    },
    cyan: {
      bg: theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-100',
      text: theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600',
      gradient: 'from-cyan-500 to-blue-500',
    },
  };

  const stats = [
    { value: '20+', label: t('subjects.stats.subjects') },
    { value: '7', label: t('subjects.stats.languages') },
    { value: '∞', label: t('subjects.stats.topics') },
    { value: '100%', label: t('subjects.stats.quality') },
  ];

  return (
    <section
      className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${
              theme === 'dark'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {t('subjects.badge')}
          </span>
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('subjects.title')}
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {t('subjects.subtitle')}
          </p>
        </motion.div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {subjects.map((subject, index) => {
            const colors =
              colorClasses[subject.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`group p-6 rounded-xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-900 hover:bg-gray-850'
                    : 'bg-white hover:shadow-xl'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${colors.gradient} group-hover:scale-110 transition-transform duration-300`}
                >
                  <subject.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3
                  className={`font-bold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {subject.title}
                </h3>

                {/* Items */}
                <ul className="space-y-2">
                  {subject.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 flex-shrink-0 ${colors.text}`}
                      />
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className={`text-3xl md:text-4xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                {stat.value}
              </div>
              <div
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SubjectsSection;
