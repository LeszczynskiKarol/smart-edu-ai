// src/components/page/HeroSection.tsx
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
  features: Array<{
    icon: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
  }>;
  heroImage?: string;
  locale?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  cta,
  features = [],
  heroImage,
  locale = 'pl',
}) => {
  const { trackCTAClick } = useHomeTracking('HeroSection');
  const sectionRef = useRef<HTMLElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const iconComponents = {
    BookOpen,
    Brain,
    Clock,
    Sparkles,
  };

  const featuresWithIcons = features.map((feature) => ({
    ...feature,
    IconComponent: iconComponents[feature.icon as keyof typeof iconComponents],
  }));

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
  }, [features.length]);

  useEffect(() => {
    if (heroImage) {
      console.log('Pełny URL obrazka:', heroImage);
    }
  }, [heroImage]);

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
          {heroImage && !imageError ? (
            <img
              src={heroImage}
              alt="Hero"
              className={`w-full h-auto rounded-lg shadow-xl transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => {
                console.log('Obrazek załadowany pomyślnie:', heroImage);
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.error('Błąd ładowania obrazka:', {
                  error: e,
                  src: heroImage,
                  event: e.currentTarget,
                });
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
              <p>Brak zdjęcia (URL: {heroImage || 'nie podano'})</p>
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:pr-8 text-center lg:text-left"
        >
          <h1
            className={`text-4xl sm:text-5xl font-bold mb-6 relative ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
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
            className={`text-xl mb-8 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {featuresWithIcons.map((feature, index) => (
              <motion.div
                key={index}
                className={`flex items-center space-x-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {feature.IconComponent && (
                  <feature.IconComponent
                    className={`w-6 h-6 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />
                )}
                <span>{locale === 'pl' ? feature.title : feature.titleEn}</span>
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
