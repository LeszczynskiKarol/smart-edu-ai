// src/components/analytics/metrics/SummaryMetrics.tsx
import React from 'react';
import { Card } from '@/components/ui/card';

interface MetricCardProps {
    title: string;
    value: string | number;
    description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description }) => (
    <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </Card>
);

const SummaryMetrics: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Aktywni Użytkownicy"
                value={data.activeUsers || 0}
                description="W ostatnich 24h"
            />
            <MetricCard
                title="Sesje"
                value={data.totalSessions || 0}
                description="W tym miesiącu"
            />
            <MetricCard
                title="Średni Czas Sesji"
                value={`${data.avgSessionTime || 0}min`}
            />
            <MetricCard
                title="Współczynnik Odrzuceń"
                value={`${data.bounceRate || 0}%`}
            />
        </div>
    );
};

export default SummaryMetrics;
