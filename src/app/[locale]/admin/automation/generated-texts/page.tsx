// src/app/[locale]/admin/automation/generated-texts/page.tsx
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
  Download,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

interface GeneratedText {
  _id: string;
  temat: string;
  idZamowienia: string;
  itemId: string;
  status: string;
  email: string;
  jezyk: string;
  model: string;
  content: string;
  delivered: boolean;
  deliveredAt?: string;
  errorMessage?: string;
  createdAt: string;
  completionDate?: string;
  orderedTextId?: any;
}

export default function GeneratedTextsPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const [generatedTexts, setGeneratedTexts] = useState<GeneratedText[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveredFilter, setDeliveredFilter] = useState('');
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
    fetchGeneratedTexts();
  }, [page, search, statusFilter, deliveredFilter]);

  const fetchGeneratedTexts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(deliveredFilter && { delivered: deliveredFilter }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/automation/generated-texts?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setGeneratedTexts(data.data);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching generated texts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (text: GeneratedText) => {
    const element = document.createElement('a');
    const file = new Blob([text.content], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${text.temat.substring(0, 30)}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

  const getStatusBadge = (text: GeneratedText) => {
    if (text.status === 'Błąd') {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1">
          <AlertCircle size={14} />
          Błąd
        </span>
      );
    }

    if (text.delivered) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
          <CheckCircle size={14} />
          Dostarczono
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center gap-1">
        <RefreshCw size={14} />
        Oczekuje
      </span>
    );
  };

  if (loading && generatedTexts.length === 0) {
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
              ✅ Wygenerowane teksty
            </h1>
            <p
              className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Łącznie: {totalCount} tekstów
            </p>
          </div>

          <button
            onClick={fetchGeneratedTexts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Odśwież
          </button>
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
            <option value="Zakończone">Zakończone</option>
            <option value="Błąd">Błąd</option>
          </select>
        </div>

        {/* Delivered Filter */}
        <div className="relative">
          <select
            value={deliveredFilter}
            onChange={(e) => {
              setDeliveredFilter(e.target.value);
              setPage(1);
            }}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Wszystkie</option>
            <option value="true">Dostarczone</option>
            <option value="false">Niedostarczone</option>
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
                Model
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                Długość
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
            {generatedTexts.map((text) => (
              <tr
                key={text._id}
                className={`${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(text)}
                  {text.errorMessage && (
                    <p className="text-xs text-red-500 mt-1">
                      {text.errorMessage}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="font-medium truncate">{text.temat}</p>
                    <p className="text-xs text-gray-500">{text.jezyk}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  {text.idZamowienia.substring(0, 10)}...
                </td>
                <td className="px-4 py-3 text-sm">{text.email}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    {text.model}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {text.content ? `${text.content.length} znaków` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  <div>
                    <p>{formatDate(text.createdAt)}</p>
                    {text.deliveredAt && (
                      <p className="text-xs text-green-600">
                        Dostarczono: {formatDate(text.deliveredAt)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/automation/generated-texts/${text._id}`
                        )
                      }
                      className="text-blue-600 hover:text-blue-800"
                      title="Zobacz szczegóły"
                    >
                      <Eye size={18} />
                    </button>
                    {text.content && (
                      <button
                        onClick={() => handleDownload(text)}
                        className="text-green-600 hover:text-green-800"
                        title="Pobierz"
                      >
                        <Download size={18} />
                      </button>
                    )}
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
