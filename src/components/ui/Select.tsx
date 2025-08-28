// src/components/ui/Select.tsx
import React from 'react';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  children,
  ...props
}) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-2 border rounded ${className}`}
    {...props}
  >
    {options.map((option: SelectOption) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);
