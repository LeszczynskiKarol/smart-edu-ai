// src/app/[locale]/admin/automation/ordered-texts/[id]/page.tsx
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
  FileText,
  Globe,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrderedTextDetails {
  _id: string;
  temat: string;
  idZamowienia: string;
  itemId: string;
  cena: number;
  cenaZamowienia: number;
  rodzajTresci: string;
  dlugoscTekstu: number;
  liczbaZnakow: number;
  status: string;
  email: string;
  jezyk: string;
  jezykWyszukiwania: string;
  countryCode: string;
  model: string;
  bibliografia: boolean;
  faq: boolean;
  tabele: boolean;
  boldowanie: boolean;
  listyWypunktowane: boolean;
  frazy: string;
  link1?: string;
  link2?: string;
  link3?: string;
  link4?: string;
  wytyczneIndywidualne: string;
  tonIStyl: string;
  startDate: string;
  createdAt: string;
}

interface GoogleSearchResult {
  searchQuery: string;
  language: string;
  results: Array<{
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
  }>;
  totalResults: string;
  searchTime: number;
  status: string;
}

interface ScrapedContent {
  _id: string;
  url: string;
  scrapedText: string;
  status: string;
  errorMessage?: string;
  textLength: number;
  scrapedAt?: string;
}

interface ProcessingStatus {
  orderedText: {
    exists: boolean;
    status: string;
  };
  googleSearch: {
    exists: boolean;
    status: string;
    resultsCount: number;
  };
  scraping: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
  };
  overallProgress: number;
}

export default function OrderedTextDetailsPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();

  const [orderedText, setOrderedText] = useState<OrderedTextDetails | null>(
    null
  );
  const [googleSearch, setGoogleSearch] = useState<GoogleSearchResult | null>(
    null
  );
  const [scrapedContent, setScrapedContent] = useState<ScrapedContent[]>([]);
  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedScrapes, setExpandedScrapes] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (params.id) {
      fetchAllData();
      const interval = setInterval(fetchProcessingStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [params.id]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchOrderedText(),
      fetchGoogleSearch(),
      fetchScrapedContent(),
      fetchProcessingStatus(),
    ]);
    setLoading(false);
  };

  const fetchOrderedText = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/automation/ordered-texts/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setOrderedText(data.data.orderedText);
      }
    } catch (error) {
      console.error('Error fetching ordered text:', error);
    }
  };

  const fetchGoogleSearch = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/text-generation/search-results/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setGoogleSearch(data.data);
      }
    } catch (error) {
      console.error('Error fetching Google search:', error);
    }
  };

  const fetchScrapedContent = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/text-generation/scraped-content/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setScrapedContent(data.data);
      }
    } catch (error) {
      console.error('Error fetching scraped content:', error);
    }
  };

  const fetchProcessingStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/text-generation/processing-status/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setProcessingStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching processing status:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Czy na pewno chcesz usunąć ten tekst?')) return;
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/automation/ordered-texts/${params.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        router.push('/admin/automation/ordered-texts');
      }
    } catch (error) {
      console.error('Error deleting text:', error);
    }
  };

  const toggleScrapeExpand = (id: string) => {
    setExpandedScrapes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
      case 'scraping':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!orderedText) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Nie znaleziono tekstu</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/automation/ordered-texts')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Powrót do listy
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1
              className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {orderedText.temat}
            </h1>
            <p
              className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              ID: {orderedText._id}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={18} />
            Usuń
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(`/admin/automation/process-flow/${params.id}`)
            }
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Sparkles size={18} />
            Analiza procesu
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={18} />
            Usuń
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {processingStatus && (
        <div
          className={`p-6 rounded-lg shadow mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📊 Postęp przetwarzania
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
            <div
              className="bg-blue-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
              style={{ width: `${processingStatus.overallProgress}%` }}
            >
              {processingStatus.overallProgress}%
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Search
                  size={20}
                  className={
                    processingStatus.googleSearch.exists
                      ? 'text-green-500'
                      : 'text-gray-400'
                  }
                />
                <span className="font-medium">Google Search</span>
              </div>
              <p className="text-sm text-gray-500">
                {processingStatus.googleSearch.resultsCount} wyników
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe
                  size={20}
                  className={
                    processingStatus.scraping.completed > 0
                      ? 'text-green-500'
                      : 'text-gray-400'
                  }
                />
                <span className="font-medium">Scraping</span>
              </div>
              <p className="text-sm text-gray-500">
                {processingStatus.scraping.completed}/
                {processingStatus.scraping.total}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText size={20} className="text-gray-400" />
                <span className="font-medium">Generowanie</span>
              </div>
              <p className="text-sm text-gray-500">Oczekuje...</p>
            </div>
          </div>
        </div>
      )}

      {/* Google Search Results */}
      {googleSearch && (
        <div
          className={`p-6 rounded-lg shadow mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔍 Wyniki wyszukiwania Google
          </h2>
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Zapytanie
            </p>
            <p className="text-lg font-mono font-bold">
              "{googleSearch.searchQuery}"
            </p>
            <div className="flex gap-4 mt-2 text-sm">
              <span>Język: {googleSearch.language}</span>
              <span>Wyników: {googleSearch.totalResults}</span>
              <span>Czas: {googleSearch.searchTime}s</span>
            </div>
          </div>
          <div className="space-y-3">
            {googleSearch.results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-600 hover:text-blue-800 mb-1">
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        {result.title}
                        <ExternalLink size={16} />
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {result.displayLink}
                    </p>
                    <p className="text-sm">{result.snippet}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scraped Content */}
      {scrapedContent.length > 0 && (
        <div
          className={`p-6 rounded-lg shadow mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🕷️ Zescrapowana treść ({scrapedContent.length})
          </h2>
          <div className="space-y-3">
            {scrapedContent.map((scrape) => (
              <div
                key={scrape._id}
                className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {scrape.status === 'completed' && (
                        <CheckCircle size={18} className="text-green-500" />
                      )}
                      {scrape.status === 'failed' && (
                        <AlertCircle size={18} className="text-red-500" />
                      )}
                      {(scrape.status === 'pending' ||
                        scrape.status === 'scraping') && (
                        <Clock size={18} className="text-yellow-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${getStatusColor(scrape.status)}`}
                      >
                        {scrape.status}
                      </span>
                    </div>

                    <a
                      href={scrape.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-2"
                    >
                      {scrape.url}
                      <ExternalLink size={14} />
                    </a>
                    {scrape.status === 'completed' && (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Długość: {scrape.textLength.toLocaleString()} znaków
                        </p>
                        <button
                          onClick={() => toggleScrapeExpand(scrape._id)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {expandedScrapes.has(scrape._id) ? (
                            <>
                              <ChevronUp size={16} />
                              Zwiń treść
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              Pokaż treść
                            </>
                          )}
                        </button>
                        {expandedScrapes.has(scrape._id) && (
                          <div
                            className={`mt-3 p-3 rounded text-sm max-h-96 overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}
                          >
                            <pre className="whitespace-pre-wrap font-mono text-xs">
                              {scrape.scrapedText.substring(0, 2000)}
                              {scrape.scrapedText.length > 2000 && '...'}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                    {scrape.errorMessage && (
                      <p className="text-sm text-red-600 mt-2">
                        Błąd: {scrape.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Original Details - pozostałe sekcje bez zmian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4">Podstawowe informacje</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">ID Zamówienia</p>
              <p className="font-medium font-mono">
                {orderedText.idZamowienia}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{orderedText.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{orderedText.email}</p>
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4">Parametry</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Rodzaj treści</p>
              <p className="font-medium">{orderedText.rodzajTresci}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Długość</p>
              <p className="font-medium">{orderedText.dlugoscTekstu} znaków</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Język</p>
              <p className="font-medium">{orderedText.jezyk}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
