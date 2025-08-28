// src/components/CookieConsent.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PrivacyLink from '@/components/privacy/PrivacyLink';
import { MessageCircle, CheckCircle } from 'lucide-react';
import { useConsent } from '@/context/ConsentContext';
import CookieSettings from '@/components/CookieSettings';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';
import ContactModal from './ContactModal';

const bannerVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const buttonVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
  },
};

export default function CookieConsent() {
  const {
    updateConsent,
    isMinimized,
    setIsMinimized,
    hasInitialConsent,
    setHasInitialConsent,
  } = useConsent();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { theme } = useTheme();
  const t = useTranslations('CookieConsent');

  const handleAcceptAll = () => {
    updateConsent({
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
    setHasInitialConsent(true);
    setIsMinimized(true);
  };

  const handleRejectAll = () => {
    updateConsent({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    setHasInitialConsent(true);
    setIsMinimized(true);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    if (!hasInitialConsent) {
      setHasInitialConsent(true);
      setIsMinimized(true);
    }
  };

  const handleTooltipToggle = () => {
    if (window.innerWidth < 640) {
      // 640px to breakpoint dla sm
      setIsTooltipVisible(!isTooltipVisible);
    }
  };

  if (!hasInitialConsent && !isMinimized) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="consent-banner"
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-0 left-0 right-0 p-4 z-50 shadow-lg border-t bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm">
              <p>{t('banner.description')}</p>
              <ul className="list-disc list-inside mt-2">
                <li>{t('banner.purposes.functional')}</li>
                <li>{t('banner.purposes.analytical')}</li>
                <li>{t('banner.purposes.marketing')}</li>
              </ul>
              <div className="mt-2 flex gap-2 items-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                  {t('banner.read')} <PrivacyLink />
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenSettings}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm transition-colors"
              >
                {t('buttons.acceptNecessary')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
              >
                {t('buttons.acceptAll')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {(hasInitialConsent || isMinimized) && (
          <motion.div
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            // Add hidden lg:block to hide on mobile
            className="fixed bottom-4 right-4 z-50 hidden lg:block"
          >
            {/* Rest of the component remains the same */}
            <AnimatePresence>
              {showSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute bottom-full mb-2 right-0 p-2 rounded-lg shadow-lg flex items-center gap-2 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm whitespace-nowrap">
                    {t('form.successMessage')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/*<div className="group relative">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg hover:shadow-xl transition-all duration-300 sm:p-2"
              >
                <Cog6ToothIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="absolute bottom-full right-0 mb-2 w-max opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transform transition-all duration-200 origin-bottom-right bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
                <div className="flex items-center gap-4 whitespace-nowrap">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-sm text-gray-900 dark:text-white hover:underline"
                  >
                    {t('settingsButton')}
                  </button>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="text-sm text-gray-900 dark:text-white hover:underline flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('contactButton')}
                  </button>
                </div>
              </div>
            </div>*/}
          </motion.div>
        )}
      </AnimatePresence>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <CookieSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
