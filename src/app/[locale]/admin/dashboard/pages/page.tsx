// src/app/[locale]/admin/dashboard/pages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

type Page = {
  _id: string;
  title: string;
  titleEn: string;
  workType: string;
  category?: string;
  subcategory?: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  slugEn: string;
};

export default function PagesListPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const token = getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/list`, // zmieniamy /all na /list
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log('Otrzymane dane:', data);
        const pagesArray = Array.isArray(data) ? data : [];
        setPages(pagesArray);
      } catch (error) {
        console.error('Błąd podczas pobierania stron:', error);
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę stronę?')) return;

    try {
      const token = getToken();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/work-type-pages/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPages(pages.filter((page) => page._id !== id));
    } catch (error) {
      console.error('Błąd podczas usuwania strony:', error);
      alert('Nie udało się usunąć strony');
    }
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <Layout title="Zarządzanie stronami">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Zarządzanie stronami</h1>
          <Button onClick={() => router.push('/admin/dashboard/pages/new')}>
            Dodaj nową stronę
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tytuł (PL/EN)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ pracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data utworzenia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(pages) && pages.length > 0 ? (
                pages.map((page) => (
                  <tr key={page._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/${page.workType}/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 underline"
                        >
                          {page.title}
                        </a>
                      </div>
                      <div className="text-sm text-gray-500">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/en/${page.workType}/${page.slugEn}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 underline"
                        >
                          {page.titleEn}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {page.workType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {page.category || '-'}
                      {page.subcategory && ` / ${page.subcategory}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(page.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/admin/dashboard/pages/edit/${page._id.toString()}`
                          )
                        }
                      >
                        Edytuj
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(page._id)}
                      >
                        Usuń
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Brak dostępnych stron
                  </td>
                </tr>
              )}{' '}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
