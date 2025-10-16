// src/components/admin/ContentGenerationFlow.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';

interface GenerationStep {
  stepNumber: number;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
}

interface GenerationLog {
  _id: string;
  order: {
    orderNumber: number;
    user: any;
  };
  orderItem: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  steps: GenerationStep[];
  totalDuration?: number;
  totalTokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

interface ContentGenerationFlowProps {
  orderId?: string;
  itemId?: string;
}

export default function ContentGenerationFlow({
  orderId,
  itemId,
}: ContentGenerationFlowProps) {
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<GenerationLog | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();

    // Połącz z WebSocket
    const newSocket = io(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    );
    setSocket(newSocket);

    newSocket.on('contentGenerationUpdate', (data) => {
      console.log('Generation update:', data);
      // Odśwież logi gdy otrzymamy aktualizację
      fetchLogs();
    });

    return () => {
      newSocket.close();
    };
  }, [orderId, itemId]);

  const fetchLogs = async () => {
    try {
      const query = new URLSearchParams();
      if (orderId) query.append('orderId', orderId);
      if (itemId) query.append('itemId', itemId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/content/logs?${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
        if (data.data.length > 0 && !selectedLog) {
          setSelectedLog(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'running':
        return <Activity className="w-6 h-6 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'failed':
        return 'bg-red-100 border-red-300';
      case 'running':
        return 'bg-blue-100 border-blue-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Lista logów */}
      <div className="w-1/4 border-r bg-gray-50 p-4 overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Historia generowania</h3>
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log._id}
              onClick={() => setSelectedLog(log)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedLog?._id === log._id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">
                  #{log.order.orderNumber}
                </span>
                {getStatusIcon(log.status)}
              </div>
              <div className="text-xs opacity-75">
                {new Date(log.startedAt).toLocaleString()}
              </div>
              {log.totalDuration && (
                <div className="text-xs opacity-75 mt-1">
                  Czas: {formatDuration(log.totalDuration)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Szczegóły wybranego logu */}
      <div className="flex-1 p-6 overflow-y-auto bg-white">
        {selectedLog ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  Zamówienie #{selectedLog.order.orderNumber}
                </h2>
                <div
                  className={`px-4 py-2 rounded-full ${getStatusColor(selectedLog.status)}`}
                >
                  {selectedLog.status.toUpperCase()}
                </div>
              </div>

              {selectedLog.totalTokensUsed && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Input Tokens</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedLog.totalTokensUsed.input.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Output Tokens</div>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedLog.totalTokensUsed.output.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Całkowity czas</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatDuration(selectedLog.totalDuration)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Kroki przepływu */}
            <div className="space-y-4">
              {selectedLog.steps.map((step, index) => (
                <div key={step.stepNumber} className="relative">
                  {/* Linia łącząca */}
                  {index < selectedLog.steps.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-300" />
                  )}

                  <div
                    className={`border-2 rounded-lg ${getStatusColor(step.status)} overflow-hidden`}
                  >
                    {/* Header kroku */}
                    <div
                      onClick={() => toggleStep(step.stepNumber)}
                      className="p-4 cursor-pointer hover:bg-opacity-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative z-10">
                            {getStatusIcon(step.status)}
                          </div>
                          <div>
                            <div className="font-semibold">
                              Krok {step.stepNumber}: {step.stepName}
                            </div>
                            <div className="text-sm opacity-75">
                              {step.duration &&
                                `Czas wykonania: ${formatDuration(step.duration)}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {step.tokensUsed && (
                            <div className="text-sm bg-white bg-opacity-50 px-3 py-1 rounded-full">
                              {step.tokensUsed.total.toLocaleString()} tokens
                            </div>
                          )}
                          {expandedSteps.has(step.stepNumber) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Szczegóły kroku */}
                    {expandedSteps.has(step.stepNumber) && (
                      <div className="p-4 bg-white border-t-2">
                        {step.input && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Input:</h4>
                            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                              {JSON.stringify(step.input, null, 2)}
                            </pre>
                          </div>
                        )}

                        {step.output && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Output:</h4>
                            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                              {JSON.stringify(step.output, null, 2)}
                            </pre>
                          </div>
                        )}

                        {step.error && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-red-600">
                              Error:
                            </h4>
                            <pre className="bg-red-50 p-3 rounded text-xs text-red-600">
                              {step.error}
                            </pre>
                          </div>
                        )}

                        {step.tokensUsed && (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-gray-50 p-2 rounded text-center">
                              <div className="text-xs text-gray-600">Input</div>
                              <div className="font-bold">
                                {step.tokensUsed.input}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                              <div className="text-xs text-gray-600">
                                Output
                              </div>
                              <div className="font-bold">
                                {step.tokensUsed.output}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                              <div className="text-xs text-gray-600">Total</div>
                              <div className="font-bold">
                                {step.tokensUsed.total}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500">
                          <div>
                            Start:{' '}
                            {step.startTime &&
                              new Date(step.startTime).toLocaleString()}
                          </div>
                          {step.endTime && (
                            <div>
                              End: {new Date(step.endTime).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedLog.error && (
              <div className="mt-6 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h4 className="font-semibold text-red-600 mb-2">
                  Błąd generowania:
                </h4>
                <pre className="text-sm text-red-600 whitespace-pre-wrap">
                  {selectedLog.error}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Wybierz log z listy
          </div>
        )}
      </div>
    </div>
  );
}
