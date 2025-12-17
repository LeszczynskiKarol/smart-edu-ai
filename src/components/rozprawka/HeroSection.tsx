// src/components/rozprawka/HeroSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Sparkles,
  Clock,
  CheckCircle,
  FileText,
  Zap,
  PenTool,
  ArrowRight,
} from 'lucide-react';

const HeroSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Rozprawka');

  const features = [
    { icon: Clock, text: t('hero.features.fast') },
    { icon: CheckCircle, text: t('hero.features.quality') },
    { icon: FileText, text: t('hero.features.types') },
  ];

  return (
    <section
      className={`relative min-h-[90vh] flex mt-16 items-center overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className={`absolute -top-40 -right-40 w-96 h-96 ${
            theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-400/30'
          } rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className={`absolute -bottom-40 -left-40 w-96 h-96 ${
            theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-400/30'
          } rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${
            theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-400/20'
          } rounded-full blur-3xl`}
        />
      </div>

      {/* Grid Pattern */}
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 mt-6 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6"
            >
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span
                className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                {t('hero.badge')}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('hero.title')}
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border border-gray-700'
                      : 'bg-white/80 border border-gray-200 shadow-sm'
                  }`}
                >
                  <feature.icon
                    className={`w-5 h-5 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  {t('hero.cta')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-gray-600 text-white hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('hero.ctaSecondary')}
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center lg:justify-start gap-8 mt-10"
            >
              {[
                { value: '5 min', label: t('hero.stats.time') },
                { value: 'od 5 zł', label: t('hero.stats.price') },
                { value: '24/7', label: t('hero.stats.available') },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div
              className={`relative rounded-3xl overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700'
                  : 'bg-white/80 border border-gray-200'
              } shadow-2xl backdrop-blur-sm p-8`}
            >
              {/* Mockup Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div
                  className={`flex-1 text-center text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t('hero.preview.title')}
                </div>
              </div>

              {/* Mockup Content */}
              <div className="space-y-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className={`h-4 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className={`h-4 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '90%' }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                  className={`h-4 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                />

                {/* Preview Items */}
                <div className="mt-6 space-y-3">
                  {[
                    { icon: PenTool, text: t('hero.preview.item1') },
                    { icon: Zap, text: t('hero.preview.item2') },
                    { icon: CheckCircle, text: t('hero.preview.item3') },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.6 + i * 0.2 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Status */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 }}
                  className="flex items-center justify-center gap-2 mt-6"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}
                  >
                    {t('hero.preview.status')}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
