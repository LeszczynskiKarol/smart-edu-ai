// src/components/masters/ProcessSection.tsx
'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  UserPlus,
  FileText,
  Clock,
  Download,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';

const ProcessSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('MastersThesis');
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const lineProgress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const steps = [
    {
      titleKey: 'process.steps.account.title',
      descriptionKey: 'process.steps.account.description',
      icon: UserPlus,
      gradient: 'from-purple-500 to-pink-500',
      items: [
        t('process.steps.account.item1'),
        t('process.steps.account.item2'),
        t('process.steps.account.item3'),
      ],
    },
    {
      titleKey: 'process.steps.details.title',
      descriptionKey: 'process.steps.details.description',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      items: [
        t('process.steps.details.item1'),
        t('process.steps.details.item2'),
        t('process.steps.details.item3'),
      ],
    },
    {
      titleKey: 'process.steps.wait.title',
      descriptionKey: 'process.steps.wait.description',
      icon: Clock,
      gradient: 'from-green-500 to-emerald-500',
      items: [
        t('process.steps.wait.item1'),
        t('process.steps.wait.item2'),
        t('process.steps.wait.item3'),
      ],
    },
    {
      titleKey: 'process.steps.download.title',
      descriptionKey: 'process.steps.download.description',
      icon: Download,
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
      ref={sectionRef}
      className={`py-24 relative overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-purple-50'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${
            theme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-400/10'
          } rounded-full blur-3xl`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${
            theme === 'dark' ? 'bg-blue-500/5' : 'bg-blue-400/10'
          } rounded-full blur-3xl`}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-6"
          >
            <ArrowRight className="w-5 h-5 text-purple-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
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

        <div className="relative max-w-6xl mx-auto">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2">
            <div
              className={`absolute inset-0 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
              } rounded-full`}
            />
            <motion.div
              style={{ height: lineProgress }}
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-purple-500 via-blue-500 to-orange-500 rounded-full"
            />
          </div>

          <div className="space-y-12 lg:space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                <div
                  className={`flex-1 ${
                    index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'
                  } w-full`}
                >
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`relative rounded-3xl p-8 ${
                      theme === 'dark'
                        ? 'bg-gray-800/70 backdrop-blur-sm border border-gray-700'
                        : 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl'
                    } transition-all duration-300`}
                  >
                    <div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.gradient} opacity-0 hover:opacity-5 transition-opacity duration-300`}
                    />

                    <div
                      className={`absolute -top-4 ${
                        index % 2 === 0 ? 'left-8' : 'right-8'
                      } w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-white font-bold text-xl">
                        {index + 1}
                      </span>
                    </div>

                    <div className="relative">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <step.icon className="w-8 h-8 text-white" />
                        </div>

                        <div className="flex-1">
                          <h3
                            className={`text-2xl font-bold mb-2 ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {t(step.titleKey)}
                          </h3>

                          <p
                            className={`leading-relaxed ${
                              theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-600'
                            }`}
                          >
                            {t(step.descriptionKey)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mt-6">
                        {step.items.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={`w-6 h-6 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0`}
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
                              {item}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-20 h-20 z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className={`w-full h-full rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-2xl`}
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: '5 min', label: t('process.stats.registration') },
            { value: '90-120 min', label: t('process.stats.generation') },
            { value: 'PDF/DOCX', label: t('process.stats.formats') },
            { value: '24/7', label: t('process.stats.availability') },
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

export default ProcessSection;
