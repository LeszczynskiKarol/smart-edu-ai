// src/components/admin/UserEditModal.tsx
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface UserEditModalProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    companyDetails?: {
      companyName?: string;
      nip?: string;
      address?: string;
      city?: string;
      postalCode?: string;
      buildingNumber?: string;
    };
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserEditModal({
  user,
  onClose,
  onSuccess,
}: UserEditModalProps) {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    companyDetails: {
      companyName: user.companyDetails?.companyName || '',
      nip: user.companyDetails?.nip || '',
      address: user.companyDetails?.address || '',
      city: user.companyDetails?.city || '',
      postalCode: user.companyDetails?.postalCode || '',
      buildingNumber: user.companyDetails?.buildingNumber || '',
    },
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Błąd podczas aktualizacji');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Błąd podczas aktualizacji użytkownika');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Edytuj użytkownika</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium mb-1">Nazwa</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rola</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="client">Klient</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) =>
                  setFormData({ ...formData, isVerified: e.target.checked })
                }
                className="mr-2"
              />
              <label className="text-sm font-medium">Konto zweryfikowane</label>
            </div>

            {/* Company Details */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold mb-3">Dane firmowe</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nazwa firmy
                  </label>
                  <input
                    type="text"
                    value={formData.companyDetails.companyName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyDetails: {
                          ...formData.companyDetails,
                          companyName: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">NIP</label>
                  <input
                    type="text"
                    value={formData.companyDetails.nip}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyDetails: {
                          ...formData.companyDetails,
                          nip: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Adres
                  </label>
                  <input
                    type="text"
                    value={formData.companyDetails.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyDetails: {
                          ...formData.companyDetails,
                          address: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Kod pocztowy
                    </label>
                    <input
                      type="text"
                      value={formData.companyDetails.postalCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyDetails: {
                            ...formData.companyDetails,
                            postalCode: e.target.value,
                          },
                        })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Miasto
                    </label>
                    <input
                      type="text"
                      value={formData.companyDetails.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyDetails: {
                            ...formData.companyDetails,
                            city: e.target.value,
                          },
                        })
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Zapisywanie...' : 'Zapisz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
