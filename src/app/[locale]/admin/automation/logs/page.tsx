// src/app/[locale]/admin/automation/logs/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import Loader from '@/components/ui/Loader';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Filter,
} from 'lucide-react';

interface SystemLog {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  type: string;
  message: string;
  data?: any;
}

export default function SystemLogsPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchLogs();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 10000); // Refresh co 10 sekund
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, levelFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const params = new URLSearchParams({
        limit: '100',
        ...(levelFilter && { level: levelFilter }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/automation/logs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
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
      second: '2-digit',
    });
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
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
              📋 Logi systemowe
            </h1>
            <p
              className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Historia aktywności automation flow
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                autoRefresh
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-white'
              }`}
            >
              <RefreshCw
                size={18}
                className={autoRefresh ? 'animate-spin' : ''}
              />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>

            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Odśwież
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="relative w-64">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Wszystkie poziomy</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${getLevelColor(log.level)}`}
            >
              <div className="flex items-start gap-3">
                {getLevelIcon(log.level)}

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{log.message}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        log.level === 'success'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : log.level === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : log.level === 'warning'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {log.type}
                    </span>
                  </div>

                  {log.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                        Zobacz szczegóły
                      </summary>
                      <pre
                        className={`mt-2 p-3 rounded text-xs overflow-x-auto ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                        }`}
                      >
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className={`p-8 rounded-lg text-center ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <p className="text-gray-500">Brak logów do wyświetlenia</p>
          </div>
        )}
      </div>
    </div>
  );
}
