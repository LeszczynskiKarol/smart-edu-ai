// src/components/DynamicIcon.tsx
import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  icon: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  icon,
  className = '',
  size = 24,
}) => {
  // @ts-ignore - ignorujemy błąd TypeScript, bo wiemy że ikona istnieje
  const Icon = Icons[icon];

  if (!Icon) {
    return null;
  }

  return <Icon className={className} size={size} />;
};
