// src/components/analytics/tables/SessionsTable.tsx
import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/CardAnal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/ButtonAnal';
import { Session } from '@/components/analytics/SessionDetailsModal';

interface Props {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  groupBy: string;
  onGroupByChange: (group: string) => void;
  currentPage: number; // Dodane
  onPageChange: (page: number) => void; // Dodane
}

const SessionsTable: React.FC<Props> = ({
  sessions,
  onSessionClick,
  pageSize,
  onPageSizeChange,
  searchTerm,
  onSearchChange,
  groupBy,
  onGroupByChange,
}) => {
  // Sortowanie sesji od najnowszej
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            options={[
              { value: 10, label: '10 wpisów' },
              { value: 25, label: '25 wpisów' },
              { value: 50, label: '50 wpisów' },
              { value: 100, label: '100 wpisów' },
            ]}
          />
          <Select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value)}
            options={[
              { value: 'none', label: 'Bez grupowania' },
              { value: 'user', label: 'Według użytkownika' },
              { value: 'date', label: 'Według daty' },
            ]}
          />
        </div>
        {/*<Input
          type="search"
          placeholder="Szukaj sesji..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />*/}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Użytkownik</th>
              <th className="px-4 py-2">Data rozpoczęcia</th>
              <th className="px-4 py-2">Czas trwania</th>
              <th className="px-4 py-2">Zdarzenia</th>
              <th className="px-4 py-2">Szczegóły</th>
            </tr>
          </thead>
          <tbody>
            {sortedSessions.map((session) => (
              <tr
                key={session._id}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => onSessionClick(session)}
              >
                <td className="px-4 py-2">
                  <div>
                    <div className="font-medium">
                      {session.user?.name || 'Nieznany'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.user?.email}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">
                  {format(new Date(session.startTime), 'dd.MM.yyyy HH:mm:ss')}
                </td>
                <td className="px-4 py-2">
                  {Math.round(
                    (new Date(session.endTime).getTime() -
                      new Date(session.startTime).getTime()) /
                      1000
                  )}
                  s
                </td>
                <td className="px-4 py-2">{session.eventCount}</td>
                <td className="px-4 py-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSessionClick(session);
                    }}
                  >
                    Szczegóły
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SessionsTable;
