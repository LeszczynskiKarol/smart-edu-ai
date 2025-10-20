// src/components/home/BenefitsSection_new.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  FileText,
  Globe,
  Award,
  Download,
  Edit,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';

const BenefitsSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('BenefitsPage');

  const benefits = [
    {
      title: t('benefits.generation.title'),
      description: t('benefits.generation.description'),
      Icon: Clock,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      features: ['5-50 minut', 'Automatyzacja', '24/7 dostępność'],
    },
    {
      title: t('benefits.originality.title'),
      description: t('benefits.originality.description'),
      Icon: FileText,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      features: ['100% Unikalne', 'AI Detection Safe', 'Plagiarism Free'],
    },
    {
      title: t('benefits.versatility.title'),
      description: t('benefits.versatility.description'),
      Icon: Globe,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      features: ['7 języków', 'Różne style', 'Każdy poziom'],
    },
    {
      title: t('benefits.quality.title'),
      description: t('benefits.quality.description'),
      Icon: Award,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      features: [
        'Claude AI',
        'Sprawdzona jakość',
        'Profesjonalne formatowanie',
      ],
    },
    {
      title: t('benefits.export.title'),
      description: t('benefits.export.description'),
      Icon: Download,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      features: ['PDF, DOCX', 'LaTeX', 'Instant download'],
    },
    {
      title: t('benefits.flexibility.title'),
      description: t('benefits.flexibility.description'),
      Icon: Edit,
      gradient: 'from-rose-500 via-pink-500 to-purple-500',
      features: ['Live editing', 'Real-time preview', 'Custom templates'],
    },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-b from-white via-blue-50 to-white'
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className={`absolute top-1/4 -left-20 w-96 h-96 ${
            theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-400/20'
          } rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className={`absolute bottom-1/4 -right-20 w-96 h-96 ${
            theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-400/20'
          } rounded-full blur-3xl`}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with Visual Element */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6"
            >
              <Zap className="w-5 h-5 text-blue-500" />
              <span
                className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                Korzyści
              </span>
            </motion.div>

            <h2
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('title')}
            </h2>
            <p
              className={`text-xl leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Odkryj wszystkie zalety korzystania z naszej platformy AI do
              generowania treści akademickich
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: TrendingUp, value: '10x', label: 'Szybciej' },
                { icon: Award, value: 'A+', label: 'Jakość' },
                { icon: Globe, value: '50+', label: 'Języków' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`text-center p-4 rounded-2xl ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border border-gray-700'
                      : 'bg-white border border-gray-200 shadow-lg'
                  }`}
                >
                  <stat.icon
                    className={`w-6 h-6 mx-auto mb-2 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />
                  <div
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
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
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual Screenshot Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className={`relative rounded-3xl overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-2 border-gray-700'
                    : 'bg-white border-2 border-gray-200'
                } shadow-2xl p-8`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Pisanie prac - sztuczna inteligencja
                    </div>
                    <div
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Napędzane przez Claude AI
                    </div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-4">
                  {[
                    { label: 'Analiza tematu', progress: 100, color: 'blue' },
                    {
                      label: 'Generowanie treści',
                      progress: 100,
                      color: 'purple',
                    },
                    { label: 'Formatowanie', progress: 100, color: 'pink' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {item.progress}%
                        </span>
                      </div>
                      <div
                        className={`h-2 rounded-full ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                        } overflow-hidden`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                          className={`h-full rounded-full bg-gradient-to-r ${
                            item.color === 'blue'
                              ? 'from-blue-500 to-cyan-500'
                              : item.color === 'purple'
                                ? 'from-purple-500 to-pink-500'
                                : 'from-pink-500 to-rose-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {[
                    { label: 'Słowa', value: '2,450' },
                    { label: 'Czas', value: '8 min' },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
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
                </div>
              </motion.div>

              {/* Floating Badge */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className={`absolute -right-4 -top-4 px-4 py-2 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-green-100 border border-green-200'
                } backdrop-blur-sm shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span
                    className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-700'
                    }`}
                  >
                    Online
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div
                className={`relative h-full rounded-3xl p-8 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-lg'
                } transition-all duration-300 overflow-hidden`}
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div className="relative mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <benefit.Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3
                  className={`text-xl font-bold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {benefit.title}
                </h3>
                <p
                  className={`mb-6 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {benefit.description}
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-2">
                  {benefit.features.map((feature, i) => (
                    <span
                      key={i}
                      className={`text-xs px-3 py-1.5 rounded-full ${
                        theme === 'dark'
                          ? 'bg-gray-700/50 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      } font-medium`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
