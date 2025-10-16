// src/components/admin/DeleteConfirmModal.tsx

'use client';

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface DeleteConfirmModalProps {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({
  user,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');

  const handleDelete = async () => {
    if (confirmEmail !== user.email) {
      alert('Email nie pasuje');
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Błąd podczas usuwania użytkownika');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Błąd podczas usuwania użytkownika');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={24} />
              <h2 className="text-2xl font-bold text-red-600">
                Usuń użytkownika
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Czy na pewno chcesz usunąć użytkownika:
            </p>
            <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {user.email}
              </p>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-4">
              <strong>Uwaga:</strong> Ta operacja jest nieodwracalna. Wszystkie
              dane użytkownika zostaną trwale usunięte.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Potwierdź usunięcie wpisując email użytkownika:
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={user.email}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmEmail !== user.email || loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Usuwanie...' : 'Usuń użytkownika'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
