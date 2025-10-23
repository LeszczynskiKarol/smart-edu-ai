// src/components/dashboard/TutorialGuide.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';

interface TutorialGuideProps {
  isFirstLogin: boolean;
  onComplete: () => void;
}

const TutorialGuide: React.FC<TutorialGuideProps> = ({
  isFirstLogin,
  onComplete,
}) => {
  const { theme } = useTheme();
  const t = useTranslations('tutorial');
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isFirstLogin);

  // Kroki tutoriala z selektorami
  const steps = [
    {
      target: '[data-tutorial="language-select"]',
      title: t('steps.language.title'),
      description: t('steps.language.description'),
      position: 'bottom' as const,
    },
    {
      target: '[data-tutorial="length-select"]',
      title: t('steps.length.title'),
      description: t('steps.length.description'),
      position: 'bottom' as const,
    },
    {
      target: '[data-tutorial="content-type"]',
      title: t('steps.contentType.title'),
      description: t('steps.contentType.description'),
      position: 'bottom' as const,
    },
    {
      target: '[data-tutorial="topic"]',
      title: t('steps.topic.title'),
      description: t('steps.topic.description'),
      position: 'top' as const,
    },
    {
      target: '[data-tutorial="guidelines"]',
      title: t('steps.guidelines.title'),
      description: t('steps.guidelines.description'),
      position: 'top' as const,
    },
    {
      target: '[data-tutorial="submit-button"]',
      title: t('steps.submit.title'),
      description: t('steps.submit.description'),
      position: 'top' as const,
    },
  ];

  const [highlightPosition, setHighlightPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // Aktualizuj pozycję podświetlenia
  useEffect(() => {
    if (!isVisible) return;

    const updateHighlight = () => {
      const targetSelector = steps[currentStep]?.target;
      if (!targetSelector) return;

      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // Przewiń do elementu
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    };

    // Małe opóźnienie na załadowanie DOM
    setTimeout(updateHighlight, 100);

    // Aktualizuj przy zmianie rozmiaru okna
    window.addEventListener('resize', updateHighlight);
    return () => window.removeEventListener('resize', updateHighlight);
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    console.log('🎓 Tutorial manually completed by user');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    console.log('⏭️ Tutorial skipped by user');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Ciemne tło z wycięciem na podświetlony element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            style={{ pointerEvents: 'none' }}
          >
            {/* Górna część */}
            <div
              className="absolute left-0 right-0 bg-black bg-opacity-70"
              style={{
                top: 0,
                height: `${highlightPosition.top}px`,
              }}
            />

            {/* Lewa część */}
            <div
              className="absolute top-0 bottom-0 bg-black bg-opacity-70"
              style={{
                left: 0,
                width: `${highlightPosition.left}px`,
              }}
            />

            {/* Prawa część */}
            <div
              className="absolute top-0 bottom-0 bg-black bg-opacity-70"
              style={{
                left: `${highlightPosition.left + highlightPosition.width}px`,
                right: 0,
              }}
            />

            {/* Dolna część */}
            <div
              className="absolute left-0 right-0 bg-black bg-opacity-70"
              style={{
                top: `${highlightPosition.top + highlightPosition.height}px`,
                bottom: 0,
              }}
            />

            {/* Podświetlenie z ramką */}
            <div
              className="absolute border-4 border-blue-500 rounded-lg shadow-2xl"
              style={{
                top: `${highlightPosition.top - 8}px`,
                left: `${highlightPosition.left - 8}px`,
                width: `${highlightPosition.width + 16}px`,
                height: `${highlightPosition.height + 16}px`,
                transition: 'all 0.3s ease-in-out',
              }}
            />
          </motion.div>

          {/* Karta z instrukcjami */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed z-[9999] max-w-md rounded-lg shadow-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-900'
            }`}
            style={{
              top:
                currentStepData.position === 'bottom'
                  ? `${highlightPosition.top + highlightPosition.height + 20}px`
                  : `${highlightPosition.top - 200}px`,
              left: `${Math.max(20, Math.min(window.innerWidth - 420, highlightPosition.left))}px`,
              pointerEvents: 'auto',
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{currentStepData.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('step')} {currentStep + 1} {t('of')} {steps.length}
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opis */}
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              {currentStepData.description}
            </p>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Przyciski nawigacji */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center px-4 py-2 rounded ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('previous')}
              </button>

              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-4 py-2"
              >
                {t('skip')}
              </button>

              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('finish')}
                  </>
                ) : (
                  <>
                    {t('next')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TutorialGuide;
