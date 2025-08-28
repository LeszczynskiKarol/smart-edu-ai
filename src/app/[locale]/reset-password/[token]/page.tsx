// src/app/[locale]/reset-password/[token]/page.tsx
'use client'

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useTheme } from '@/context/ThemeContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ResetPasswordPage = () => {
  const t = useTranslations('Auth.resetPassword');
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetPasswordSchema = z.object({
    password: z.string().min(8, { message: t('validation.passwordLength') }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMatch'),
    path: ['confirmPassword'],
  });

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: data.password }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(t('success'));
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(result.message || t('error'));
      }
    } catch (error) {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={t('title')}>
      <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className={`mt-6 text-center text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('pageTitle')}
            </h2>
          </div>
          {token ? (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <div className="relative">
                  <label htmlFor="password" className="sr-only">{t('newPassword')}</label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                      } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${theme === 'dark' ? 'bg-gray-700 text-white' : ''
                      }`}
                    placeholder={t('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-gray-500" />}
                  </button>
                </div>
                <div className="relative">
                  <label htmlFor="confirmPassword" className="sr-only">{t('confirmPassword')}</label>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${theme === 'dark' ? 'bg-gray-700 text-white' : ''
                      }`}
                    placeholder={t('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-gray-500" />}
                  </button>
                </div>
              </div>

              {errors.password && (
                <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  {errors.password.message}
                </p>
              )}
              {errors.confirmPassword && (
                <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  {errors.confirmPassword.message}
                </p>
              )}
              {error && (
                <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  {error}
                </p>
              )}
              {success && (
                <p className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  {success}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }`}
                >
                  {isLoading ? t('resettingButton') : t('resetButton')}
                </button>
              </div>
            </form>
          ) : (
            <p className={`text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              {t('invalidToken')}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;