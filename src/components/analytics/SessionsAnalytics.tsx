// src/components/analytics/SessionsAnalytics.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import { SessionData, useAnalyticsData } from '@/hooks/useAnalyticsData';
import { DataGrid } from '@/components/ui/DataGrid';
import { Card } from '@/components/ui/CardAnal';
import { Button } from '@/components/ui/ButtonAnal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Session, SessionDetailsModal } from './SessionDetailsModal';

const mapReferrerSource = (session: SessionData): string => {
  const conversionEvent = session.events.find(
    (event) =>
      event.eventType.includes('conversion_registration') ||
      event.eventType.includes('user_login')
  );

  if (conversionEvent) {
    const source = conversionEvent.eventData.source;
    if (source) return source;
  }

  // Jeśli nie znaleźliśmy w evencie konwersji, sprawdzamy pierwszy event
  const firstEvent = session.events[0];
  if (firstEvent?.eventData.source) {
    return firstEvent.eventData.source;
  }

  return 'unknown'; // Ostateczność
};

const SessionsAnalytics: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [userFilter, setUserFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sortModel, setSortModel] = useState<{
    field: string;
    direction: 'asc' | 'desc';
  }>({
    field: 'startTime',
    direction: 'desc',
  });
  const handleViewDetails = (session: Session) => {
    setSelectedSession(session);
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
  };

  const {
    data: rawResponse,
    loading,
    error,
  } = useAnalyticsData(
    `sessions?page=${page}&pageSize=${pageSize}&startDate=${dateRange.start?.toISOString()}&endDate=${dateRange.end?.toISOString()}&userFilter=${userFilter}&sortField=${sortModel.field}&sortDirection=${sortModel.direction}`
  );

  const data = rawResponse
    ? {
        sessions: (rawResponse as SessionData[])
          .filter((session) => {
            const duration =
              new Date(session.endTime).getTime() -
              new Date(session.startTime).getTime();
            return duration >= 1000; // Filtrujemy sesje krótsze niż 1 sekunda
          })
          .map((session) => {
            const source = mapReferrerSource(session);

            return {
              _id: session._id,
              userId: session.userId,
              user: session.user || {
                name: 'Nieznany',
                email: 'Nieznany',
              },
              startTime: session.startTime,
              endTime: session.endTime,
              eventCount: session.eventCount,
              events: session.events || [],
              sourceDetails: {
                source,
                referrer: session.sessionData?.referrer || '',
                firstReferrer: session.sessionData?.firstReferrer || '',
                utmSource:
                  session.sessionData?.referrerData?.utmParams?.source || '',
                utmMedium:
                  session.sessionData?.referrerData?.utmParams?.medium || '',
                utmCampaign:
                  session.sessionData?.referrerData?.utmParams?.campaign || '',
              },
              sessionData: session.sessionData || {},
            };
          }),
        total: rawResponse.length,
      }
    : null;

  if (loading) {
    return <div>Loading sessions data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const columns = [
    {
      field: 'user',
      headerName: 'Użytkownik',
      width: 200,
      sortable: false,
      renderCell: (params: { row: Session }) => (
        <div>
          <div className="font-medium">{params.row.user.name}</div>
          <div className="text-sm text-gray-500">{params.row.user.email}</div>
        </div>
      ),
    },
    {
      field: 'startTime',
      headerName: 'Rozpoczęcie',
      width: 180,
      sortable: true,
      renderCell: (params: { row: Session }) =>
        format(new Date(params.row.startTime), 'dd/MM/yyyy HH:mm:ss'),
    },
    {
      field: 'duration',
      headerName: 'Czas trwania',
      width: 150,
      sortable: true,
      renderCell: (params: { row: Session }) => {
        const start = new Date(params.row.startTime).getTime();
        const end = new Date(params.row.endTime).getTime();
        const duration = (end - start) / 1000;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes},${String(seconds).padStart(2, '0')} min`;
      },
    },
    {
      field: 'eventCount',
      headerName: 'Liczba zdarzeń',
      width: 150,
      sortable: true,
      renderCell: (params: { row: Session }) => params.row.eventCount,
    },
    {
      field: 'actions',
      headerName: 'Akcje',
      width: 150,
      renderCell: (params: { row: Session }) => (
        <Button onClick={() => handleViewDetails(params.row)}>Szczegóły</Button>
      ),
    },
    {
      field: 'source',
      headerName: 'Źródło',
      width: 150,
      renderCell: (params: { row: Session }) => {
        const source = mapReferrerSource(params.row); // Używamy zaktualizowanej funkcji mapowania
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {source === 'organic'
                ? 'Wyszukiwarka'
                : source === 'direct'
                  ? 'Ruch bezpośredni'
                  : source === 'referral'
                    ? 'Strony odsyłające'
                    : source === 'social'
                      ? 'Media społecznościowe'
                      : source === 'paid'
                        ? 'Google Ads'
                        : source}
            </span>
            {params.row.sourceDetails.utmSource && (
              <span className="text-xs text-gray-500">
                {params.row.sourceDetails.utmSource}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Wybierz zakres dat"
            />
            <Input
              placeholder="Filtruj po użytkowniku"
              value={userFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUserFilter(e.target.value)
              }
            />
            <Select
              value={pageSize}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setPageSize(Number(e.target.value))
              }
              options={[
                { label: '10 na stronę', value: 10 },
                { label: '25 na stronę', value: 25 },
                { label: '50 na stronę', value: 50 },
              ]}
            />
          </div>

          <DataGrid<Session>
            rows={data?.sessions || []}
            columns={columns}
            pageSize={pageSize}
            loading={loading}
            error={error}
            onPageChange={setPage}
            rowCount={data?.total || 0}
            pagination
            sortModel={sortModel}
            onSortModelChange={(model) => {
              setSortModel(model);
              setPage(1); // Reset page when sorting changes
            }}
          />
        </Card>
      </div>
      <SessionDetailsModal
        session={selectedSession}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default SessionsAnalytics;
