// src/components/admin/BalanceAdjustModal.tsx
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface BalanceAdjustModalProps {
  user: {
    _id: string;
    name: string;
    email: string;
    accountBalance: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function BalanceAdjustModal({
  user,
  onClose,
  onSuccess,
}: BalanceAdjustModalProps) {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user._id}/balance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            reason,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Błąd podczas aktualizacji salda');
      }
    } catch (error) {
      console.error('Error adjusting balance:', error);
      alert('Błąd podczas aktualizacji salda');
    } finally {
      setLoading(false);
    }
  };

  const newBalance = user.accountBalance + (parseFloat(amount) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Dostosuj saldo</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>{user.name}</strong>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {user.email}
            </p>
            <p className="text-lg font-bold mt-2">
              Aktualne saldo: {user.accountBalance.toFixed(2)} PLN
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Kwota zmiany
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Użyj +/- dla zwiększenia/zmniejszenia"
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Np. +100 aby dodać 100 PLN lub -50 aby odjąć 50 PLN
              </p>
            </div>

            {amount && (
              <div
                className={`p-3 rounded-lg ${
                  parseFloat(amount) > 0
                    ? 'bg-green-50 dark:bg-green-900'
                    : 'bg-red-50 dark:bg-red-900'
                }`}
              >
                <p className="text-sm font-medium">
                  Nowe saldo: {newBalance.toFixed(2)} PLN
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {parseFloat(amount) > 0 ? 'Zwiększenie' : 'Zmniejszenie'} o{' '}
                  {Math.abs(parseFloat(amount)).toFixed(2)} PLN
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Powód (opcjonalnie)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Np. Zwrot za zamówienie #123"
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                disabled={loading}
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Aktualizowanie...' : 'Zaktualizuj saldo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
