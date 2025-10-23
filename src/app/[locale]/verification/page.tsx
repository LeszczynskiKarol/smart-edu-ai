// src/app/[locale]/verification/page.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VerificationCodeInput from '../../../components/auth/VerificationCodeInput';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from '../../../context/ThemeContext';

const VerificationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const router = useRouter();
  const { refreshUserData } = useAuth();
  const locale = useLocale();
  const t = useTranslations('Auth.verification');
  const { theme } = useTheme();

  const handleVerification = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/verify-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': locale,
            'Content-Language': locale,
          },
          body: JSON.stringify({
            code,
            locale,
          }),
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (response.ok) {
        const token = data.token;
        if (token) {
          localStorage.setItem('token', token);

          // ✅ DODAJ TO - oznacz jako nowego użytkownika
          sessionStorage.setItem('isNewUser', 'true');

          sessionStorage.removeItem('pendingVerification');
          await refreshUserData();
          setIsVerified(true);
          setTimeout(() => {
            router.push(`/${locale}/dashboard`);
          }, 2000);
        } else {
          setError(t('error.noToken'));
        }
      } else {
        setError(data.message || t('error'));
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <motion.div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md w-full space-y-8">
        {!isVerified ? (
          <>
            <div>
              <h2
                className={`mt-6 text-center text-3xl font-extrabold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('title')}
              </h2>
              <p
                className={`mt-2 text-center text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t('enterCode')}
              </p>
            </div>
            <VerificationCodeInput onComplete={handleVerification} />
            {error && (
              <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="mx-auto w-20 h-20 mb-4"
            >
              <svg
                className="animate-spin h-full w-full text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </motion.div>
            <h2 className="text-xl font-semibold mb-2">{t('success.title')}</h2>
            <p className="mb-2">{t('success.message')}</p>
            <p
              className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {t('success.redirect')}
            </p>
          </motion.div>
        )}
        {isLoading && !isVerified && (
          <motion.div
            className="flex justify-center items-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg
              className="animate-spin h-8 w-8 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VerificationPage;
