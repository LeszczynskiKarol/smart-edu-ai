// src/components/auth/ForgotPasswordForm.tsx
'use client'
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '../../context/ThemeContext';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { theme } = useTheme();
  const t = useTranslations('Auth.forgotPassword');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t('success'));
      } else {
        setError(data.message || t('error'));
      }
    } catch (error) {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="email" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('emailLabel')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring focus:ring-opacity-50 ${theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-300'
            : 'border-gray-300 focus:border-green-300 focus:ring-green-200'
            }`}
        />
      </div>
      {error && <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>{error}</p>}
      {success && <p className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`}>{success}</p>}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
        >
          {isLoading ? t('sendingButton') : t('submitButton')}
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm; 