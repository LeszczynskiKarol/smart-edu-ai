// src/components/analytics/RegistrationAnalytics.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';

interface RegistrationSourcesAnalyticsProps {
  data: {
    summary: {
      totalRegistrations: number;
      sourcesBreakdown: Array<{
        source: string;
        percentage: string;
        total: number;
      }>;
      topPerformingSource: string;
      registrationsByMethod: {
        standard: number;
        google: number;
      };
    };
    sourceAnalytics: Array<{
      _id: string;
      registrationTypes: Array<{
        type: string;
        total: number;
        conversionRate: number;
        avgTimeToRegister: number;
      }>;
      totalRegistrations: number;
      devices: string[];
      browsers: string[];
      paths: string[];
      hourlyStats: number[];
    }>;
  };
}

const sourceColors: Record<string, string> = {
  organic: '#4CAF50',
  direct: '#2196F3',
  referral: '#FF9800',
  social: '#E91E63',
  paid: '#9C27B0',
  unknown: '#999999',
};

const getSourceColor = (sourceName: string): string => {
  const key = sourceName.toLowerCase();
  return sourceColors[key] || sourceColors.unknown;
};

const RegistrationSourcesAnalytics: React.FC<
  RegistrationSourcesAnalyticsProps
> = ({ data }) => {
  console.log('Dane otrzymane przez komponent:', data);

  // Przygotowanie danych dla wykresów
  const pieChartData = data.summary.sourcesBreakdown.map((item) => ({
    name: item.source,
    value: item.total,
    percentage: parseFloat(item.percentage),
  }));

  const barChartData = [
    { name: 'Standard', value: data.summary.registrationsByMethod.standard },
    { name: 'Google', value: data.summary.registrationsByMethod.google },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Źródła Rejestracji</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wykres źródeł rejestracji */}
          <div className="h-96">
            <h3 className="text-lg font-semibold mb-2">Rozkład źródeł</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percentage }) =>
                    `${name} (${percentage.toFixed(1)}%)`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getSourceColor(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Wykres metod rejestracji */}
          <div className="h-96">
            <h3 className="text-lg font-semibold mb-2">Metody Rejestracji</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6">
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#3B82F6' : '#F59E0B'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-600">
              Całkowite Rejestracje
            </h4>
            <p className="text-2xl font-bold">
              {data.summary.totalRegistrations}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="text-sm font-medium text-green-600">Standard</h4>
            <p className="text-2xl font-bold">
              {data.summary.registrationsByMethod.standard}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-600">Google</h4>
            <p className="text-2xl font-bold">
              {data.summary.registrationsByMethod.google}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="text-sm font-medium text-purple-600">
              Najlepsze Źródło
            </h4>
            <p className="text-2xl font-bold">
              {data.summary.topPerformingSource}
            </p>
          </div>
        </div>

        {/* Szczegółowa analiza źródeł */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {data.sourceAnalytics.map((source) => (
            <Card key={source._id} className="p-4">
              <h3 className="text-lg font-bold mb-2">{source._id}</h3>

              <div className="h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={source.hourlyStats.map((value, hour) => ({
                      hour: `${hour}:00`,
                      value,
                    }))}
                  >
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill={getSourceColor(source._id)}
                      name="Liczba rejestracji"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <h4 className="font-semibold">Urządzenia</h4>
                  <ul className="list-disc list-inside">
                    {source.devices.map((device) => (
                      <li key={device}>{device}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Przeglądarki</h4>
                  <ul className="list-disc list-inside">
                    {source.browsers.map((browser) => (
                      <li key={browser}>{browser}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RegistrationSourcesAnalytics;
