// src/app/[locale]/admin/automation/ordered-texts/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import Loader from '@/components/ui/Loader';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Download,
  ArrowLeft,
} from 'lucide-react';

interface OrderedText {
  _id: string;
  temat: string;
  idZamowienia: string;
  itemId: string;
  cena: number;
  rodzajTresci: string;
  dlugoscTekstu: number;
  liczbaZnakow: number;
  status: string;
  email: string;
  jezyk: string;
  model: string;
  startDate: string;
  createdAt: string;
  userId?: {
    name: string;
    email: string;
  };
}

export default function OrderedTextsPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const [orderedTexts, setOrderedTexts] = useState<OrderedText[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (user) {
      setLoading(false);
      if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  useEffect(() => {
    fetchOrderedTexts();
  }, [page, search, statusFilter]);

  const fetchOrderedTexts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/automation/ordered-texts?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrderedTexts(data.data);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching ordered texts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/automation/ordered-texts/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchOrderedTexts();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten tekst?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/automation/ordered-texts/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchOrderedTexts();
      }
    } catch (error) {
      console.error('Error deleting text:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Zakończone':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'W trakcie':
        return <RefreshCw size={18} className="text-blue-500" />;
      case 'Oczekujące':
        return <Clock size={18} className="text-yellow-500" />;
      case 'Anulowane':
        return <XCircle size={18} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Zakończone':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'W trakcie':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Oczekujące':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Anulowane':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading && orderedTexts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/automation')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Powrót do Automation Flow
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1
              className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              📥 Zamówione teksty
            </h1>
            <p
              className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Łącznie: {totalCount} tekstów
            </p>
          </div>

          <button
            onClick={fetchOrderedTexts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Odśwież
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            placeholder="Szukaj po temacie, email, ID zamówienia..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Wszystkie statusy</option>
            <option value="Oczekujące">Oczekujące</option>
            <option value="W trakcie">W trakcie</option>
            <option value="Zakończone">Zakończone</option>
            <option value="Anulowane">Anulowane</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table
          className={`w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                Temat
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                ID Zamówienia
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                Typ/Długość
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                Język
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}
          >
            {orderedTexts.map((text) => (
              <tr
                key={text._id}
                className={`${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(text.status)}
                    <select
                      value={text.status}
                      onChange={(e) =>
                        handleStatusChange(text._id, e.target.value)
                      }
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(text.status)}`}
                    >
                      <option value="Oczekujące">Oczekujące</option>
                      <option value="W trakcie">W trakcie</option>
                      <option value="Zakończone">Zakończone</option>
                      <option value="Anulowane">Anulowane</option>
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="font-medium truncate">{text.temat}</p>
                    <p className="text-xs text-gray-500">
                      {text.cena.toFixed(2)} PLN
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  {text.idZamowienia.substring(0, 10)}...
                </td>
                <td className="px-4 py-3 text-sm">{text.email}</td>
                <td className="px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{text.rodzajTresci}</p>
                    <p className="text-xs text-gray-500">
                      {text.liczbaZnakow} znaków
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    {text.jezyk}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(text.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/automation/ordered-texts/${text._id}`
                        )
                      }
                      className="text-blue-600 hover:text-blue-800"
                      title="Zobacz szczegóły"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(text._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Usuń"
                    >
                      <Trash2 size={18} />
                    </button>
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
    </div>
  );
}
