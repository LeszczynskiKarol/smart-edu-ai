// src/components/composition/SubjectsSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  Globe,
  Clock,
  Microscope,
  Users,
  Palette,
  Calculator,
  Languages,
  GraduationCap,
} from 'lucide-react';

const SubjectsSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Wypracowanie');

  const subjects = [
    {
      icon: BookOpen,
      titleKey: 'subjects.polish.title',
      itemsKey: 'subjects.polish.items',
      gradient: 'from-red-500 to-rose-500',
    },
    {
      icon: Clock,
      titleKey: 'subjects.history.title',
      itemsKey: 'subjects.history.items',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Globe,
      titleKey: 'subjects.geography.title',
      itemsKey: 'subjects.geography.items',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Microscope,
      titleKey: 'subjects.biology.title',
      itemsKey: 'subjects.biology.items',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Users,
      titleKey: 'subjects.civics.title',
      itemsKey: 'subjects.civics.items',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Palette,
      titleKey: 'subjects.art.title',
      itemsKey: 'subjects.art.items',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  const stats = [
    { value: '20+', labelKey: 'subjects.stats.subjects' },
    { value: '7', labelKey: 'subjects.stats.languages' },
    { value: '∞', labelKey: 'subjects.stats.topics' },
    { value: '100%', labelKey: 'subjects.stats.quality' },
  ];

  return (
    <section
      className={`py-24 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-6"
          >
            <GraduationCap className="w-5 h-5 text-purple-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}
            >
              {t('subjects.badge')}
            </span>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('subjects.title')}
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('subjects.subtitle')}
          </p>
        </motion.div>

        {/* Subjects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {subjects.map((subject, index) => {
            const Icon = subject.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-gray-900 border border-gray-700'
                    : 'bg-gray-50 border border-gray-200'
                } hover:shadow-xl transition-all duration-300`}
              >
                {/* Header */}
                <div
                  className={`p-4 bg-gradient-to-r ${subject.gradient} flex items-center gap-3`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-bold">
                    {t(subject.titleKey)}
                  </h3>
                </div>

                {/* Items */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {(t.raw(subject.itemsKey) as string[]).map(
                      (item: string, idx: number) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-full text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-800 text-gray-300'
                              : 'bg-white text-gray-700 shadow-sm'
                          }`}
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`rounded-3xl p-8 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/20'
              : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p
                  className={`text-4xl md:text-5xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {stat.value}
                </p>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t(stat.labelKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SubjectsSection;
