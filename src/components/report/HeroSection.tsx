// src/components/report/HeroSection.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Brain, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  cta: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, cta }) => {
  const { trackCTAClick } = useHomeTracking('HomeHero');

  const sectionRef = useRef<HTMLElement>(null);

  const handleCTAClick = () => {
    trackCTAClick('hero-main-cta', {
      label: cta,
      timestamp: new Date().toISOString(),
      type: 'primary',
    });
  };

  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const backgroundControls = useAnimation();
  const t = useTranslations('HomeHero');

  const features = [
    {
      icon: BookOpen,
      text: t('referat.title'),
      description: t('referat.description'),
    },
    {
      icon: Brain,
      text: t('quality.title'),
      description: t('quality.description'),
    },
    {
      icon: Sparkles,
      text: t('aiWriter.title'),
      description: t('aiWriter.description'),
    },
    {
      icon: Clock,
      text: t('speed.title'),
      description: t('speed.description'),
    },
  ];

  useEffect(() => {
    backgroundControls.start({
      background:
        theme === 'dark'
          ? `radial-gradient(60px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
          : `radial-gradient(60px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
    });
  }, [mousePosition, backgroundControls, theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className={`hero min-h-screen relative overflow-hidden`}
    >
      <div className="hero-content relative z-10 flex-col lg:flex-row-reverse max-w-[1200px] w-[90%] mx-auto mt-8 lg:mt-16">
        <motion.div
          className="w-full max-w-lg hidden lg:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-full h-80">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: activeFeature === index ? 1 : 0,
                  scale: activeFeature === index ? 1 : 0.8,
                }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold mb-2">{feature.text}</h3>
                <p className="text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:pr-8 text-center lg:text-left"
        >
          <h1
            className={`text-4xl sm:text-5xl font-bold mb-6 relative ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            <span className="relative z-10">{title}</span>
            <span
              className={`absolute top-0 left-0 w-full h-full bg-clip-text text-transparent bg-gradient-to-r ${
                theme === 'dark'
                  ? 'from-blue-400 via-blue-300 to-blue-500'
                  : 'from-blue-600 via-blue-500 to-blue-700'
              } opacity-50 filter blur-sm`}
            >
              {title}
            </span>
          </h1>
          <p
            className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <feature.icon
                  className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/register"
              onClick={handleCTAClick}
              className={`btn ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-8 py-3 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:-translate-y-1 inline-flex items-center`}
            >
              {cta || 'Załóż darmowe konto'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <style jsx>{`
        .light-jumbo {
          background-image: linear-gradient(to bottom right, #3b82f6, #1d4ed8);
          filter: blur(70px);
          z-index: 0;
        }
        .dark-jumbo {
          background-image: linear-gradient(to bottom right, #1e3a8a, #3b82f6);
          filter: blur(70px);
          z-index: 0;
        }
      `}</style>
    </motion.section>
  );
};

export default HeroSection;
