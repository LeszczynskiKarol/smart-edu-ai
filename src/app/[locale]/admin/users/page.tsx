// src/app/[locale]/admin/users/page.ts
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Search,
  Edit,
  Trash2,
  DollarSign,
  Key,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  UserPlus,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import UserEditModal from '@/components/admin/UserEditModal';
import BalanceAdjustModal from '@/components/admin/BalanceAdjustModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Loader from '@/components/ui/Loader';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountBalance: number;
  isVerified: boolean;
  createdAt: string;
  stats: {
    totalOrders: number;
    totalSpent: number;
    payments: {
      totalPayments: number;
      totalPaid: number;
      totalTopUps: number;
      totalOrderPayments: number;
    };
  };
}

export default function AdminUsersPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        role: roleFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.total);
        setTotalCount(data.pagination.count);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setNotification({
        type: 'error',
        message: 'Błąd podczas pobierania użytkowników',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `Czy na pewno chcesz zresetować hasło dla użytkownika ${userEmail}?`
      )
    ) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/reset-password`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Link resetowania hasła został wysłany',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setNotification({
        type: 'error',
        message: 'Błąd podczas resetowania hasła',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {notification.message}
          <button
            onClick={() => setNotification(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1
            className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            Zarządzanie użytkownikami
          </h1>
          <p
            className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Łącznie użytkowników: {totalCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Szukaj po nazwie lub emailu..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Wszystkie role</option>
            <option value="client">Klient</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="createdAt-desc">Najnowsi</option>
            <option value="createdAt-asc">Najstarsi</option>
            <option value="name-asc">Nazwa A-Z</option>
            <option value="name-desc">Nazwa Z-A</option>
            <option value="accountBalance-desc">Saldo malejąco</option>
            <option value="accountBalance-asc">Saldo rosnąco</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table
          className={`w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Użytkownik
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Rola
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Saldo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Zamówienia
              </th>
              {/* NOWA KOLUMNA */}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Płatności
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Data rej.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}
          >
            {users.map((u) => (
              <tr
                key={u._id}
                className={`${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-gray-500">
                        {u.isVerified ? (
                          <span className="text-green-500">
                            ✓ Zweryfikowany
                          </span>
                        ) : (
                          <span className="text-red-500">
                            ✗ Niezweryfikowany
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {u.role === 'admin' ? 'Administrator' : 'Klient'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {u.accountBalance.toFixed(2)} PLN
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{u.stats.totalOrders}</span>
                    <span className="text-xs text-gray-500">
                      {u.stats.totalSpent.toFixed(2)} PLN
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/admin/users/${u._id}`)}
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                      title="Zobacz szczegóły"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edytuj"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowBalanceModal(true);
                      }}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      title="Dostosuj saldo"
                    >
                      <DollarSign size={18} />
                    </button>
                    <button
                      onClick={() => handleResetPassword(u._id, u.email)}
                      className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                      title="Resetuj hasło"
                    >
                      <Key size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Usuń"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-green-600 dark:text-green-400">
                      ✓ {u.stats.payments.totalPaid.toFixed(2)} PLN
                    </span>
                    <span className="text-xs text-gray-500">
                      {u.stats.payments.totalPayments} płatności
                    </span>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        Doład: {u.stats.payments.totalTopUps.toFixed(2)} PLN
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                        Zam: {u.stats.payments.totalOrderPayments.toFixed(2)}{' '}
                        PLN
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          <ChevronLeft size={20} />
          Poprzednia
        </button>
        <span
          className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          Strona {page} z {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Następna
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Modals */}
      {showEditModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
            setNotification({
              type: 'success',
              message: 'Użytkownik zaktualizowany pomyślnie',
            });
          }}
        />
      )}

      {showBalanceModal && selectedUser && (
        <BalanceAdjustModal
          user={selectedUser}
          onClose={() => {
            setShowBalanceModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
            setNotification({
              type: 'success',
              message: 'Saldo zaktualizowane pomyślnie',
            });
          }}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteConfirmModal
          user={selectedUser}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
            setNotification({
              type: 'success',
              message: 'Użytkownik usunięty pomyślnie',
            });
          }}
        />
      )}
    </div>
  );
}
