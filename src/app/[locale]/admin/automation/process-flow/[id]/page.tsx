// src/app/[locale]/admin/automation/process-flow/[id]/page.tsx
'use client';

import Loader from '@/components/ui/Loader';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProcessFlowData {
  orderedText: {
    _id: string;
    temat: string;
    rodzajTresci: string;
    status: string;
    createdAt: string;
  };
  googleSearch: {
    query: string;
    language: string;
    resultsCount: number;
    results: Array<{
      title: string;
      link: string;
      snippet: string;
    }>;
  } | null;
  scraping: {
    total: number;
    completed: number;
    failed: number;
    sources: Array<{
      _id: string;
      url: string;
      status: string;
      textLength: number;
      selected: boolean;
      selectionReason?: string;
    }>;
  };
  selectedSources: Array<{
    _id: string;
    url: string;
    textLength: number;
    snippet: string;
  }>;
  timeline: Array<{
    step: number;
    name: string;
    timestamp?: string;
    status: string;
    data?: any;
  }>;
}

export default function ProcessFlowPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();

  const [data, setData] = useState<ProcessFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (params.id) {
      fetchProcessFlow();
      const interval = setInterval(fetchProcessFlow, 10000);
      return () => clearInterval(interval);
    }
  }, [params.id]);

  const fetchProcessFlow = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/text-generation/process-flow/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching process flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'in_progress':
        return <Clock className="text-blue-500 animate-pulse" size={24} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={24} />;
      default:
        return <Clock className="text-gray-400" size={24} />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Oczekuje...';
    return new Date(dateString).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Nie udało się załadować danych</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/automation/ordered-texts')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Powrót do listy
        </button>

        <div>
          <h1
            className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            🔄 Przebieg procesu generowania
          </h1>
          <p
            className={`text-lg mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {data.orderedText.temat}
          </p>
          <p
            className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Rodzaj: {data.orderedText.rodzajTresci} | Status:{' '}
            {data.orderedText.status}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {data.timeline.map((step, index) => (
          <div
            key={step.step}
            className={`rounded-lg shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } ${step.status === 'completed' ? 'border-l-4 border-green-500' : step.status === 'in_progress' ? 'border-l-4 border-blue-500' : 'border-l-4 border-gray-300'}`}
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() =>
                setExpandedStep(expandedStep === step.step ? null : step.step)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStepIcon(step.status)}
                  <div>
                    <h3 className="text-lg font-bold">
                      Krok {step.step}: {step.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(step.timestamp)}
                    </p>
                  </div>
                </div>
                {expandedStep === step.step ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedStep === step.step && (
              <div
                className={`px-6 pb-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
              >
                {/* Krok 2: Google Search */}
                {step.step === 2 && data.googleSearch && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Zapytanie Google:
                      </p>
                      <p className="text-lg font-mono font-bold mt-1">
                        "{data.googleSearch.query}"
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Język: {data.googleSearch.language}</span>
                        <span>Wyników: {data.googleSearch.resultsCount}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        Znalezione linki ({data.googleSearch.resultsCount}):
                      </h4>
                      {data.googleSearch.results.map((result, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                        >
                          <a
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                          >
                            {idx + 1}. {result.title}
                            <ExternalLink size={14} />
                          </a>
                          <p className="text-xs text-gray-500 mt-1">
                            {result.link}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Krok 3: Scraping */}
                {step.step === 3 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {data.scraping.completed}
                        </p>
                        <p className="text-sm">Ukończone</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {data.scraping.failed}
                        </p>
                        <p className="text-sm">Błędy</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {data.scraping.total}
                        </p>
                        <p className="text-sm">Łącznie</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {data.scraping.sources.map((source, idx) => (
                        <div
                          key={source._id}
                          className={`p-3 rounded text-sm ${
                            source.selected
                              ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                              : 'bg-gray-50 dark:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                              >
                                {idx + 1}. {source.url.substring(0, 80)}...
                                <ExternalLink size={14} />
                              </a>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                                <span>
                                  Status:{' '}
                                  <span
                                    className={
                                      source.status === 'completed'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }
                                  >
                                    {source.status}
                                  </span>
                                </span>
                                {source.textLength > 0 && (
                                  <span>
                                    Długość:{' '}
                                    {source.textLength.toLocaleString()} znaków
                                  </span>
                                )}
                              </div>
                            </div>
                            {source.selected && (
                              <div className="ml-4">
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-bold flex items-center gap-1">
                                  <Sparkles size={14} />
                                  WYBRANE
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Krok 4: Wybór źródeł */}
                {step.step === 4 && data.selectedSources.length > 0 && (
                  <div className="mt-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Claude wybrał{' '}
                        <span className="font-bold text-purple-600">
                          {data.selectedSources.length}
                        </span>{' '}
                        najlepszych źródeł z{' '}
                        <span className="font-bold">
                          {data.scraping.completed}
                        </span>{' '}
                        dostępnych
                      </p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${(data.selectedSources.length / data.scraping.completed) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {data.selectedSources.map((source, idx) => (
                        <div
                          key={source._id}
                          className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 p-4 rounded"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                              >
                                {source.url}
                                <ExternalLink size={16} />
                              </a>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Długość: {source.textLength.toLocaleString()}{' '}
                                znaków
                              </p>
                              <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                                <p className="text-gray-600 dark:text-gray-400">
                                  Fragment:
                                </p>
                                <p className="mt-1">{source.snippet}...</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
