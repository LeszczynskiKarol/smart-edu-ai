// src/components/Bibliography.tsx
'use client';
import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BibliographyProps {
  orderId: string;
  itemId: string;
}

export default function Bibliography({ orderId, itemId }: BibliographyProps) {
  const [bibliography, setBibliography] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('🔍 Bibliography component mounted');
    console.log('📦 orderId:', orderId);
    console.log('📄 itemId:', itemId);
    fetchBibliography();
  }, [orderId, itemId]);

  const fetchBibliography = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/items/${itemId}/bibliography`;
      console.log('📡 Fetching bibliography from:', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Response data:', data);
        console.log('📚 hasBibliography:', data.data.hasBibliography);
        console.log(
          '📄 bibliographyContent length:',
          data.data.bibliographyContent?.length || 0
        );
        console.log(
          '📄 bibliographyContent (first 100 chars):',
          data.data.bibliographyContent?.substring(0, 100)
        );

        if (data.data.bibliographyContent) {
          setBibliography(data.data.bibliographyContent);
          console.log('✅ Bibliografia ustawiona!');
        } else {
          console.log('❌ Brak bibliographyContent w odpowiedzi');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        setError(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Błąd pobierania bibliografii:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      console.log(
        '🏁 Loading finished. Bibliography:',
        bibliography ? 'SET' : 'EMPTY'
      );
    }
  };

  console.log(
    '🎨 Render - loading:',
    loading,
    'bibliography:',
    bibliography ? 'EXISTS' : 'EMPTY',
    'error:',
    error
  );

  if (loading) {
    return (
      <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <BookOpen
            className="text-blue-600 dark:text-blue-400 animate-pulse"
            size={24}
          />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Ładowanie bibliografii...
          </h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <h3 className="text-xl font-bold text-red-900 dark:text-red-300">
          Błąd: {error}
        </h3>
      </div>
    );
  }

  if (!bibliography) {
    return <div></div>;
  }

  return (
    <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4"></div>
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: bibliography }}
      />
    </div>
  );
}
