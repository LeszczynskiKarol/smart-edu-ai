// src/components/composition/TypesSection.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  User,
  FileText,
  Scroll,
  MessageCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const TypesSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Wypracowanie');
  const [activeType, setActiveType] = useState(0);

  const types = [
    {
      icon: BookOpen,
      titleKey: 'types.interpretation.title',
      descriptionKey: 'types.interpretation.description',
      gradient: 'from-blue-500 to-cyan-500',
      examplesKey: 'types.interpretation.examples',
      featuresKey: 'types.interpretation.features',
    },
    {
      icon: User,
      titleKey: 'types.characterization.title',
      descriptionKey: 'types.characterization.description',
      gradient: 'from-purple-500 to-pink-500',
      examplesKey: 'types.characterization.examples',
      featuresKey: 'types.characterization.features',
    },
    {
      icon: FileText,
      titleKey: 'types.description.title',
      descriptionKey: 'types.description.description',
      gradient: 'from-green-500 to-emerald-500',
      examplesKey: 'types.description.examples',
      featuresKey: 'types.description.features',
    },
    {
      icon: Scroll,
      titleKey: 'types.narrative.title',
      descriptionKey: 'types.narrative.description',
      gradient: 'from-orange-500 to-red-500',
      examplesKey: 'types.narrative.examples',
      featuresKey: 'types.narrative.features',
    },
    {
      icon: MessageCircle,
      titleKey: 'types.reflective.title',
      descriptionKey: 'types.reflective.description',
      gradient: 'from-indigo-500 to-purple-500',
      examplesKey: 'types.reflective.examples',
      featuresKey: 'types.reflective.features',
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
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${
              theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            } 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
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
            <FileText className="w-5 h-5 text-purple-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}
            >
              {t('types.badge')}
            </span>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('types.title')}
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('types.subtitle')}
          </p>
        </motion.div>

        {/* Types Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Type Cards */}
          <div className="space-y-4">
            {types.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveType(index)}
                className={`cursor-pointer group`}
              >
                <div
                  className={`relative rounded-2xl p-6 transition-all duration-300 ${
                    activeType === index
                      ? theme === 'dark'
                        ? 'bg-gray-800 border-2 border-purple-500 shadow-xl shadow-purple-500/20'
                        : 'bg-white border-2 border-purple-500 shadow-xl'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                        : 'bg-white border border-gray-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        activeType === index
                          ? `bg-gradient-to-br ${type.gradient}`
                          : theme === 'dark'
                            ? 'bg-gray-700'
                            : 'bg-gray-100'
                      }`}
                    >
                      <type.icon
                        className={`w-7 h-7 ${
                          activeType === index
                            ? 'text-white'
                            : theme === 'dark'
                              ? 'text-gray-400'
                              : 'text-gray-600'
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-bold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {t(type.titleKey)}
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {t(type.descriptionKey)}
                      </p>
                    </div>

                    {/* Arrow */}
                    {activeType === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${type.gradient} flex items-center justify-center flex-shrink-0`}
                      >
                        <ArrowRight className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Details Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="sticky top-24"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeType}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                } shadow-2xl`}
              >
                {/* Header */}
                <div
                  className={`p-6 bg-gradient-to-br ${types[activeType].gradient}`}
                >
                  <div className="flex items-center gap-4">
                    {(() => {
                      const Icon = types[activeType].icon;
                      return (
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {t(types[activeType].titleKey)}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {t(types[activeType].descriptionKey)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Features */}
                  <div>
                    <h4
                      className={`text-sm font-semibold uppercase tracking-wide mb-3 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {t('types.featuresLabel')}
                    </h4>
                    <div className="space-y-2">
                      {(t.raw(types[activeType].featuresKey) as string[]).map(
                        (feature: string, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle
                              className={`w-5 h-5 ${
                                theme === 'dark'
                                  ? 'text-green-400'
                                  : 'text-green-600'
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              {feature}
                            </span>
                          </motion.div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Examples */}
                  <div>
                    <h4
                      className={`text-sm font-semibold uppercase tracking-wide mb-3 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {t('types.examplesLabel')}
                    </h4>
                    <div className="space-y-2">
                      {(t.raw(types[activeType].examplesKey) as string[]).map(
                        (example: string, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className={`p-3 rounded-xl ${
                              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}
                          >
                            <p
                              className={`text-sm italic ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              "{example}"
                            </p>
                          </motion.div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TypesSection;
