// src/components/referat/HeroSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowRight,
  Clock,
  BookOpen,
  CheckCircle,
  Sparkles,
  FileText,
  Search,
  Quote,
} from 'lucide-react';

const HeroSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Referat');
  const locale = useLocale();

  const features = [
    { icon: Clock, text: t('hero.features.fast') },
    { icon: CheckCircle, text: t('hero.features.quality') },
    { icon: BookOpen, text: t('hero.features.sources') },
  ];

  const stats = [
    { value: '5 min', label: t('hero.stats.time') },
    { value: locale === 'pl' ? '8 zł' : '$2', label: t('hero.stats.price') },
    { value: '24/7', label: t('hero.stats.available') },
  ];

  return (
    <section
      className={`relative min-h-[90vh] flex items-center overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
            theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-400/20'
          }`}
        />
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
            theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-400/20'
          }`}
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10 mt-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                theme === 'dark'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{t('hero.badge')}</span>
            </motion.div>

            {/* Title */}
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('hero.title')}{' '}
              <span
                className={`${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                {t('hero.titleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-lg md:text-xl mb-8 leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {t('hero.subtitle')}
            </p>

            {/* Features list */}
            <div className="flex flex-wrap gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
                  }`}
                >
                  <feature.icon
                    className={`w-5 h-5 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {t('hero.cta')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="#how-it-works"
                  className={`inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-white text-gray-900 hover:bg-gray-50 shadow-md'
                  }`}
                >
                  {t('hero.ctaSecondary')}
                </Link>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <div
                    className={`text-2xl md:text-3xl font-bold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    {stat.value}
                  </div>
                  <div
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right column - Visual element */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div
              className={`relative p-8 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'
              } backdrop-blur-sm shadow-2xl`}
            >
              {/* Mockup header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}
                >
                  <FileText
                    className={`w-6 h-6 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {t('hero.preview.title')}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {t('hero.preview.subtitle')}
                  </p>
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-4 mb-6">
                {[
                  { icon: Search, text: t('hero.preview.item1') },
                  { icon: Quote, text: t('hero.preview.item2') },
                  { icon: FileText, text: t('hero.preview.item3') },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Status indicator */}
              <div
                className={`flex items-center justify-between p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-700'
                    }`}
                  >
                    {t('hero.preview.status')}
                  </span>
                </div>
                <Sparkles
                  className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}
                />
              </div>

              {/* Decorative elements */}
              <div
                className={`absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl ${
                  theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-400/30'
                }`}
              />
              <div
                className={`absolute -bottom-4 -left-4 w-32 h-32 rounded-full blur-2xl ${
                  theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-400/30'
                }`}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
