// src/components/analytics/SessionDetailsModal.tsx
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/CardAnal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, User, Clock, Monitor } from 'lucide-react';

export interface SessionEvent {
  eventType: string;
  path: string;
  action: string;
  timestamp: string;
  component: string;
  sessionData?: {
    firstReferrer?: string;
    referrer?: string;
    landingPage?: string;
  };
  eventData: {
    metadata: {
      formId: string;
      previousLength?: string;
      newLength?: string;
      newPrice?: number;
      lengthLabel?: string;
      previousType?: string;
      newType?: string;
      typeLabel?: string;
      newState?: string;
      updatedFields?: string[];
      values?: Record<string, any>;
      [key: string]: any;
    };
    source?: string;
    isNewUser?: boolean;
    component?: string;
    path?: string;
    action?: string;
    firstReferrer?: string;
    campaignData?: {
      campaign?: string;
      source?: string;
      device?: string;
    };
  };
  performanceMetrics?: {
    loadTime: number;
    renderTime: number;
    networkLatency: number;
  };
  deviceInfo?: {
    browser: string;
    os: string;
    device: string;
  };
}

export interface Session {
  _id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  startTime: string;
  endTime: string;
  eventCount: number;
  events: SessionEvent[];
  sourceDetails: {
    source: string;
    referrer: string;
    firstReferrer: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
  };
  sessionData?: {
    referrerData?: {
      firstReferrer?: string;
      landingPage?: string;
      utmParams?: {
        source?: string;
        medium?: string;
        campaign?: string;
      };
    };
    firstReferrer?: string;
    referrer?: string;
  };
}

interface Props {
  session: Session | null;
  onClose: () => void;
}

export const SessionDetailsModal: React.FC<Props> = ({ session, onClose }) => {
  const performanceData = useMemo(() => {
    if (!session) return [];

    return session.events
      .filter((event) => event.performanceMetrics)
      .map((event) => ({
        time: format(new Date(event.timestamp), 'HH:mm:ss'),
        loadTime: event.performanceMetrics?.loadTime || 0,
        renderTime: event.performanceMetrics?.renderTime || 0,
        networkLatency: event.performanceMetrics?.networkLatency || 0,
      }));
  }, [session]);

  const eventTypeStats = useMemo(() => {
    if (!session) return [];

    const stats = session.events.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(stats).map(([type, count]) => ({
      type,
      count,
      percentage: (count / session.events.length) * 100,
    }));
  }, [session]);

  if (!session) return null;

  const duration =
    new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
  const durationInSeconds = Math.floor(duration / 1000);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Nagłówek */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Szczegóły sesji</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Kafelki z głównymi metrykami */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="p-4 flex items-center space-x-3">
              <User className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Użytkownik</p>
                <p className="font-semibold">{session.user.name}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center space-x-3">
              <Clock className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Czas trwania</p>
                {Math.floor(durationInSeconds / 60)},
                {String(Math.floor(durationInSeconds % 60)).padStart(2, '0')}{' '}
                min
              </div>
            </Card>

            <Card className="p-4 flex items-center space-x-3">
              <Activity className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Zdarzenia</p>
                <p className="font-semibold">{session.eventCount}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center space-x-3">
              <Monitor className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Urządzenie</p>
                <p className="font-semibold">
                  {session.events[0]?.deviceInfo?.device || 'Nieznane'}
                </p>
              </div>
            </Card>
          </div>

          {/* Wykresy i statystyki */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Wykres wydajności */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">
                Metryki wydajności w czasie
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="loadTime"
                      stroke="#8884d8"
                      name="Czas ładowania"
                    />
                    <Line
                      type="monotone"
                      dataKey="renderTime"
                      stroke="#82ca9d"
                      name="Czas renderowania"
                    />
                    <Line
                      type="monotone"
                      dataKey="networkLatency"
                      stroke="#ffc658"
                      name="Latencja"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Statystyki typów zdarzeń */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Rozkład typów zdarzeń</h3>
              <div className="space-y-4">
                {eventTypeStats.map(({ type, count, percentage }) => (
                  <div key={type}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Szczegółowa chronologia */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Chronologia zdarzeń</h3>
            <div className="space-y-2">
              {session.events.map((event, index) => (
                <Card
                  key={index}
                  className="p-4 hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="w-24 flex-shrink-0">
                      <p className="text-sm text-gray-500">
                        {format(new Date(event.timestamp), 'HH:mm:ss')}
                      </p>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            event.eventType === 'click'
                              ? 'bg-blue-500'
                              : event.eventType === 'visibility'
                                ? 'bg-green-500'
                                : 'bg-purple-500'
                          } text-white`}
                        >
                          {event.eventType}
                        </span>
                        <p className="font-medium">{event.component}</p>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {event.path} - {event.action}
                      </p>
                      {event.eventData?.metadata &&
                        Object.keys(event.eventData.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                              Szczegóły
                            </summary>
                            <div className="mt-2 pl-4 space-y-1">
                              {Object.entries(event.eventData.metadata).map(
                                ([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="text-gray-400">
                                      {key}:
                                    </span>{' '}
                                    <span className="text-gray-300">
                                      {typeof value === 'object'
                                        ? JSON.stringify(value)
                                        : String(value)}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </details>
                        )}
                    </div>
                    {event.performanceMetrics && (
                      <div className="w-48 flex-shrink-0 text-right">
                        <div className="text-xs space-y-1">
                          <p>
                            <span className="text-gray-500">Ładowanie:</span>{' '}
                            <span className="text-green-400">
                              {event.performanceMetrics.loadTime}ms
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Render:</span>{' '}
                            <span className="text-blue-400">
                              {event.performanceMetrics.renderTime}ms
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
