// src/components/analytics/metrics/PerformanceMetrics.tsx
import React from 'react';

interface PerformanceMetric {
  sum: number;
  count: number;
}

interface PerformanceMetrics {
  loadTime: PerformanceMetric;
  renderTime: PerformanceMetric;
  networkLatency: PerformanceMetric;
  firstPaint: PerformanceMetric;
  firstContentfulPaint: PerformanceMetric;
}

const PerformanceMetrics: React.FC<{
  data: Array<{ performanceMetrics?: Record<string, number> }>;
}> = ({ data }) => {
  const averages = data.reduce<PerformanceMetrics>(
    (acc, curr) => {
      if (curr.performanceMetrics) {
        Object.entries(curr.performanceMetrics).forEach(([key, value]) => {
          // Sprawdź czy klucz istnieje w akumulatorze i czy wartość jest poprawna
          if (key in acc && typeof value === 'number' && !isNaN(value)) {
            acc[key as keyof PerformanceMetrics].sum += value;
            acc[key as keyof PerformanceMetrics].count++;
          }
        });
      }
      return acc;
    },
    {
      loadTime: { sum: 0, count: 0 },
      renderTime: { sum: 0, count: 0 },
      networkLatency: { sum: 0, count: 0 },
      firstPaint: { sum: 0, count: 0 },
      firstContentfulPaint: { sum: 0, count: 0 },
    }
  );

  const formatMetricValue = (value: number) => {
    if (value < 1000) {
      return `${value.toFixed(2)}ms`;
    }
    return `${(value / 1000).toFixed(2)}s`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Object.entries(averages).map(([key, metric]) => (
        <div
          key={key}
          className="p-4 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600"
        >
          <h4 className="text-white text-sm font-medium">
            {key.replace(/([A-Z])/g, ' $1').trim()}{' '}
            {/* Dodaje spacje przed wielkimi literami */}
          </h4>
          <p className="text-white text-2xl font-bold">
            {metric.count > 0
              ? formatMetricValue(metric.sum / metric.count)
              : 'N/A'}
          </p>
          <p className="text-white text-xs opacity-75">
            {metric.count} pomiarów
          </p>
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetrics;
