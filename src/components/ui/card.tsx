// src/components/ui/card.tsx
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden ${className}`}>
        {children}
    </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
    </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
    <h2 className={`text-xl font-semibold text-gray-800 dark:text-gray-200 ${className}`}>
        {children}
    </h2>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`px-6 py-4 ${className}`}>
        {children}
    </div>
);