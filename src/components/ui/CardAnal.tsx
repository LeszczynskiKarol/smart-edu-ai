// src/components/ui/CardAnal.tsx
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`bg-black rounded-lg shadow ${className}`}>
        {children}
    </div>
);
