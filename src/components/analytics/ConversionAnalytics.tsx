// src/components/analytics/ConversionAnalytics.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/CardAnal';
import ConversionSessionsTable from './ConversionSessionsTable';
import { formatCurrency } from '../../hooks/useExchangeRate';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Session } from '@/components/analytics/SessionDetailsModal';

interface DeviceCounts {
  [key: string]: number;
}

const formatSourceName = (source: string): string => {
  switch (source?.toLowerCase()) {
    case 'organic':
      return 'Wyszukiwarka';
    case 'direct':
      return 'Ruch bezpośredni';
    case 'referral':
      return 'Strony odsyłające';
    case 'social':
      return 'Media społecznościowe';
    case 'paid':
      return 'Google Ads';
    case 'google':
      return 'Rejestracja Google';
    case 'stripe':
      return 'Płatność Stripe';
    default:
      return source || 'Nieznane';
  }
};

const ConversionAnalytics: React.FC = () => {
  const { data } = useAnalyticsData('conversion-analytics');
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const totalSessions = sessionData.length;
  const totalPayments =
    (data?.payments?.summary?.order?.total || 0) +
    (data?.payments?.summary?.topUp?.total || 0);

  const totalRegistrations =
    (data?.registrations?.summary?.standard?.total || 0) +
    (data?.registrations?.summary?.google?.total || 0);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/analytics/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setSessionData(result.data || []);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Ładowanie danych analitycznych...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Rejestracje */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Rejestracje</h3>
          <div className="space-y-6">
            {/* Ogólne statystyki */}
            <div className="border-b pb-4">
              <p className="text-sm font-medium mb-2">Statystyki ogólne</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Wszystkie rejestracje</p>
                  <p className="text-lg font-bold">
                    {(
                      (data?.registrations?.summary?.standard?.total || 0) +
                      (data?.registrations?.summary?.google?.total || 0)
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    Ogólny współczynnik konwersji
                  </p>
                  <p className="text-lg font-bold">
                    {((totalRegistrations / totalSessions) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalRegistrations} rejestracji na {totalSessions} sesjach
                  </p>
                </div>
              </div>
              {/* Zagregowane źródła ruchu */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">
                  Wszystkie źródła ruchu
                </p>
                <div className="space-y-2">
                  {(() => {
                    // Najpierw zbieramy dane z referrerDetails, bo tam są prawidłowe źródła
                    const sourceDetails =
                      data?.registrations?.referrerDetails || [];
                    const allSources = new Map();

                    sourceDetails.forEach((detail) => {
                      const count = detail.count || 0;
                      allSources.set(
                        detail.source,
                        (allSources.get(detail.source) || 0) + count
                      );
                    });

                    const totalSources = Array.from(allSources.values()).reduce(
                      (a, b) => a + b,
                      0
                    );

                    return Array.from(allSources.entries())
                      .sort(([, a], [, b]) => b - a)
                      .map(([source, count]) => (
                        <div
                          key={source}
                          className="flex justify-between items-center bg-gray-900 p-2 rounded"
                        >
                          <span className="text-xs capitalize">
                            {formatSourceName(source)}
                          </span>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-medium">
                              {((count / totalSources) * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500">
                              ({count})
                            </span>
                          </div>
                        </div>
                      ));
                  })()}
                </div>
                {/* Szczegóły stron odsyłających */}
                {data?.registrations?.referrerDetails &&
                  data?.registrations?.referrerDetails.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">
                        Szczegóły stron odsyłających
                      </p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-900">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                Strona odsyłająca
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                Strona docelowa
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                Źródło
                              </th>

                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                                Rejestracje
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-black divide-y divide-gray-200">
                            {data.registrations.referrerDetails.map(
                              (referrer, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-2 text-xs whitespace-normal break-all">
                                    {referrer.url || '-'}
                                  </td>
                                  <td className="px-3 py-2 text-xs whitespace-normal">
                                    {referrer.landingPage || '-'}
                                  </td>
                                  <td className="px-3 py-2 text-xs whitespace-normal">
                                    {referrer.source || '-'}
                                  </td>

                                  <td className="px-3 py-2 text-xs text-right font-medium">
                                    {referrer.count}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Rejestracje standardowe */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">
                  Rejestracja standardowa
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Liczba rejestracji</p>
                    <p className="text-lg font-bold">
                      {data?.registrations?.summary?.standard?.total?.toLocaleString() ||
                        '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Rejestracje Google */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Rejestracja Google</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Liczba rejestracji</p>
                    <p className="text-lg font-bold">
                      {data?.registrations?.summary?.google?.total?.toLocaleString() ||
                        '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Procent całości</p>
                    <p className="text-lg font-bold">
                      {(
                        ((data?.registrations?.summary?.google?.total || 0) /
                          ((data?.registrations?.summary?.standard?.total ||
                            0) +
                            (data?.registrations?.summary?.google?.total ||
                              0))) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Płatności */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Płatności</h3>
          {/* Zbiorcze statystyki */}

          <div className="border-b pb-4 mb-6">
            <p className="text-sm font-medium mb-4">Statystyki ogólne</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">
                  Wszystkie płatności łącznie
                </p>
                <p className="text-lg font-bold">
                  {(
                    (data?.payments?.summary?.order?.total || 0) +
                    (data?.payments?.summary?.topUp?.total || 0)
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  Współczynnik płatności na sesję
                </p>
                <p className="text-lg font-bold">
                  {((totalPayments / totalSessions) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalPayments} płatności na {totalSessions} sesjach
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Suma wszystkich wpłat</p>
                <p className="text-lg font-bold">
                  {formatCurrency(
                    (data?.payments?.summary?.order?.totalAmount || 0) +
                      (data?.payments?.summary?.topUp?.totalAmount || 0),
                    'PLN'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  Średnia wartość płatności
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(
                    ((data?.payments?.summary?.order?.totalAmount || 0) +
                      (data?.payments?.summary?.topUp?.totalAmount || 0)) /
                      ((data?.payments?.summary?.order?.total || 0) +
                        (data?.payments?.summary?.topUp?.total || 0)) || 0,
                    'PLN'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Zbiorcze źródła płatności */}
          <div className="border-b pb-4">
            <p className="text-sm font-medium mb-2">
              Zbiorcze źródła płatności
            </p>
            <div className="grid grid-cols-1 gap-2">
              {(() => {
                const orderDetails =
                  data?.payments?.summary?.order?.distribution
                    ?.referrerDetails || [];
                const topUpDetails =
                  data?.payments?.summary?.topUp?.distribution
                    ?.referrerDetails || [];

                // Łączymy szczegóły z obu typów płatności
                const allReferrerDetails = [...orderDetails, ...topUpDetails];

                // Grupujemy po źródle
                const sourceCounts = allReferrerDetails.reduce(
                  (acc, detail) => {
                    const source = detail.source || 'unknown';
                    if (!acc[source]) {
                      acc[source] = {
                        count: 0,
                        amount: 0,
                      };
                    }
                    acc[source].count++;
                    acc[source].amount += detail.amount || 0;
                    return acc;
                  },
                  {} as Record<string, { count: number; amount: number }>
                );

                const total = allReferrerDetails.length;

                return Object.entries(sourceCounts)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([source, stats]) => (
                    <div
                      key={source}
                      className="flex justify-between items-center bg-gray-900 p-2 rounded"
                    >
                      <span className="text-xs capitalize">
                        {formatSourceName(source)}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium">
                          {((stats.count / total) * 100).toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          ({stats.count}) -{' '}
                          {formatCurrency(stats.amount, 'PLN')}
                        </span>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </div>

          {/* Płatności za zamówienia */}
          <div className="border-b pb-4">
            <p className="text-sm font-medium mb-2">Płatności za zamówienia</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Wszystkie płatności</p>
                <p className="text-lg font-bold">
                  {data?.payments?.summary?.order?.total?.toLocaleString() ||
                    '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Średnia wartość</p>
                <p className="text-lg font-bold">
                  {formatCurrency(
                    data?.payments?.summary?.order?.metrics?.avgOrderValue || 0,
                    'PLN'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Metody płatności dla zamówień */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Metody płatności</p>
              <div className="grid grid-cols-1 gap-2">
                {data?.payments?.summary?.order?.distribution?.paymentMethods.map(
                  (method, index, arr) => {
                    const count = arr.filter((m) => m === method).length;
                    const total = arr.length;
                    return (
                      <div
                        key={method}
                        className="flex justify-between items-center bg-gray-900 p-2 rounded"
                      >
                        <span className="text-xs capitalize">
                          {method === 'card'
                            ? 'Karta płatnicza'
                            : method === 'blik'
                              ? 'BLIK'
                              : method === 'p24'
                                ? 'Przelewy24'
                                : method}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-medium">
                            {((count / total) * 100).toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500">
                            ({count})
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Źródła płatności dla zamówień */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Źródła płatności</p>
            <div className="grid grid-cols-1 gap-2">
              {(() => {
                const referrerDetails =
                  data?.payments?.summary?.order?.distribution
                    ?.referrerDetails || [];
                const sourceCounts = referrerDetails.reduce(
                  (acc, detail) => {
                    acc[detail.source] = (acc[detail.source] || 0) + 1;
                    return acc;
                  },
                  {} as Record<string, number>
                );

                const total = referrerDetails.length;

                return Object.entries(sourceCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => (
                    <div
                      key={source}
                      className="flex justify-between items-center bg-gray-900 p-2 rounded"
                    >
                      <span className="text-xs capitalize">
                        {formatSourceName(source)}
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
          </div>

          {/* Szczegóły źródeł płatności dla zamówień */}
          {data?.payments?.summary?.order?.distribution?.referrerDetails &&
            data?.payments?.summary?.order?.distribution?.referrerDetails
              .length > 0 && (
              <div className="border-t mt-4 pt-4">
                <p className="text-sm font-medium mb-2">
                  Szczegóły źródeł płatności
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-900">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Strona odsyłająca
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Strona docelowa
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Źródło
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                          Kwota
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-200">
                      {data?.payments?.summary?.order?.distribution?.referrerDetails?.map(
                        (
                          referrer: {
                            url: string;
                            landingPage: string;
                            source: string;
                            amount: number;
                          },
                          idx: number
                        ) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 text-xs whitespace-normal break-all">
                              {referrer.url || '-'}
                            </td>
                            <td className="px-3 py-2 text-xs whitespace-normal">
                              {referrer.landingPage || '-'}
                            </td>
                            <td className="px-3 py-2 text-xs whitespace-normal">
                              {referrer.source || '-'}
                            </td>
                            <td className="px-3 py-2 text-xs text-right font-medium">
                              {formatCurrency(referrer.amount || 0, 'PLN')}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Urządzenia dla zamówień */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Urządzenia</p>
            <div className="grid grid-cols-1 gap-2">
              {(() => {
                const devices =
                  data?.payments?.summary?.order?.distribution?.devices || [];
                const deviceCounts = devices.reduce(
                  (acc: DeviceCounts, device: string) => {
                    acc[device] = (acc[device] || 0) + 1;
                    return acc;
                  },
                  {} as DeviceCounts
                );
                const total = devices.length;

                return Object.entries(deviceCounts).map(([device, count]) => (
                  <div
                    key={device}
                    className="flex justify-between items-center bg-gray-900 p-2 rounded"
                  >
                    <span className="text-xs capitalize">
                      {device === 'desktop'
                        ? 'Komputer'
                        : device === 'mobile'
                          ? 'Telefon'
                          : device === 'tablet'
                            ? 'Tablet'
                            : device === 'other'
                              ? 'Inne'
                              : device}
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
          </div>

          {/* Godziny płatności dla zamówień */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Godziny płatności</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    data?.payments?.summary?.order?.distribution?.peakHours ||
                    []
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [value, 'Ilość płatności']}
                    labelFormatter={(hour) => `${hour}:00`}
                  />
                  <Bar dataKey="count" fill="#82ca9d" name="Płatności" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            {/* Ogólne statystyki płatności */}
            <div className="border-b pb-4">
              <p className="text-sm font-medium mb-2">Doładowania top-up</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Wszystkie doładowania</p>
                  <p className="text-lg font-bold">
                    {data?.payments?.summary?.topUp?.total?.toLocaleString() ||
                      '0'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Średnia wartość</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      data?.payments?.summary?.topUp?.metrics?.avgOrderValue ||
                        0,
                      'PLN'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Źródła płatności */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Metody płatności</p>
                <div className="grid grid-cols-1 gap-2">
                  {data?.payments?.summary?.topUp?.distribution?.paymentMethods.map(
                    (method, index, arr) => {
                      const count = arr.filter((m) => m === method).length;
                      const total = arr.length;
                      return (
                        <div
                          key={method}
                          className="flex justify-between items-center bg-gray-900 p-2 rounded"
                        >
                          <span className="text-xs capitalize">
                            {method === 'card'
                              ? 'Karta płatnicza'
                              : method === 'blik'
                                ? 'BLIK'
                                : method === 'p24'
                                  ? 'Przelewy24'
                                  : method}
                          </span>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-medium">
                              {((count / total) * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500">
                              ({count})
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Źródła płatności */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Źródła płatności</p>
              <div className="grid grid-cols-1 gap-2">
                {(() => {
                  const referrerDetails =
                    data?.payments?.summary?.topUp?.distribution
                      ?.referrerDetails || [];
                  const sourceCounts = referrerDetails.reduce(
                    (acc, detail) => {
                      const source = detail.source || 'unknown';
                      acc[source] = (acc[source] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>
                  );

                  const total = referrerDetails.length;

                  return Object.entries(sourceCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([source, count]) => (
                      <div
                        key={source}
                        className="flex justify-between items-center bg-gray-900 p-2 rounded"
                      >
                        <span className="text-xs capitalize">
                          {formatSourceName(source)}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-medium">
                            {((count / total) * 100).toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500">
                            ({count})
                          </span>
                        </div>
                      </div>
                    ));
                })()}
              </div>
              {data?.payments?.summary?.topUp?.distribution?.referrerDetails &&
                data?.payments?.summary?.topUp?.distribution?.referrerDetails
                  .length > 0 && (
                  <div className="border-t mt-4 pt-4">
                    <p className="text-sm font-medium mb-2">
                      Szczegóły źródeł płatności
                    </p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-900">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Strona odsyłająca
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Strona docelowa
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Źródło
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                              Kwota
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-black divide-y divide-gray-200">
                          {data?.payments?.summary?.topUp?.distribution?.referrerDetails?.map(
                            (
                              referrer: {
                                url: string;
                                landingPage: string;
                                source: string;
                                amount: number;
                              },
                              idx: number
                            ) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 text-xs whitespace-normal break-all">
                                  {referrer.url || '-'}
                                </td>
                                <td className="px-3 py-2 text-xs whitespace-normal">
                                  {referrer.landingPage || '-'}
                                </td>
                                <td className="px-3 py-2 text-xs whitespace-normal">
                                  {referrer.source || '-'}
                                </td>
                                <td className="px-3 py-2 text-xs text-right font-medium">
                                  {formatCurrency(referrer.amount || 0, 'PLN')}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>

            {/* Urządzenia */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Urządzenia</p>
              <div className="grid grid-cols-1 gap-2">
                {(() => {
                  const devices: string[] =
                    data?.payments?.summary?.topUp?.distribution?.devices || [];

                  interface DeviceCounts {
                    [key: string]: number;
                  }

                  const deviceCounts: DeviceCounts = devices.reduce(
                    (acc: DeviceCounts, device: string) => {
                      acc[device] = (acc[device] || 0) + 1;
                      return acc;
                    },
                    {}
                  );

                  const total = devices.length;

                  return Object.entries(deviceCounts).map(
                    ([device, count]: [string, number]) => (
                      <div
                        key={device}
                        className="flex justify-between items-center bg-gray-900 p-2 rounded"
                      >
                        <span className="text-xs capitalize">
                          {device === 'desktop'
                            ? 'Komputer'
                            : device === 'mobile'
                              ? 'Telefon'
                              : device === 'tablet'
                                ? 'Tablet'
                                : device === 'other'
                                  ? 'Inne'
                                  : device}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-medium">
                            {((count / total) * 100).toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500">
                            ({count})
                          </span>
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>
            </div>

            {/* Godziny doładowań */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Godziny doładowań</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      data?.payments?.summary?.topUp?.distribution?.peakHours ||
                      []
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [value, 'Ilość doładowań']}
                      labelFormatter={(hour) => `${hour}:00`}
                    />
                    <Bar dataKey="count" fill="#82ca9d" name="Doładowania" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <ConversionSessionsTable />
      </div>
    </div>
  );
};

export default ConversionAnalytics;
