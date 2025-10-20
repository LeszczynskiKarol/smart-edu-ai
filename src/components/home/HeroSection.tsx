// src/components/home/HeroSection_new.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  cta: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, cta }) => {
  const { trackCTAClick } = useHomeTracking('HeroSection');
  const sectionRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();
  const t = useTranslations('Home');
  const [activeTab, setActiveTab] = useState(0);

  const handleCTAClick = () => {
    trackCTAClick('hero-main-cta', {
      label: cta,
      timestamp: new Date().toISOString(),
      type: 'primary',
    });
  };

  const features = [
    {
      icon: Sparkles,
      title: t('features.quality.title'),
      description: t('features.quality.description'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: t('features.speed.title'),
      description: t('features.speed.description'),
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: t('features.multilingual.title'),
      description: t('features.multilingual.description'),
      color: 'from-green-500 to-emerald-500',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen overflow-hidden ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-20 left-10 w-72 h-72 ${
            theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-400/20'
          } rounded-full blur-3xl animate-pulse`}
        />
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${
            theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-400/20'
          } rounded-full blur-3xl animate-pulse delay-1000`}
        />
        <div
          className={`absolute top-1/2 left-1/2 w-80 h-80 ${
            theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-400/20'
          } rounded-full blur-3xl animate-pulse delay-500`}
        />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Content Generation</span>
            </motion.div>

            {/* Main Title */}
            <h1
              className={`text-5xl lg:text-7xl font-bold leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {title.split(' ').map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={
                    index % 2 === 0
                      ? ''
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                  }
                >
                  {word}{' '}
                </motion.span>
              ))}
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`text-xl lg:text-2xl ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {subtitle}
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-3"
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group cursor-pointer px-4 py-2 rounded-full ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-white hover:bg-gray-50'
                  } shadow-md hover:shadow-xl transition-all duration-300`}
                  onClick={() => setActiveTab(index)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center`}
                    >
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}
                    >
                      {feature.title}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/register" onClick={handleCTAClick}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {cta}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - App Screenshots */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Screenshot Frame */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className={`relative rounded-3xl overflow-hidden shadow-2xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } border-8 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
              >
                {/* Browser Chrome */}
                <div
                  className={`flex items-center gap-2 px-4 py-3 ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
                  } border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div
                    className={`flex-1 mx-4 px-4 py-1 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    } text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    smart-edu.ai/dashboard
                  </div>
                </div>

                {/* Screenshot Content - Placeholder */}
                <div className="p-6 aspect-[4/3]">
                  <div
                    className={`w-full h-full rounded-2xl ${
                      theme === 'dark'
                        ? 'bg-gray-700'
                        : 'bg-gradient-to-br from-blue-100 to-purple-100'
                    } flex items-center justify-center relative overflow-hidden`}
                  >
                    {/* Animated Feature Showcase */}
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      className="text-center p-8"
                    >
                      {(() => {
                        const ActiveIcon = features[activeTab].icon;
                        return (
                          <>
                            <div
                              className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-r ${features[activeTab].color} flex items-center justify-center`}
                            >
                              <ActiveIcon className="w-12 h-12 text-white" />
                            </div>
                            <h3
                              className={`text-2xl font-bold mb-3 ${
                                theme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {features[activeTab].title}
                            </h3>
                            <p
                              className={`text-lg ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-600'
                              }`}
                            >
                              {features[activeTab].description}
                            </p>
                          </>
                        );
                      })()}
                    </motion.div>

                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm" />
                    <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm" />
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className={`absolute -right-8 top-20 w-40 h-32 rounded-2xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-2xl p-4 ${theme === 'dark' ? 'border border-gray-700' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span
                    className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Szybko
                  </span>
                </div>
                <div
                  className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Wyniki w kilka minut
                </div>
                <div className="mt-3 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 flex-1 rounded ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}
                      style={{ height: `${20 + i * 8}px` }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className={`absolute -left-8 bottom-20 w-36 h-28 rounded-2xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-2xl p-4 ${theme === 'dark' ? 'border border-gray-700' : ''}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    100% unikalności
                  </span>
                </div>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        theme === 'dark' ? 'bg-green-500/30' : 'bg-green-200'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
