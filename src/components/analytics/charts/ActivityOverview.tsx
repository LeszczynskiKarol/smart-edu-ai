// src/components/analytics/charts/ActivityOverview.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartEntry {
    name: string;
    value: number;
}

interface ActivityData {
    eventType: string;
    [key: string]: any;
}

const ActivityOverview: React.FC<{ data: ActivityData[] }> = ({ data }) => {
    const homeTrackingEvents = [
        'visibility',
        'engagement',
        'heroInteraction',
        'ctaClick',
        'featureHover',
        'serviceInteraction'
    ];

    const eventCounts = data.reduce((acc, curr) => {
        const category = homeTrackingEvents.includes(curr.eventType)
            ? 'homeTracking'
            : curr.eventType;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData: ChartEntry[] = Object.entries(eventCounts).map(([name, value]) => ({
        name,
        value
    }));

    const COLORS = {
        homeTracking: '#0088FE',
        interaction: '#00C49F',
        click: '#FFBB28',
        formSubmit: '#FF8042',
        navigation: '#8884d8',
        default: '#82ca9d'
    } as const;

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry: ChartEntry) => `${entry.name} (${entry.value})`}
                    >
                        {pieData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.default}
                            />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ActivityOverview;
