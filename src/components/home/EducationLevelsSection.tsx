// src/components/home/EducationLevelsSection.tsx
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import { GraduationCap, Book, School, Check, Sparkles } from 'lucide-react';

interface EducationLevel {
  id: string;
  titleKey: string;
  icon: React.ComponentType<{ className?: string }>;
  subjectsKey: string;
  gradient: string;
}

const EducationLevelsSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('EducationLevelsSection');
  const [activeLevel, setActiveLevel] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const educationLevels: EducationLevel[] = [
    {
      id: 'primary',
      titleKey: 'levels.primary.title',
      icon: School,
      subjectsKey: 'levels.primary.subjects',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'secondary',
      titleKey: 'levels.secondary.title',
      icon: Book,
      subjectsKey: 'levels.secondary.subjects',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'university',
      titleKey: 'levels.university.title',
      icon: GraduationCap,
      subjectsKey: 'levels.university.subjects',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const handleLevelClick = (index: number) => {
    setActiveLevel(index);
  };

  return (
    <section
      ref={sectionRef}
      className={`py-24 relative overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
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
          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto mb-16">
          {/* Left: Levels Navigation */}
          <div className="space-y-4">
            {educationLevels.map((level, index) => {
              const Icon = level.icon;
              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleLevelClick(index)}
                  className={`relative cursor-pointer group ${
                    activeLevel === index ? 'scale-105' : ''
                  } transition-transform duration-300`}
                >
                  <div
                    className={`relative rounded-2xl p-6 ${
                      activeLevel === index
                        ? theme === 'dark'
                          ? 'bg-gray-800 border-2 border-blue-500 shadow-xl shadow-blue-500/20'
                          : 'bg-white border-2 border-blue-500 shadow-xl'
                        : theme === 'dark'
                          ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                          : 'bg-white border border-gray-200 hover:shadow-lg'
                    } transition-all duration-300`}
                  >
                    {/* Level Number Badge */}
                    <div
                      className={`absolute -left-3 -top-3 w-10 h-10 rounded-full ${
                        activeLevel === index
                          ? `bg-gradient-to-br ${level.gradient}`
                          : theme === 'dark'
                            ? 'bg-gray-700'
                            : 'bg-gray-200'
                      } flex items-center justify-center font-bold text-white shadow-lg`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {/* Icon */}
                        <div
                          className={`w-14 h-14 rounded-xl ${
                            activeLevel === index
                              ? `bg-gradient-to-br ${level.gradient}`
                              : theme === 'dark'
                                ? 'bg-gray-700'
                                : 'bg-gray-100'
                          } flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
                        >
                          <Icon
                            className={`w-7 h-7 ${
                              activeLevel === index
                                ? 'text-white'
                                : theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-600'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-lg font-bold mb-3 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {t(level.titleKey)}
                        </h3>

                        {/* Subjects Preview */}
                        <AnimatePresence>
                          {activeLevel === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="grid grid-cols-2 gap-2"
                            >
                              {t
                                .raw(level.subjectsKey)
                                .slice(0, 4)
                                .map((subject: string, i: number) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`text-xs px-2 py-1.5 rounded-lg ${
                                      theme === 'dark'
                                        ? 'bg-gray-700 text-gray-300'
                                        : 'bg-gray-100 text-gray-700'
                                    } font-medium`}
                                  >
                                    {subject}
                                  </motion.div>
                                ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Visual Mockup with All Subjects */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="sticky top-24"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLevel}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className={`relative rounded-3xl overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-2 border-gray-700'
                    : 'bg-white border-2 border-gray-200'
                } shadow-2xl`}
              >
                {/* Mockup Header */}
                <div
                  className={`flex items-center gap-2 px-6 py-4 ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
                  } border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div
                    className={`flex-1 text-center text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {t(educationLevels[activeLevel].titleKey)}
                  </div>
                </div>

                {/* Mockup Content */}
                <div className="p-8">
                  {/* Central Icon */}
                  <div className="flex justify-center mb-6">
                    {(() => {
                      const LevelIcon = educationLevels[activeLevel].icon;
                      return (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', duration: 0.8 }}
                          className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${educationLevels[activeLevel].gradient} flex items-center justify-center shadow-2xl`}
                        >
                          <LevelIcon className="w-12 h-12 text-white" />
                        </motion.div>
                      );
                    })()}
                  </div>

                  {/* All Subjects Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {t
                      .raw(educationLevels[activeLevel].subjectsKey)
                      .map((subject: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className={`flex items-center gap-2 p-3 rounded-xl ${
                            theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg bg-gradient-to-br ${educationLevels[activeLevel].gradient} flex items-center justify-center flex-shrink-0`}
                          >
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              theme === 'dark'
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            }`}
                          >
                            {subject}
                          </span>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
