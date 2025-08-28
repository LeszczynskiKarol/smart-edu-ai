// src/components/ui/textarea.tsx
import React from 'react';
import { Label } from './Label';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  className = '',
  ...props
}) => (
  <div className="space-y-2">
    {label && <Label>{label}</Label>}
    <textarea
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-y min-h-[100px] ${className}`}
      {...props}
    />
  </div>
);
