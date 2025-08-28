// src/components/ui/Input.tsx
import React from 'react';
import { Label } from './Label';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  className = '',
  type = 'text',
  ...props
}) => (
  <div className="space-y-2">
    {label && <Label>{label}</Label>}
    <input
      type={type}
      className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${className}`}
      {...props}
    />
  </div>
);
