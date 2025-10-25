// src/components/masters/StructureSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  FileText,
  List,
  BookOpen,
  Search,
  Beaker,
  PenTool,
  BarChart,
  CheckCircle,
  BookmarkCheck,
  Sparkles,
} from 'lucide-react';

const StructureSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('MastersThesis');

  const structureElements = [
    {
      icon: FileText,
      titleKey: 'structure.elements.titlePage.title',
      descriptionKey: 'structure.elements.titlePage.description',
      gradient: 'from-purple-500 to-pink-500',
      pages: '1',
    },
    {
      icon: List,
      titleKey: 'structure.elements.tableOfContents.title',
      descriptionKey: 'structure.elements.tableOfContents.description',
      gradient: 'from-blue-500 to-cyan-500',
      pages: '1-2',
    },
    {
      icon: BookOpen,
      titleKey: 'structure.elements.introduction.title',
      descriptionKey: 'structure.elements.introduction.description',
      gradient: 'from-green-500 to-emerald-500',
      pages: '4-6',
    },
    {
      icon: Search,
      titleKey: 'structure.elements.literature.title',
      descriptionKey: 'structure.elements.literature.description',
      gradient: 'from-yellow-500 to-orange-500',
      pages: '8-12',
    },
    {
      icon: Beaker,
      titleKey: 'structure.elements.methodology.title',
      descriptionKey: 'structure.elements.methodology.description',
      gradient: 'from-indigo-500 to-purple-500',
      pages: '6-10',
    },
    {
      icon: PenTool,
      titleKey: 'structure.elements.chapters.title',
      descriptionKey: 'structure.elements.chapters.description',
      gradient: 'from-red-500 to-pink-500',
      pages: '50-70',
    },
    {
      icon: BarChart,
      titleKey: 'structure.elements.results.title',
      descriptionKey: 'structure.elements.results.description',
      gradient: 'from-teal-500 to-cyan-500',
      pages: '8-12',
    },
    {
      icon: CheckCircle,
      titleKey: 'structure.elements.conclusion.title',
      descriptionKey: 'structure.elements.conclusion.description',
      gradient: 'from-orange-500 to-red-500',
      pages: '6-10',
    },
    {
      icon: BookmarkCheck,
      titleKey: 'structure.elements.bibliography.title',
      descriptionKey: 'structure.elements.bibliography.description',
      gradient: 'from-violet-500 to-purple-500',
      pages: '4-6',
    },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800'
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
      }`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className={`absolute top-1/4 -left-20 w-96 h-96 ${
            theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-400/20'
          } rounded-full blur-3xl`}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
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
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}
            >
              {t('structure.badge')}
            </span>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('structure.title')}
          </h2>

          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('structure.subtitle')}
          </p>
        </motion.div>

        {/* Structure Timeline */}
        <div className="max-w-4xl mx-auto">
          {structureElements.map((element, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative mb-8 last:mb-0"
            >
              <div
                className={`flex items-start gap-6 ${
                  index % 2 === 0 ? '' : 'flex-row-reverse'
                }`}
              >
                {/* Icon and Line */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${element.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <element.icon className="w-8 h-8 text-white" />
                  </div>
                  {index < structureElements.length - 1 && (
                    <div
                      className={`absolute left-1/2 top-full -translate-x-1/2 w-0.5 h-8 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>

                {/* Content Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`flex-1 rounded-2xl p-6 ${
                    theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className={`text-xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {t(element.titleKey)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {element.pages} {t('structure.pagesLabel')}
                    </span>
                  </div>
                  <p
                    className={`${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {t(element.descriptionKey)}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: '80-120', label: t('structure.stats.totalPages') },
            { value: '9', label: t('structure.stats.sections') },
            { value: '25-40', label: t('structure.stats.sources') },
            { value: '100%', label: t('structure.stats.complete') },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`text-center p-6 rounded-2xl ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700'
                  : 'bg-white border border-gray-200 shadow-lg'
              }`}
            >
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StructureSection;
