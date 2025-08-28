// src/components/analytics/UserActivityDashboard.tsx
import React, { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/CardAnal';
import { SessionDetailsModal } from './SessionDetailsModal';
import {
  Session,
  SessionEvent,
} from '@/components/analytics/SessionDetailsModal';
import ConversionAnalytics from './ConversionAnalytics';
import { Activity, Users, Goal, Clock } from 'lucide-react';
import SessionsAnalytics from '@/components/analytics/SessionsAnalytics';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

type MedianStats = {
  median: number;
  validSessions: number;
  rejectedSessions: number;
};

const UserActivityDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionData, setSessionData] = useState<Session[]>([]);
  const [currentTab, setCurrentTab] = useState('overview');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statystyki i metryki
  const dashboardStats = useMemo(() => {
    if (!sessionData.length)
      return {
        totalSessions: 0,
        totalUsers: 0,
        averageSessionDuration: 0,
        medianSessionDuration: 0,
        conversionRate: 0,
        validSessions: 0,
        rejectedSessions: 0,
      };

    const calculateMedianDuration = (sessions: Session[]): MedianStats => {
      const allDurations = sessions
        .filter((session) => {
          const duration =
            new Date(session.endTime).getTime() -
            new Date(session.startTime).getTime();
          return duration >= 1000; // Filtrujemy sesje krótsze niż 1 sekunda
        })
        .map((session) => {
          const duration =
            new Date(session.endTime).getTime() -
            new Date(session.startTime).getTime();
          return duration;
        });
      const validDurations = allDurations.filter(
        (duration) =>
          duration >= 10 * 1000 &&
          duration <= 4 * 60 * 60 * 1000 &&
          duration > 0
      );

      const rejectedSessions = allDurations.length - validDurations.length;

      if (validDurations.length === 0)
        return {
          median: 0,
          validSessions: 0,
          rejectedSessions: rejectedSessions,
        };

      const sortedDurations = validDurations.sort((a, b) => a - b);
      const mid = Math.floor(validDurations.length / 2);

      return {
        median:
          validDurations.length % 2 === 0
            ? (sortedDurations[mid - 1] + sortedDurations[mid]) / 2
            : sortedDurations[mid],
        validSessions: validDurations.length,
        rejectedSessions: rejectedSessions,
      };
    };

    const uniqueUsers = new Set(sessionData.map((s) => s.user.email));
    const totalDuration = sessionData.reduce((acc, session) => {
      return (
        acc +
        (new Date(session.endTime).getTime() -
          new Date(session.startTime).getTime())
      );
    }, 0);

    const conversions = sessionData.filter((session) =>
      session.events.some(
        (event) =>
          (event.eventType === 'formSubmit' &&
            event.component === 'RegisterForm') || // standardowa rejestracja
          (event.eventType === 'user_login' &&
            event.eventData?.source === 'google' &&
            event.eventData?.isNewUser === true) // rejestracja przez Google
      )
    ).length;

    const medianStats = calculateMedianDuration(sessionData);

    return {
      totalSessions: sessionData.length,
      totalUsers: uniqueUsers.size,
      averageSessionDuration: totalDuration / sessionData.length,
      medianSessionDuration: medianStats.median,
      validSessions: medianStats.validSessions,
      rejectedSessions: medianStats.rejectedSessions,
      conversionRate: (conversions / sessionData.length) * 100,
    };
  }, [sessionData]);

  // Dane do wykresów
  const chartData = useMemo(() => {
    if (!sessionData.length)
      return {
        deviceStats: [],
        userStats: [],
        conversionStats: [],
        timeStats: [],
      };

    // Statystyki urządzeń
    const devices = sessionData.reduce(
      (acc, session) => {
        const device = session.events[0]?.deviceInfo?.device || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Statystyki użytkowników
    const users = sessionData.reduce(
      (acc, session) => {
        const user = session.user?.name || 'anonymous';
        acc[user] = (acc[user] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Statystyki konwersji
    const conversions = sessionData.reduce(
      (acc, session) => {
        const hasRegistration = session.events.some(
          (event: SessionEvent) =>
            event.eventType === 'formSubmit' &&
            event.component === 'RegisterForm'
        );
        acc[hasRegistration ? 'Zarejestrowani' : 'Niezarejestrowani']++;
        return acc;
      },
      { Zarejestrowani: 0, Niezarejestrowani: 0 }
    );

    // Statystyki czasowe (aktywność w czasie)
    const timeStats = sessionData.reduce(
      (acc, session) => {
        const date = new Date(session.startTime).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      deviceStats: Object.entries(devices).map(([name, value]) => ({
        name,
        value,
      })),
      userStats: Object.entries(users).map(([name, value]) => ({
        name,
        value,
      })),
      conversionStats: Object.entries(conversions).map(([name, value]) => ({
        name,
        value,
      })),
      timeStats: Object.entries(timeStats)
        .map(([date, count]) => ({
          date,
          count,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
    };
  }, [sessionData]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/analytics/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        const filteredData = (result.data || []).filter((session: Session) => {
          const duration =
            new Date(session.endTime).getTime() -
            new Date(session.startTime).getTime();
          return duration >= 1000; // Filtrujemy sesje krótsze niż 1 sekunda
        });
        setSessionData(filteredData);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania danych:', error);
      setError('Nie udało się pobrać danych analitycznych');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium">
          Ładowanie danych analitycznych...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 font-medium">{error}</div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Analityczny</h1>
          <p className="text-gray-500 mt-1">
            Szczegółowa analiza aktywności użytkowników i konwersji
          </p>
        </div>
      </div>

      {/* Karty ze statystykami */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Wszystkie sesje</p>
              <p className="text-2xl font-bold mt-1">
                {dashboardStats.totalSessions}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unikalnych użytkowników</p>
              <p className="text-2xl font-bold mt-1">
                {dashboardStats.totalUsers}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Średni czas sesji</p>
              <p className="text-2xl font-bold mt-1">
                {Math.floor(dashboardStats.averageSessionDuration / 1000 / 60)},
                {String(
                  Math.floor(
                    (dashboardStats.averageSessionDuration / 1000) % 60
                  )
                ).padStart(2, '0')}{' '}
                min
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        {/* Media czasu sesji */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mediana czasu sesji</p>
              <p className="text-2xl font-bold mt-1">
                {Math.floor(dashboardStats.medianSessionDuration / 1000 / 60)},
                {String(
                  Math.floor((dashboardStats.medianSessionDuration / 1000) % 60)
                ).padStart(2, '0')}{' '}
                min
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        {/* Statystyki źródeł ruchu */}
        <Card className="p-4 mb-4">
          <h3 className="text-lg font-semibold mb-4">
            Źródła ruchu (wszystkie sesje)
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {(() => {
              const sources = sessionData.reduce(
                (acc, session) => {
                  let source = 'direct';
                  const sessionStartEvent = session.events.find(
                    (e) => e.eventType === 'pageView'
                  );
                  const referrer = sessionStartEvent?.eventData?.source;

                  if (referrer) {
                    if (referrer === 'direct') {
                      source = 'direct';
                    } else if (
                      referrer === 'organic' ||
                      referrer.includes('google.') ||
                      referrer.includes('bing.')
                    ) {
                      source = 'organic';
                    } else if (
                      referrer === 'social' ||
                      referrer.includes('facebook.') ||
                      referrer.includes('instagram.')
                    ) {
                      source = 'social';
                    } else if (
                      referrer === 'paid' ||
                      referrer.includes('utm_medium=cpc')
                    ) {
                      source = 'paid';
                    } else {
                      source = 'referral';
                    }
                  }

                  acc[source] = (acc[source] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>
              );

              const total = Object.values(sources).reduce((a, b) => a + b, 0);

              return Object.entries(sources)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => (
                  <div
                    key={source}
                    className="flex justify-between items-center bg-gray-900 p-2 rounded"
                  >
                    <span className="text-xs capitalize">
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
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium">
                        {((count / total) * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">({count})</span>
                    </div>
                  </div>
                ));
            })()}
          </div>
        </Card>
        {/* Box ze statystykami odrzuconych sesji */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Jakość sesji</p>
              <p className="text-2xl font-bold mt-1">
                {dashboardStats.validSessions} prawidłowych
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {dashboardStats.rejectedSessions} sesji odfiltrowanych z analizy
            <span className="ml-1 text-gray-500">
              (
              {(
                (dashboardStats.rejectedSessions /
                  dashboardStats.totalSessions) *
                100
              ).toFixed(1)}
              %)
            </span>
          </p>
        </Card>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="w-4 h-4 mr-2" />
            Przegląd
          </TabsTrigger>
          <TabsTrigger value="conversions">
            <Goal className="w-4 h-4 mr-2" />
            Analiza konwersji
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rozkład urządzeń */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Rozkład urządzeń</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData.deviceStats}
                      dataKey="value"
                      nameKey="name"
                      label={{
                        fill: theme === 'dark' ? '#fff' : '#000',
                        fontSize: 12,
                      }}
                    >
                      {chartData.deviceStats.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Aktywność użytkowników */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                Aktywność użytkowników
              </h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={chartData.userStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Liczba sesji" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Statystyki konwersji */}

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                Wykres źródeł ruchu
              </h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const sourcesData = sessionData.reduce(
                          (acc, session) => {
                            let source = 'direct';
                            const sessionStartEvent = session.events.find(
                              (e) => e.eventType === 'pageView'
                            );
                            const referrer =
                              sessionStartEvent?.eventData?.source;

                            if (referrer) {
                              if (referrer === 'direct') {
                                source = 'direct';
                              } else if (
                                referrer === 'organic' ||
                                referrer.includes('google.') ||
                                referrer.includes('bing.')
                              ) {
                                source = 'organic';
                              } else if (
                                referrer === 'social' ||
                                referrer.includes('facebook.') ||
                                referrer.includes('instagram.')
                              ) {
                                source = 'social';
                              } else if (
                                referrer === 'paid' ||
                                referrer.includes('utm_medium=cpc')
                              ) {
                                source = 'paid';
                              } else {
                                source = 'referral';
                              }
                            }
                            acc[source] = (acc[source] || 0) + 1;
                            return acc;
                          },
                          {} as Record<string, number>
                        );

                        return Object.entries(sourcesData).map(
                          ([source, value]) => ({
                            name:
                              source === 'organic'
                                ? 'Wyszukiwarka'
                                : source === 'direct'
                                  ? 'Ruch bezpośredni'
                                  : source === 'referral'
                                    ? 'Strony odsyłające'
                                    : source === 'social'
                                      ? 'Media społecznościowe'
                                      : source === 'paid'
                                        ? 'Google Ads'
                                        : source,
                            value,
                          })
                        );
                      })()}
                      dataKey="value"
                      nameKey="name"
                      label={{
                        fill: theme === 'dark' ? '#fff' : '#000',
                        fontSize: 12,
                      }}
                    >
                      {sessionData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Tabela sesji */}
          <SessionsAnalytics />
        </TabsContent>

        <TabsContent value="conversions">
          <ConversionAnalytics />
        </TabsContent>
      </Tabs>

      {/* Modal szczegółów sesji */}
      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

export default UserActivityDashboard;
