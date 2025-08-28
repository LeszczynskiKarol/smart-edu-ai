// src/components/auth/RegisterForm.tsx
'use client';
import PrivacyLink from '@/components/privacy/PrivacyLink';
import React, { useRef, useState, useEffect } from 'react';
import GoogleLogin from './GoogleLogin';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { useConsent } from '../../context/ConsentContext';
import { useLocale, useTranslations } from 'next-intl';
import { useHomeTracking } from '@/hooks/useHomeTracking';

const RegisterForm: React.FC = () => {
  const { clarityConsent } = useConsent();
  const formRef = useRef<HTMLDivElement>(null);
  const { trackEvent } = useHomeTracking('RegisterForm');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuth();
  const { theme } = useTheme();
  const t = useTranslations('Auth');
  const locale = useLocale();

  const badgeStyle = `
    .grecaptcha-badge {
      visibility: hidden;
    }
  `;

  // Dodanie skryptu reCAPTCHA
  useEffect(() => {
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
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      const badges = document.getElementsByClassName('grecaptcha-badge');
      while (badges.length > 0) {
        badges[0].remove();
      }
      if ('grecaptcha' in window) {
        (window as any).grecaptcha = undefined;
      }
    };
  }, []);

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string, email: string) => {
    if (password.length < 8) {
      return false;
    }
    if (password.toLowerCase() === email.toLowerCase()) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (email && !validateEmail(email)) {
      setError(t('Register.errors.invalidEmail'));
    } else if (password) {
      if (!validatePassword(password, email)) {
        if (password.toLowerCase() === email.toLowerCase()) {
          setError(t('Register.errors.passwordSameAsEmail'));
        } else {
          setError(t('Register.errors.invalidPassword'));
        }
      } else {
        setError('');
      }
    } else {
      setError('');
    }
  }, [email, password, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name.trim()) {
      setError(t('Register.errors.nameRequired'));
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('Register.errors.passwordsDontMatch'));
      setIsLoading(false);
      return;
    }

    try {
      const recaptchaResponse = await new Promise<string>((resolve, reject) => {
        if (!window.grecaptcha) {
          reject(new Error('reCAPTCHA nie jest załadowana'));
          return;
        }
        window.grecaptcha.ready(() => {
          window
            .grecaptcha!.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, {
              action: 'register',
            })
            .then(resolve)
            .catch(reject);
        });
      });

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
          locale,
          recaptchaToken: recaptchaResponse,
        }),
      });

      const contentType = response.headers.get('content-type');
      const firstReferrer = sessionStorage.getItem('firstReferrer');

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok) {
          // Tutaj dodajemy śledzenie konwersji po udanej rejestracji
          trackEvent('conversion_registration_standard', {
            component: 'RegisterForm',
            action: 'registration_success',
            path: '/register',
            value: 1,
            status: 'completed',
            source: firstReferrer || 'unknown',
            metadata: {
              userId: data.user.id,
              registrationType: 'standard',
            },
          });

          // Reszta kodu pozostaje bez zmian...
          window.gtag('event', 'sign_up', {
            method: 'email',
            success: true,
          });
          window.gtag('event', 'conversion', {
            send_to: 'AW-988030143/okEDCLz0uvMZEL_JkNcD',
            transaction_id: data.user.id,
            value: 0.3,
            currency: 'USD',
            user_data: {
              email: email,
            },
          });
          if (window.ttq) {
            const hashedEmail = await crypto.subtle
              .digest('SHA-256', new TextEncoder().encode(email))
              .then((hash) => {
                return Array.from(new Uint8Array(hash))
                  .map((b) => b.toString(16).padStart(2, '0'))
                  .join('');
              });

            window.ttq.identify({
              email: hashedEmail,
              external_id: data.user.id, // ID użytkownika z Twojej bazy
            });

            // Następnie wysyłamy event rejestracji z dodatkowymi parametrami
            window.ttq.track('CompleteRegistration', {
              contents: [
                {
                  content_type: 'registration',
                  content_name: 'standard_registration',
                  content_id: data.user.id,
                },
              ],
              currency: 'USD',
              value: 0.3,
              event_id: `reg_${Date.now()}_${data.user.id}`,
            });
          }

          {
            if (
              window.clarity &&
              clarityConsent &&
              typeof window.clarity.identify === 'function'
            ) {
              window.clarity.identify(data.user.id, {
                name: name,
                email: email,
                registrationDate: new Date().toISOString(),
              });
              if (typeof window.clarity.set === 'function') {
                window.clarity.set('userType', 'new_user');
              }
            }
          }
          sessionStorage.setItem('pendingVerification', email);
          trackEvent('formSubmit', {
            component: 'RegisterForm',
            formType: 'register',
            status: 'completed',
            success: true,
          });
          router.push('/verification');
        } else {
          setError(data.message || t('Register.errors.registrationFailed'));
        }
      } else {
        console.error('Unexpected response:', await response.text());
        setError(t('Register.errors.invalidResponse'));
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError(t('Register.errors.registrationFailed'));
      trackEvent('formSubmit', {
        component: 'RegisterForm',
        formType: 'register',
        status: 'error',
        success: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      ref={formRef}
      className={`card w-full max-w-sm shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-body">
        <h2
          className={`card-title justify-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          {t('Register.title')}
        </h2>
        <div className="mb-4">
          <GoogleLogin />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label" htmlFor="name">
              <span
                className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {t('Register.name')}
              </span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`input input-bordered w-full ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-300'
                  : 'bg-white border-gray-300 focus:border-blue-300 focus:ring-blue-200'
              }`}
            />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="email">
              <span
                className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {t('Common.email')}
              </span>
            </label>
            <input
              type="email"
              id="email"
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
                type={showPassword ? 'text' : 'password'}
                id="password"
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
          <div className="form-control">
            <label className="label" htmlFor="confirmPassword">
              <span
                className={`label-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {t('Register.confirmPassword')}
              </span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`input input-bordered w-full ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-300'
                    : 'bg-white border-gray-300 focus:border-blue-300 focus:ring-blue-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} className="text-gray-500" />
                ) : (
                  <Eye size={20} className="text-gray-500" />
                )}
              </button>
            </div>
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
            {isLoading
              ? t('Register.registering')
              : t('Register.registerButton')}
            {!isLoading && <UserPlus className="ml-2 w-5 h-5" />}
          </motion.button>
        </form>

        <div className="text-center mt-4">
          <p
            className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {t('Register.haveAccount')}{' '}
            <Link
              href="/login"
              className={`font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            >
              {t('Register.loginLink')}
            </Link>
          </p>
        </div>
        <div className="text-center mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('Register.privacyNotice')}{' '}
            <span className="text-xs">
              <PrivacyLink />
            </span>
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

export default RegisterForm;
