// src/app/[locale]/admin/automation/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import Loader from '@/components/ui/Loader';
import {
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Database,
  Zap,
  RefreshCw,
  FileText,
  Send,
  Download,
  Settings,
} from 'lucide-react';

interface FlowStats {
  orderedTexts: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  generatedTexts: {
    total: number;
    delivered: number;
    pending: number;
    errors: number;
  };
  recentActivity: Array<{
    _id: string;
    type: 'ordered' | 'generated';
    idZamowienia: string;
    itemId: string;
    status: string;
    createdAt: string;
    email: string;
  }>;
  systemHealth: {
    makeConnection: boolean;
    mongoConnection: boolean;
    lastSync: string;
  };
}

export default function AutomationFlowPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const [stats, setStats] = useState<FlowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchFlowStats();

    // Auto-refresh co 30 sekund
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchFlowStats, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchFlowStats = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/automation/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching flow stats:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Nie udało się załadować danych</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1
            className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            🔄 Automation Flow Control
          </h1>
          <p
            className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
          >
            System zarządzania automatyzacją zamówień i generowania tekstów
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
            }`}
          >
            <RefreshCw
              size={18}
              className={autoRefresh ? 'animate-spin' : ''}
            />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>

          <button
            onClick={() => router.push('/admin/automation/logs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FileText size={18} />
            Logi systemowe
          </button>

          <button
            onClick={() => router.push('/admin/automation/settings')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Settings size={18} />
            Ustawienia
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Make.com Connection</p>
              <p className="text-lg font-bold mt-1">
                {stats.systemHealth.makeConnection ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Połączono
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-2">
                    <XCircle size={20} />
                    Rozłączono
                  </span>
                )}
              </p>
            </div>
            <Zap
              className={
                stats.systemHealth.makeConnection
                  ? 'text-green-500'
                  : 'text-red-500'
              }
              size={32}
            />
          </div>
        </div>

        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">MongoDB Connection</p>
              <p className="text-lg font-bold mt-1">
                {stats.systemHealth.mongoConnection ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Aktywna
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-2">
                    <XCircle size={20} />
                    Nieaktywna
                  </span>
                )}
              </p>
            </div>
            <Database
              className={
                stats.systemHealth.mongoConnection
                  ? 'text-green-500'
                  : 'text-red-500'
              }
              size={32}
            />
          </div>
        </div>

        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ostatnia synchronizacja</p>
              <p className="text-lg font-bold mt-1">
                {formatDate(stats.systemHealth.lastSync)}
              </p>
            </div>
            <Activity className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      {/* Flow Visualization */}
      <div
        className={`p-6 rounded-lg shadow mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h2 className="text-2xl font-bold mb-6">📊 Przepływ danych</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Krok 1: Zamówienia przychodzące */}
          <div className="relative">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-2 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <Send className="text-blue-600" size={24} />
                <h3 className="font-bold text-lg">1. Zamówienia</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Łącznie:</span>
                  <span className="font-bold text-xl">
                    {stats.orderedTexts.total}
                  </span>
                </div>

                <div className="flex justify-between items-center text-yellow-600">
                  <span className="text-sm flex items-center gap-1">
                    <Clock size={16} />
                    Oczekujące:
                  </span>
                  <span className="font-bold">
                    {stats.orderedTexts.pending}
                  </span>
                </div>

                <div className="flex justify-between items-center text-blue-600">
                  <span className="text-sm flex items-center gap-1">
                    <RefreshCw size={16} />W trakcie:
                  </span>
                  <span className="font-bold">
                    {stats.orderedTexts.inProgress}
                  </span>
                </div>

                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm flex items-center gap-1">
                    <CheckCircle size={16} />
                    Zakończone:
                  </span>
                  <span className="font-bold">
                    {stats.orderedTexts.completed}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/admin/automation/ordered-texts')}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Zobacz szczegóły →
              </button>
            </div>

            {/* Strzałka */}
            <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
              <div className="text-4xl text-gray-400">→</div>
            </div>
          </div>

          {/* Krok 2: Generowanie */}
          <div className="relative">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-2 border-purple-500">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-purple-600" size={24} />
                <h3 className="font-bold text-lg">2. Generowanie</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">System:</span>
                  <span className="font-bold">Make.com + AI</span>
                </div>

                <div className="flex justify-between items-center text-yellow-600">
                  <span className="text-sm flex items-center gap-1">
                    <Clock size={16} />W kolejce:
                  </span>
                  <span className="font-bold">
                    {stats.generatedTexts.pending}
                  </span>
                </div>

                <div className="flex justify-between items-center text-red-600">
                  <span className="text-sm flex items-center gap-1">
                    <AlertCircle size={16} />
                    Błędy:
                  </span>
                  <span className="font-bold">
                    {stats.generatedTexts.errors}
                  </span>
                </div>

                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm flex items-center gap-1">
                    <TrendingUp size={16} />
                    Success rate:
                  </span>
                  <span className="font-bold">
                    {stats.generatedTexts.total > 0
                      ? Math.round(
                          (stats.generatedTexts.delivered /
                            stats.generatedTexts.total) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/admin/automation/processing')}
                className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Monitoruj proces →
              </button>
            </div>

            {/* Strzałka */}
            <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
              <div className="text-4xl text-gray-400">→</div>
            </div>
          </div>

          {/* Krok 3: Teksty gotowe */}
          <div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-2 border-green-500">
              <div className="flex items-center gap-3 mb-4">
                <Download className="text-green-600" size={24} />
                <h3 className="font-bold text-lg">3. Gotowe teksty</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Łącznie:</span>
                  <span className="font-bold text-xl">
                    {stats.generatedTexts.total}
                  </span>
                </div>

                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm flex items-center gap-1">
                    <CheckCircle size={16} />
                    Dostarczone:
                  </span>
                  <span className="font-bold">
                    {stats.generatedTexts.delivered}
                  </span>
                </div>

                <div className="flex justify-between items-center text-blue-600">
                  <span className="text-sm">Średni czas:</span>
                  <span className="font-bold">~15 min</span>
                </div>

                <div className="flex justify-between items-center text-purple-600">
                  <span className="text-sm">Jakość:</span>
                  <span className="font-bold">98.5%</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/admin/automation/generated-texts')}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Przeglądaj teksty →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h2 className="text-xl font-bold mb-4">📋 Ostatnia aktywność</h2>

        {stats.recentActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}
              >
                <tr>
                  <th className="px-4 py-2 text-left text-sm">Czas</th>
                  <th className="px-4 py-2 text-left text-sm">Typ</th>
                  <th className="px-4 py-2 text-left text-sm">ID Zamówienia</th>
                  <th className="px-4 py-2 text-left text-sm">Item ID</th>
                  <th className="px-4 py-2 text-left text-sm">Email</th>
                  <th className="px-4 py-2 text-left text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentActivity.map((activity) => (
                  <tr key={activity._id}>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(activity.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          activity.type === 'ordered'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {activity.type === 'ordered'
                          ? '📥 Zamówienie'
                          : '✅ Wygenerowane'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {activity.idZamowienia.substring(0, 10)}...
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {activity.itemId.substring(0, 10)}...
                    </td>
                    <td className="px-4 py-3 text-sm">{activity.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          activity.status === 'Zakończone' ||
                          activity.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : activity.status === 'W trakcie'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Brak ostatniej aktywności
          </p>
        )}
      </div>
    </div>
  );
}
