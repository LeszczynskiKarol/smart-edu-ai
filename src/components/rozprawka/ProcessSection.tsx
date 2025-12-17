// src/components/rozprawka/ProcessSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import {
  UserPlus,
  FileEdit,
  Clock,
  Download,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const ProcessSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('Rozprawka');

  const steps = [
    {
      icon: UserPlus,
      titleKey: 'process.steps.account.title',
      descriptionKey: 'process.steps.account.description',
      gradient: 'from-blue-500 to-cyan-500',
      items: [
        t('process.steps.account.item1'),
        t('process.steps.account.item2'),
        t('process.steps.account.item3'),
      ],
    },
    {
      icon: FileEdit,
      titleKey: 'process.steps.details.title',
      descriptionKey: 'process.steps.details.description',
      gradient: 'from-purple-500 to-pink-500',
      items: [
        t('process.steps.details.item1'),
        t('process.steps.details.item2'),
        t('process.steps.details.item3'),
      ],
    },
    {
      icon: Clock,
      titleKey: 'process.steps.wait.title',
      descriptionKey: 'process.steps.wait.description',
      gradient: 'from-green-500 to-emerald-500',
      items: [
        t('process.steps.wait.item1'),
        t('process.steps.wait.item2'),
        t('process.steps.wait.item3'),
      ],
    },
    {
      icon: Download,
      titleKey: 'process.steps.download.title',
      descriptionKey: 'process.steps.download.description',
      gradient: 'from-orange-500 to-red-500',
      items: [
        t('process.steps.download.item1'),
        t('process.steps.download.item2'),
        t('process.steps.download.item3'),
      ],
    },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-b from-white via-gray-50 to-white'
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6"
          >
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              {t('process.badge')}
            </span>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('process.title')}
          </h2>
          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {t('process.subtitle')}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`hidden lg:block absolute top-10 left-full w-full h-0.5 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  } z-0`}
                >
                  <ArrowRight
                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  />
                </div>
              )}

              <motion.div
                whileHover={{ y: -5 }}
                className={`relative rounded-3xl p-6 h-full ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                {/* Step Number */}
                <div
                  className={`absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center font-bold text-white shadow-lg z-10`}
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3
                  className={`text-xl font-bold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t(step.titleKey)}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {t(step.descriptionKey)}
                </p>

                {/* Items */}
                <div className="space-y-2">
                  {step.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check
                        className={`w-4 h-4 ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center gap-8"
        >
          {[
            { value: '30 sek', label: t('process.stats.registration') },
            { value: '5 min', label: t('process.stats.generation') },
            { value: '3', label: t('process.stats.formats') },
            { value: '24/7', label: t('process.stats.availability') },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
            >
              {t('process.cta')}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
