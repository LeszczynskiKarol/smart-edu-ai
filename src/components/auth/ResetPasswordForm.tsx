// src/components/auth/ResetPasswordForm.tsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { theme } = useTheme();
  const router = useRouter();
  const t = useTranslations('Auth.resetPassword');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t('validation.passwordMatch'));
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t('success'));
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.message || t('error'));
      }
    } catch (error) {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClasses = `
    mt-1 block w-full rounded-md 
    focus:outline-none focus:ring-2 focus:ring-opacity-50 
    transition-colors duration-200
    ${theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500'
      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
    }
  `;

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label
          htmlFor="newPassword"
          className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
        >
          {t('newPassword')}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputBaseClasses}
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
        >
          {t('confirmPassword')}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputBaseClasses}
        />
      </div>

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

      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full flex justify-center py-2 px-4 
          border border-transparent rounded-md 
          shadow-sm text-sm font-medium text-white 
          transition-colors duration-200
          ${theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? t('resettingButton') : t('resetButton')}
      </button>
    </form>
  );
};

export default ResetPasswordForm;