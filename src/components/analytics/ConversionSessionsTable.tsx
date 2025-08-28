// src/components/analytics/ConversionSessionsTable.tsx
import React, { useState } from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Card } from '@/components/ui/CardAnal';
import { SessionDetailsModal } from './SessionDetailsModal';
import type { Session, SessionEvent } from './SessionDetailsModal';

interface ConversionSession {
  sessionId: string;
  userId: string;
  conversionType: 'standard' | 'google' | 'top_up' | 'order_payment';
  conversionSubtype: string;
  conversionValue: number;
  timestamp: string;
  startTime: string;
  endTime: string;
  timeToConversion: number;
  source: string;
  path: string;
  user: {
    name: string;
    email: string;
  };
  eventCount: number;
  events: SessionEvent[];
  deviceInfo?: {
    browser: string;
    os: string;
    device: string;
  };
}

const ConversionSessionsTable: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const { data, loading } = useAnalyticsData('conversion-sessions');

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  {
    /*const handleSessionClick = (session: ConversionSession) => {
    const sessionForModal: Session = {
      _id: session.sessionId,
      userId: session.userId,
      user: session.user,
      startTime: session.startTime,
      endTime: session.endTime,
      eventCount: session.eventCount,
      events: session.events,
    };
    setSelectedSession(sessionForModal);
  };*/
  }

  if (!data?.sessions || data.sessions.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Sesje z konwersją</h2>
        <p>Brak sesji z konwersją w wybranym okresie.</p>
      </Card>
    );
  }

  type ConversionType = 'standard' | 'google' | 'top_up' | 'order_payment';

  const getConversionLabel = (type: ConversionType) => {
    switch (type) {
      case 'google':
        return 'Rejestracja Google';
      case 'standard':
        return 'Standardowa rejestracja';
      case 'top_up':
        return 'Doładowanie';
      case 'order_payment':
        return 'Zamówienie';
      default:
        return 'Nieznana';
    }
  };

  const getConversionBadgeColor = (type: ConversionType) => {
    switch (type) {
      case 'google':
        return 'bg-blue-500';
      case 'standard':
        return 'bg-green-500';
      case 'top_up':
        return 'bg-purple-500';
      case 'order_payment':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Sesje z konwersją ({data.total})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Użytkownik</th>
                <th className="px-4 py-2 text-left">Czas do konwersji</th>
                <th className="px-4 py-2 text-left">Urządzenie</th>
                <th className="px-4 py-2 text-left">Źródło</th>
                <th className="px-4 py-2 text-left">Typ</th> {/* Przesunięte */}
                <th className="px-4 py-2 text-left">Ścieżka konwersji</th>
                <th className="px-4 py-2 text-left">Wydarzenia</th>
              </tr>
            </thead>
            <tbody>
              {data.sessions.map((session) => (
                <tr
                  key={session.sessionId}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  //onClick={() => handleSessionClick(session)}
                >
                  <td className="px-4 py-2">
                    {new Date(session.startTime).toLocaleString('pl-PL')}
                  </td>
                  <td className="px-4 py-2">
                    {session.user?.name || 'Anonimowy'}
                  </td>
                  <td className="px-4 py-2">
                    {formatTime(session.timeToConversion)}
                  </td>
                  <td className="px-4 py-2">
                    {session.deviceInfo?.device || 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    {session.source || 'Bezpośrednie'}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ${getConversionBadgeColor(session.conversionType)}`}
                    >
                      {getConversionLabel(session.conversionType)}
                    </span>
                  </td>
                  <td className="px-4 py-2">{session.path}</td>
                  <td className="px-4 py-2">{session.eventCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
};

export default ConversionSessionsTable;
