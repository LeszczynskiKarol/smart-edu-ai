// src/components/home/TrustSection_new.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  CheckCircle,
  Clock,
  FileCheck,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';

const TrustSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('TrustSection');

  const trustFeatures = [
    {
      icon: Shield,
      title: t('features.privacy.title'),
      description: t('features.privacy.description'),
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: Lock,
      title: t('features.security.title'),
      description: t('features.security.description'),
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'from-purple-500/20 to-pink-500/20',
    },
    {
      icon: CheckCircle,
      title: t('features.quality.title'),
      description: t('features.quality.description'),
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'from-green-500/20 to-emerald-500/20',
    },
    {
      icon: Clock,
      title: t('features.delivery.title'),
      description: t('features.delivery.description'),
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'from-orange-500/20 to-red-500/20',
    },
    {
      icon: FileCheck,
      title: t('features.originality.title'),
      description: t('features.originality.description'),
      gradient: 'from-indigo-500 to-purple-500',
      iconBg: 'from-indigo-500/20 to-purple-500/20',
    },
    {
      icon: Users,
      title: t('features.support.title'),
      description: t('features.support.description'),
      gradient: 'from-pink-500 to-rose-500',
      iconBg: 'from-pink-500/20 to-rose-500/20',
    },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 left-1/4 w-96 h-96 ${
            theme === 'dark' ? 'bg-blue-500/5' : 'bg-blue-400/10'
          } rounded-full blur-3xl`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-96 h-96 ${
            theme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-400/10'
          } rounded-full blur-3xl`}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('title')}
          </h2>
          <p
            className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* Card */}
              <div
                className={`relative h-full rounded-3xl p-8 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50'
                    : 'bg-white border border-gray-200 shadow-lg'
                } transition-all duration-300 group-hover:shadow-2xl overflow-hidden`}
              >
                {/* Gradient Overlay on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div className="relative mb-6">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center relative overflow-hidden group-hover:shadow-lg transition-shadow`}
                  >
                    {/* Icon Background Glow */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 blur-xl`}
                    />
                    <feature.icon
                      className={`w-8 h-8 relative z-10 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    />
                  </motion.div>

                  {/* Sparkle Effect */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                    transition={{ duration: 1.5, delay: index * 0.2 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                </div>

                {/* Content */}
                <h3
                  className={`text-xl font-bold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`leading-relaxed ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {feature.description}
                </p>

                {/* Bottom Accent Line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
