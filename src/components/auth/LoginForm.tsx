// src/components/auth/LoginForm.tsx

'use client';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import GoogleLogin from './GoogleLogin';
import TikTokLogin from './TikTokLogin';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';

const LoginForm: React.FC = () => {
  const { trackEvent } = useHomeTracking('LoginForm');
  const formRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, fetchUnreadNotificationsCount } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const t = useTranslations('Auth');

  const badgeStyle = `
  .grecaptcha-badge {
      visibility: hidden;
    }
  `;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    trackEvent('formSubmit', {
      formType: 'login',
      hasEmail: !!email,
      success: false,
      status: 'start',
    });

    try {
      if (!window.grecaptcha) {
        throw new Error(
          'reCAPTCHA nie została załadowana poprawnie. Odśwież stronę i spróbuj ponownie.'
        );
      }

      const recaptchaToken = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
        { action: 'login' }
      );

      const success = await login(email, password, recaptchaToken);

      if (success) {
        trackEvent('formSubmit', {
          formType: 'login',
          hasEmail: !!email,
          success: true,
          status: 'complete',
        });

        await fetchUnreadNotificationsCount();

        router.push('/dashboard');
      } else {
        trackEvent('formError', {
          formType: 'login',
          errorType: 'authentication_failed',
          hasEmail: !!email,
        });
        setError(t('Login.errors.failed'));
      }
    } catch (error: unknown) {
      console.error('Login error:', error);

      if (error instanceof Error) {
        setError(`${t('Login.errors.failed')}: ${error.message}`);
      } else {
        setError(t('Login.errors.unknown'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  {
    {
      React.useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = badgeStyle;
        document.head.appendChild(styleElement);

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        return () => {
          if (document.head.contains(styleElement)) {
            document.head.removeChild(styleElement);
          }

          // Usuń skrypt
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }

          // Usuń badge reCAPTCHA
          const badges = document.getElementsByClassName('grecaptcha-badge');
          while (badges.length > 0) {
            badges[0].remove();
          }

          // Wyczyść grecaptcha z window
          if ('grecaptcha' in window) {
            (window as any).grecaptcha = undefined;
          }
        };
      }, []);
    }
  }

  return (
    <motion.div
      className={`card w-full max-w-sm shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      initial={{ opacity: 0, y: 20 }}
      ref={formRef}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-body">
        <h2
          className={`card-title justify-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          {t('Login.title')}
        </h2>
        <GoogleLogin />
        {/*<TikTokLogin />*/}
        <div className="divider"></div>
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label" htmlFor="email">
              <span
                className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {t('Common.email')}
              </span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`input input-bordered w-full ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-300'
                  : 'bg-white border-gray-300 focus:border-blue-300 focus:ring-blue-200'
              }`}
            />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="password">
              <span
                className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {t('Common.password')}
              </span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`input input-bordered w-full ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-300'
                    : 'bg-white border-gray-300 focus:border-blue-300 focus:ring-blue-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-500" />
                ) : (
                  <Eye size={20} className="text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 mt-4">
            <Link
              href="/forgot-password"
              className={`text-xs font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            >
              {t('Login.forgotPassword')}
            </Link>
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`btn w-full ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? t('Login.loggingIn') : t('Login.loginButton')}
            {!isLoading && <LogIn className="ml-2 w-5 h-5" />}
          </motion.button>
        </form>
        <div className="text-center mt-4">
          <p
            className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {t('Login.noAccount')}{' '}
            <Link
              href="/register"
              className={`font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            >
              {t('Login.registerLink')}
            </Link>
          </p>
        </div>
        <div className="text-xs text-gray-500 text-center mt-4">
          <p>{t('Login.recaptcha')} </p>
          <a
            href="https://policies.google.com/privacy"
            className="text-blue-500"
          >
            Privacy Policy
          </a>
          ,{' '}
          <a href="https://policies.google.com/terms" className="text-blue-500">
            Terms of Service
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;
