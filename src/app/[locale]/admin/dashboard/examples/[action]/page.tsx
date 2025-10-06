// src/app/[locale]/admin/dashboard/examples/[action]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@/components/Editor';

interface PageProps {
  params: {
    locale: string;
    action: string;
  };
}

export default function ExampleActionPage({ params }: PageProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = params.action !== 'create';

  // Jeśli to tryb edycji, możesz załadować dane
  useEffect(() => {
    if (isEditMode) {
      // TODO: Załaduj dane przykładu do edycji
      // fetchExampleData(params.action);
    }
  }, [isEditMode, params.action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Dodaj logikę zapisu do API
      const response = await fetch('/api/examples', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: isEditMode ? params.action : undefined,
          title,
          content,
          category,
        }),
      });

      if (response.ok) {
        router.push(`/${params.locale}/admin/dashboard/examples`);
      } else {
        alert('Błąd podczas zapisywania');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Wystąpił błąd');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditMode ? 'Edytuj Przykład' : 'Utwórz Nowy Przykład'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode
            ? 'Edytuj istniejący przykład'
            : 'Dodaj nowy przykład do systemu'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        {/* Tytuł */}
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tytuł *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Wprowadź tytuł przykładu"
            required
          />
        </div>

        {/* Kategoria */}
        <div className="mb-6">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Kategoria *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Wybierz kategorię</option>
            <option value="math">Matematyka</option>
            <option value="science">Nauki przyrodnicze</option>
            <option value="language">Język</option>
            <option value="history">Historia</option>
            <option value="other">Inne</option>
          </select>
        </div>

        {/* Edytor treści */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Treść *
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Editor
              value={content}
              onChange={setContent}
              placeholder="Wpisz treść przykładu..."
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Użyj edytora aby sformatować treść przykładu
          </p>
        </div>

        {/* Przyciski */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !title || !content || !category}
          >
            {isLoading
              ? 'Zapisywanie...'
              : isEditMode
                ? 'Zapisz zmiany'
                : 'Utwórz przykład'}
          </button>
        </div>
      </form>

      {/* Podgląd */}
      {content && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Podgląd</h2>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-2xl font-bold mb-2">
              {title || 'Tytuł przykładu'}
            </h3>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-4">
              {category || 'Kategoria'}
            </span>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
