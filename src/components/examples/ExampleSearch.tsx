// src/components/examples/ExampleSearch.tsx
'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

export function ExampleSearch() {
  const t = useTranslations('examples');
  const [query, setQuery] = useState('');

  return (
    <div className="relative mb-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
}
