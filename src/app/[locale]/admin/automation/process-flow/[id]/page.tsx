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
  Download,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AcademicWork {
  _id: string;
  workType: string;
  status: string;
  tableOfContents?: string;
  chaptersCount: number;
  chaptersCompleted: number;
  totalCharacters: number;
  totalTokens: number;
  totalGenerationTime: number;
  createdAt: string;
  completionTime?: string;
}

interface ProcessFlowData {
  orderedText: {
    _id: string;
    temat: string;
    rodzajTresci: string;
    status: string;
    createdAt: string;
    liczbaZnakow: number;
    jezyk: string;
    wytyczneIndywidualne?: string;
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
  structure?: {
    _id: string;
    structure: string;
    headersCount: number;
    usedSources: Array<{
      url: string;
      textLength: number;
      snippet: string;
      truncated: boolean;
    }>;
    totalSourcesLength: number;
    status: string;
    generationTime: number;
    tokensUsed: number;
    createdAt: string;
    promptUsed?: string;
  };
  generatedContent?: {
    _id: string;
    fullContent: string;
    totalWords: number;
    totalCharacters: number;
    status: string;
    generationTime: number;
    tokensUsed: number;
    createdAt: string;
    promptUsed?: string;
  };
  timeline: Array<{
    step: number;
    name: string;
    timestamp?: string;
    status: string;
    data?: any;
  }>;
  academicWork?: AcademicWork;
}

export default function ProcessFlowPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();

  const [data, setData] = useState<ProcessFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(
    new Set()
  );
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const togglePrompt = (promptId: string) => {
    setExpandedPrompts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(promptId)) {
        newSet.delete(promptId);
      } else {
        newSet.add(promptId);
      }
      return newSet;
    });
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

  // Komponent dla promptu
  const PromptViewer = ({
    prompt,
    title,
    id,
    metadata,
  }: {
    prompt: string;
    title: string;
    id: string;
    metadata?: any;
  }) => {
    const isExpanded = expandedPrompts.has(id);
    const isCopied = copiedPrompt === id;

    return (
      <div className="mt-4 border border-purple-300 dark:border-purple-700 rounded-lg overflow-hidden">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 flex justify-between items-center">
          <h4 className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <Sparkles size={18} />
            {title}
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(prompt, id)}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1 text-sm"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
              {isCopied ? 'Skopiowano!' : 'Kopiuj'}
            </button>
            <button
              onClick={() => togglePrompt(id)}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-1 text-sm"
            >
              {isExpanded ? (
                <>
                  <EyeOff size={14} />
                  Zwiń
                </>
              ) : (
                <>
                  <Eye size={14} />
                  Zobacz cały prompt
                </>
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="bg-white dark:bg-gray-800 p-4 border-t border-purple-200 dark:border-purple-800">
            <pre className="text-xs whitespace-pre-wrap font-mono overflow-x-auto">
              {prompt}
            </pre>
            {metadata && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {metadata.tokensUsed && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <p className="text-gray-600 dark:text-gray-400">Tokeny</p>
                      <p className="font-bold text-blue-600">
                        {metadata.tokensUsed.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {metadata.generationTime && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <p className="text-gray-600 dark:text-gray-400">Czas</p>
                      <p className="font-bold text-green-600">
                        {(metadata.generationTime / 1000).toFixed(2)}s
                      </p>
                    </div>
                  )}
                  {metadata.headersCount && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                      <p className="text-gray-600 dark:text-gray-400">
                        Nagłówki
                      </p>
                      <p className="font-bold text-purple-600">
                        {metadata.headersCount}
                      </p>
                    </div>
                  )}
                  {metadata.totalCharacters && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                      <p className="text-gray-600 dark:text-gray-400">Znaki</p>
                      <p className="font-bold text-orange-600">
                        {metadata.totalCharacters.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
            {data.orderedText.status} | Długość docelowa:{' '}
            {data.orderedText.liczbaZnakow} znaków
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {data.timeline.map((step) => (
          <div
            key={step.step}
            className={`rounded-lg shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } ${
              step.status === 'completed'
                ? 'border-l-4 border-green-500'
                : step.status === 'in_progress'
                  ? 'border-l-4 border-blue-500'
                  : 'border-l-4 border-gray-300'
            }`}
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

                    {/* 🆕 PROMPT GENEROWANIA ZAPYTANIA */}
                    {step.data?.promptInfo && (
                      <PromptViewer
                        id="query-generation"
                        title="🤖 Prompt generowania zapytania Google"
                        prompt={`Twoim zadaniem jest stworzenie w języku ${data.orderedText.jezyk} zapytania do Google.

TEMAT: ${data.orderedText.temat}
RODZAJ PRACY: ${data.orderedText.rodzajTresci}
WYTYCZNE: ${data.orderedText.wytyczneIndywidualne || 'brak'}

ZASADY:
1. Zapytanie musi być KRÓTKIE (maksymalnie 5-7 słów)
2. MUSISZ odpowiedzieć TYLKO samym zapytaniem, bez żadnego innego tekstu
3. BEZ cudzysłowów, BEZ przedrostków typu "Oto zapytanie:"
4. Użyj kluczowych słów, które znajdą merytoryczne źródła
5. Unikaj ogólników - bądź konkretny

PRZYKŁADY DOBRYCH ZAPYTAŃ:
- "funkcje opiekuna medycznego demencja"
- "wsparcie pacjenta z demencją opieka"
- "rola pielęgniarki demencja starość"

TWOJE ZAPYTANIE (TYLKO SŁOWA KLUCZOWE):`}
                        metadata={{
                          wygenerowane: data.googleSearch.query,
                        }}
                      />
                    )}

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

                    {/* 🆕 PROMPT WYBORU ŹRÓDEŁ */}
                    {step.data?.promptUsed && (
                      <PromptViewer
                        id="source-selection"
                        title="🎯 Prompt wyboru źródeł przez Claude"
                        prompt={step.data.promptUsed}
                        metadata={{
                          wybrano: `${step.data.selected} z ${step.data.total}`,
                          odpowiedz: step.data.response,
                        }}
                      />
                    )}

                    <div className="space-y-3 mt-4">
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

                {/* Krok 5: Struktura */}
                {step.step === 5 && data.structure && (
                  <div className="mt-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Struktura wygenerowana przez Claude "Kierownika"
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Nagłówków: {data.structure.headersCount}</span>
                        <span>
                          Źródeł użytych: {data.structure.usedSources.length}
                        </span>
                        <span>
                          Długość źródeł:{' '}
                          {data.structure.totalSourcesLength.toLocaleString()}{' '}
                          znaków
                        </span>
                      </div>
                    </div>

                    {/* 🆕 PROMPT GENEROWANIA STRUKTURY */}
                    {data.structure.promptUsed && (
                      <PromptViewer
                        id="structure-generation"
                        title="🏗️ Prompt generowania struktury"
                        prompt={data.structure.promptUsed}
                        metadata={{
                          headersCount: data.structure.headersCount,
                          tokensUsed: data.structure.tokensUsed,
                          generationTime: data.structure.generationTime,
                        }}
                      />
                    )}

                    <div
                      className="mt-4 prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-6 rounded border border-gray-200 dark:border-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: data.structure.structure,
                      }}
                    />
                  </div>
                )}

                {/* Dla prac akademickich - spis treści */}
                {step.step === 5 && !data.structure && data.academicWork && (
                  <div className="mt-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Praca {data.academicWork.workType} - Spis treści
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>
                          Rozdziałów: {data.academicWork.chaptersCount}
                        </span>
                        <span>Status: {data.academicWork.status}</span>
                      </div>
                    </div>
                    {data.academicWork.tableOfContents && (
                      <div
                        className="mt-4 prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-6 rounded border border-gray-200 dark:border-gray-700"
                        dangerouslySetInnerHTML={{
                          __html: data.academicWork.tableOfContents,
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Krok 6 - dla prac akademickich */}
                {step.step === 6 &&
                  !data.generatedContent &&
                  data.academicWork && (
                    <div className="mt-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Generowanie pracy {data.academicWork.workType}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                          <div>
                            <span className="font-bold text-green-600">
                              {data.academicWork.chaptersCompleted}/
                              {data.academicWork.chaptersCount}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {' '}
                              rozdziałów
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-green-600">
                              {data.academicWork.totalCharacters?.toLocaleString() ||
                                0}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {' '}
                              znaków
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-green-600">
                              {data.academicWork.totalGenerationTime || 0} min
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {' '}
                              czas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Krok 7: Treść */}
                {step.step === 6 && data.generatedContent && (
                  <div className="mt-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Treść wygenerowana przez Claude "Pisarza"
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="font-bold text-green-600">
                            {data.generatedContent.totalCharacters.toLocaleString()}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {' '}
                            znaków
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-green-600">
                            {data.generatedContent.totalWords.toLocaleString()}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {' '}
                            słów
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-green-600">
                            {(
                              data.generatedContent.generationTime / 1000
                            ).toFixed(1)}
                            s
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {' '}
                            czas
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 🆕 PROMPT GENEROWANIA TREŚCI */}
                    {data.generatedContent.promptUsed && (
                      <PromptViewer
                        id="content-generation"
                        title="✍️ Prompt generowania treści"
                        prompt={data.generatedContent.promptUsed}
                        metadata={{
                          totalCharacters:
                            data.generatedContent.totalCharacters,
                          totalWords: data.generatedContent.totalWords,
                          tokensUsed: data.generatedContent.tokensUsed,
                          generationTime: data.generatedContent.generationTime,
                        }}
                      />
                    )}

                    {/* Podgląd treści */}
                    <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-lg">
                          Wygenerowana treść:
                        </h4>
                        <button
                          onClick={() => {
                            const element = document.createElement('a');
                            const file = new Blob(
                              [data.generatedContent!.fullContent],
                              {
                                type: 'text/html',
                              }
                            );
                            element.href = URL.createObjectURL(file);
                            element.download = `${data.orderedText.temat.substring(0, 30)}.html`;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                        >
                          <Download size={16} />
                          Pobierz HTML
                        </button>
                      </div>
                      <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: data.generatedContent.fullContent,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🆕 STATYSTYKI NA DOLE */}
      <div
        className={`mt-8 p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h2 className="text-2xl font-bold mb-4">📊 Podsumowanie statystyk</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.structure && (
            <>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tokeny (struktura)
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.structure.tokensUsed?.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Czas (struktura)
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {(data.structure.generationTime / 1000).toFixed(1)}s
                </p>
              </div>
            </>
          )}
          {data.generatedContent && (
            <>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tokeny (treść)
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {data.generatedContent.tokensUsed?.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Czas (treść)
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {(data.generatedContent.generationTime / 1000).toFixed(1)}s
                </p>
              </div>
            </>
          )}
        </div>

        {data.structure && data.generatedContent && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tokeny łącznie
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {(
                    data.structure.tokensUsed + data.generatedContent.tokensUsed
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Czas łącznie
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {(
                    (data.structure.generationTime +
                      data.generatedContent.generationTime) /
                    1000
                  ).toFixed(1)}
                  s
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
