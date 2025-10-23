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

  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
    position: 'bottom' as 'top' | 'bottom' | 'left' | 'right',
  });

  // Inteligentne pozycjonowanie tooltipa
  const calculateTooltipPosition = (
    elementRect: DOMRect,
    preferredPosition: 'top' | 'bottom'
  ) => {
    const TOOLTIP_WIDTH = 400; // max-w-md ≈ 28rem ≈ 400px
    const TOOLTIP_HEIGHT = 280; // Przybliżona wysokość tooltipa
    const PADDING = 20; // Odstęp od krawędzi ekranu i elementu
    const ARROW_SIZE = 20;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Sprawdź gdzie jest miejsce
    const spaceAbove = elementRect.top;
    const spaceBelow = viewportHeight - elementRect.bottom;
    const spaceLeft = elementRect.left;
    const spaceRight = viewportWidth - elementRect.right;

    let position: 'top' | 'bottom' | 'left' | 'right' = preferredPosition;
    let top = 0;
    let left = 0;

    // Wycentruj tooltip względem elementu (jeśli się mieści)
    const centeredLeft = Math.max(
      PADDING,
      Math.min(
        viewportWidth - TOOLTIP_WIDTH - PADDING,
        elementRect.left + elementRect.width / 2 - TOOLTIP_WIDTH / 2
      )
    );

    // Sprawdź czy preferowana pozycja się mieści
    if (
      preferredPosition === 'bottom' &&
      spaceBelow < TOOLTIP_HEIGHT + PADDING
    ) {
      // Nie ma miejsca na dole, spróbuj góra
      if (spaceAbove >= TOOLTIP_HEIGHT + PADDING) {
        position = 'top';
      } else if (spaceLeft >= TOOLTIP_WIDTH + PADDING) {
        position = 'left';
      } else if (spaceRight >= TOOLTIP_WIDTH + PADDING) {
        position = 'right';
      } else {
        // Jeśli nigdzie nie ma miejsca, wybierz najmniejsze zło
        position = spaceBelow > spaceAbove ? 'bottom' : 'top';
      }
    } else if (
      preferredPosition === 'top' &&
      spaceAbove < TOOLTIP_HEIGHT + PADDING
    ) {
      // Nie ma miejsca na górze, spróbuj dół
      if (spaceBelow >= TOOLTIP_HEIGHT + PADDING) {
        position = 'bottom';
      } else if (spaceLeft >= TOOLTIP_WIDTH + PADDING) {
        position = 'left';
      } else if (spaceRight >= TOOLTIP_WIDTH + PADDING) {
        position = 'right';
      } else {
        position = spaceBelow > spaceAbove ? 'bottom' : 'top';
      }
    }

    // Oblicz pozycję w zależności od wybranej strony
    switch (position) {
      case 'bottom':
        top = elementRect.bottom + scrollY + ARROW_SIZE;
        left = centeredLeft;
        break;

      case 'top':
        top = elementRect.top + scrollY - TOOLTIP_HEIGHT - ARROW_SIZE;
        left = centeredLeft;
        break;

      case 'left':
        top = Math.max(
          PADDING,
          Math.min(
            viewportHeight - TOOLTIP_HEIGHT - PADDING,
            elementRect.top +
              scrollY +
              elementRect.height / 2 -
              TOOLTIP_HEIGHT / 2
          )
        );
        left = elementRect.left - TOOLTIP_WIDTH - ARROW_SIZE;
        break;

      case 'right':
        top = Math.max(
          PADDING,
          Math.min(
            viewportHeight - TOOLTIP_HEIGHT - PADDING,
            elementRect.top +
              scrollY +
              elementRect.height / 2 -
              TOOLTIP_HEIGHT / 2
          )
        );
        left = elementRect.right + ARROW_SIZE;
        break;
    }

    // Zabezpieczenie przed wyjściem poza ekran
    top = Math.max(
      PADDING,
      Math.min(viewportHeight - TOOLTIP_HEIGHT - PADDING + scrollY, top)
    );
    left = Math.max(
      PADDING,
      Math.min(viewportWidth - TOOLTIP_WIDTH - PADDING, left)
    );

    return { top, left, position };
  };

  // Aktualizuj pozycję podświetlenia i tooltipa
  useEffect(() => {
    if (!isVisible) return;

    const updatePositions = () => {
      const targetSelector = steps[currentStep]?.target;
      if (!targetSelector) return;

      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();

        // Pozycja podświetlenia
        setHighlightPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // Inteligentna pozycja tooltipa
        const tooltipPos = calculateTooltipPosition(
          rect,
          steps[currentStep].position
        );
        setTooltipPosition(tooltipPos);

        // Przewiń tak, żeby element i tooltip były widoczne
        const tooltipBottom = tooltipPos.top + 280; // wysokość tooltipa
        const viewportHeight = window.innerHeight;

        if (
          tooltipPos.position === 'bottom' &&
          rect.bottom + 300 > viewportHeight
        ) {
          // Przewiń żeby tooltip był widoczny
          window.scrollTo({
            top: rect.top + window.scrollY - 100,
            behavior: 'smooth',
          });
        } else if (tooltipPos.position === 'top' && rect.top < 300) {
          // Przewiń żeby tooltip był widoczny
          window.scrollTo({
            top: rect.top + window.scrollY - 350,
            behavior: 'smooth',
          });
        } else {
          // Normalny scroll do środka
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    };

    // Małe opóźnienie na załadowanie DOM
    setTimeout(updatePositions, 100);

    // Aktualizuj przy zmianie rozmiaru okna lub przewijaniu
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
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

  // Styl strzałki w zależności od pozycji
  const getArrowStyles = () => {
    const arrowSize = 12;
    const baseStyles = {
      content: '""',
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    switch (tooltipPosition.position) {
      case 'bottom':
        return {
          ...baseStyles,
          top: `-${arrowSize}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent ${theme === 'dark' ? '#1f2937' : '#ffffff'} transparent`,
        };
      case 'top':
        return {
          ...baseStyles,
          bottom: `-${arrowSize}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: `${theme === 'dark' ? '#1f2937' : '#ffffff'} transparent transparent transparent`,
        };
      case 'left':
        return {
          ...baseStyles,
          right: `-${arrowSize}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent transparent ${theme === 'dark' ? '#1f2937' : '#ffffff'}`,
        };
      case 'right':
        return {
          ...baseStyles,
          left: `-${arrowSize}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: `transparent ${theme === 'dark' ? '#1f2937' : '#ffffff'} transparent transparent`,
        };
    }
  };

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
              className="absolute border-4 border-blue-500 rounded-lg shadow-2xl pointer-events-none"
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
            key={currentStep} // Dodaj key żeby animacja działała przy zmianie kroku
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-[9999] w-full max-w-md rounded-lg shadow-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-900'
            }`}
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              pointerEvents: 'auto',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {/* Strzałka */}
            <div style={getArrowStyles()} />

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('step')} {currentStep + 1} {t('of')} {steps.length}
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Zamknij tutorial"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opis */}
            <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Przyciski nawigacji */}
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center px-4 py-2 rounded transition-colors ${
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
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-4 py-2 transition-colors"
              >
                {t('skip')}
              </button>

              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
