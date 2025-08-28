// src/components/ui/Label.tsx
import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  children,
  className = '',
  ...props
}) => (
  <label
    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`}
    {...props}
  >
    {children}
  </label>
);
