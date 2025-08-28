// src/components/Editor.tsx
'use client';
import { useCallback } from 'react';

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export default function Editor({
  value,
  onChange,
  placeholder,
  error,
}: EditorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full h-64 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : ''
        }`}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
