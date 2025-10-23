// src/components/home/ServicesSection_new.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import {
  DocumentTextIcon,
  ShoppingBagIcon,
  FolderIcon,
  BuildingOfficeIcon,
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Service {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
  category?: string;
  gradient: string;
}

const ServicesSection: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations('ServicesSection');
  const { trackEvent } = useHomeTracking('ServicesSection');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const services: Service[] = [
    {
      id: '1',
      titleKey: 'articles',
      descriptionKey: 'articles',
      icon: DocumentTextIcon,
      category: 'content',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: '2',
      titleKey: 'descriptions',
      descriptionKey: 'descriptions',
      icon: ShoppingBagIcon,
      category: 'content',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: '3',
      titleKey: 'category',
      descriptionKey: 'category',
      icon: FolderIcon,
      category: 'content',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: '4',
      titleKey: 'business',
      descriptionKey: 'business',
      icon: BuildingOfficeIcon,
      category: 'content',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      id: '5',
      titleKey: 'social',
      descriptionKey: 'social',
      icon: ChatBubbleBottomCenterTextIcon,
      category: 'content',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      id: '6',
      titleKey: 'reports',
      descriptionKey: 'reports',
      icon: ChartBarIcon,
      category: 'content',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      id: '7',
      titleKey: 'emails',
      descriptionKey: 'emails',
      icon: EnvelopeIcon,
      category: 'content',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      id: '8',
      titleKey: 'landing',
      descriptionKey: 'landing',
      icon: GlobeAltIcon,
      category: 'content',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      id: '9',
      titleKey: 'pr',
      descriptionKey: 'pr',
      icon: NewspaperIcon,
      category: 'content',
      gradient: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
      }`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className={`absolute top-1/4 right-0 w-96 h-96 ${
            theme === 'dark' ? 'bg-blue-500/5' : 'bg-blue-400/10'
          } rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className={`absolute bottom-1/4 left-0 w-96 h-96 ${
            theme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-400/10'
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6"
          >
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              Nasze usługi
            </span>
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('title')}
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="group relative"
              >
                <div
                  className={`relative h-full rounded-3xl overflow-hidden ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700'
                      : 'bg-white border border-gray-200 shadow-lg'
                  } transition-all duration-500 hover:shadow-2xl ${
                    hoveredIndex === index ? 'scale-105' : ''
                  }`}
                >
                  {/* Gradient Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredIndex === index ? 0.1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute inset-0 bg-gradient-to-br ${service.gradient}`}
                  />

                  <div className="relative p-8">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="mb-6"
                    >
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>

                    {/* Title */}
                    <h3
                      className={`text-xl font-bold mb-3 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {t(`services.${service.titleKey}.title`)}
                    </h3>

                    {/* Description */}
                    <p
                      className={`mb-4 leading-relaxed ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {t(`services.${service.titleKey}.description`)}
                    </p>
                  </div>

                  {/* Bottom Accent */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: hoveredIndex === index ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
