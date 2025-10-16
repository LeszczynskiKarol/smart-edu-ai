// src/app/[locale]/admin/users/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Calendar,
  DollarSign,
  ShoppingCart,
  Edit,
  Key,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Loader from '@/components/ui/Loader';
import UserEditModal from '@/components/admin/UserEditModal';
import BalanceAdjustModal from '@/components/admin/BalanceAdjustModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

interface UserDetails {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    accountBalance: number;
    isVerified: boolean;
    createdAt: string;
    companyDetails?: {
      companyName?: string;
      nip?: string;
      address?: string;
      city?: string;
    };
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }>;
}

export default function UserDetailsPage() {
  const { user: currentUser, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  useEffect(() => {
    fetchUserDetails();
  }, [params.id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUserDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('Czy na pewno chcesz zresetować hasło tego użytkownika?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${params.id}/reset-password`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Link resetowania hasła został wysłany');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Błąd podczas resetowania hasła');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Nie znaleziono użytkownika</p>
      </div>
    );
  }

  const { user, stats, recentOrders } = userDetails;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Powrót do listy użytkowników
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1
              className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {user.name}
            </h1>
            <p
              className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              ID: {user._id}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit size={18} />
              Edytuj
            </button>
            <button
              onClick={() => setShowBalanceModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <DollarSign size={18} />
              Saldo
            </button>
            <button
              onClick={handleResetPassword}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
            >
              <Key size={18} />
              Reset hasła
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 size={18} />
              Usuń
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Saldo konta</p>
              <p className="text-2xl font-bold">
                {user.accountBalance.toFixed(2)} PLN
              </p>
            </div>
            <DollarSign className="text-green-500" size={32} />
          </div>
        </div>

        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Zamówienia</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="text-blue-500" size={32} />
          </div>
        </div>

        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Wydane łącznie</p>
              <p className="text-2xl font-bold">
                {stats.totalSpent.toFixed(2)} PLN
              </p>
            </div>
            <DollarSign className="text-purple-500" size={32} />
          </div>
        </div>

        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-sm font-bold">
                {user.isVerified ? 'Zweryfikowany' : 'Niezweryfikowany'}
              </p>
            </div>
            {user.isVerified ? (
              <CheckCircle className="text-green-500" size={32} />
            ) : (
              <XCircle className="text-red-500" size={32} />
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4">Informacje podstawowe</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Data rejestracji</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {user.role === 'admin' ? 'Administrator' : 'Klient'}
              </div>
            </div>
          </div>
        </div>

        {user.companyDetails &&
          (user.companyDetails.companyName || user.companyDetails.nip) && (
            <div
              className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h2 className="text-xl font-bold mb-4">Dane firmowe</h2>
              <div className="space-y-2">
                {user.companyDetails.companyName && (
                  <div>
                    <p className="text-sm text-gray-500">Nazwa firmy</p>
                    <p className="font-medium">
                      {user.companyDetails.companyName}
                    </p>
                  </div>
                )}
                {user.companyDetails.nip && (
                  <div>
                    <p className="text-sm text-gray-500">NIP</p>
                    <p className="font-medium">{user.companyDetails.nip}</p>
                  </div>
                )}
                {user.companyDetails.address && (
                  <div>
                    <p className="text-sm text-gray-500">Adres</p>
                    <p className="font-medium">
                      {user.companyDetails.address}
                      {user.companyDetails.city &&
                        `, ${user.companyDetails.city}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>

      {/* Recent Orders */}
      <div
        className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h2 className="text-xl font-bold mb-4">Ostatnie zamówienia</h2>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}
              >
                <tr>
                  <th className="px-4 py-2 text-left text-sm">Numer</th>
                  <th className="px-4 py-2 text-left text-sm">Data</th>
                  <th className="px-4 py-2 text-left text-sm">Kwota</th>
                  <th className="px-4 py-2 text-left text-sm">Status</th>
                  <th className="px-4 py-2 text-left text-sm">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-3 text-sm">#{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {order.totalPrice.toFixed(2)} PLN
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'zakończone'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'w trakcie'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() =>
                          router.push(`/admin/orders/${order._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Zobacz
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Brak zamówień</p>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <UserEditModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchUserDetails}
        />
      )}

      {showBalanceModal && (
        <BalanceAdjustModal
          user={user}
          onClose={() => setShowBalanceModal(false)}
          onSuccess={fetchUserDetails}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          user={user}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => router.push('/admin/users')}
        />
      )}
    </div>
  );
}
