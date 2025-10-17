// src/app/[locale]/admin/dashboard/thesis-examples/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

interface ThesisExample {
  _id: string;
  category: string;
  title: string;
  titleEn: string;
  slug: string;
  views: number;
  published: boolean;
  featured: boolean;
  createdAt: string;
}

export default function ThesisExamplesPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [examples, setExamples] = useState<ThesisExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchExamples();
  }, [categoryFilter]);

  const fetchExamples = async () => {
    try {
      const token = getToken();

      // ❌ ZŁE - względny URL
      const url =
        categoryFilter === 'all'
          ? '/api/thesis-examples/admin/all'
          : `/api/thesis-examples/admin/all?category=${categoryFilter}`;

      // ✅ POPRAWNE - pełny URL
      const fullUrl =
        categoryFilter === 'all'
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/thesis-examples/admin/all`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/thesis-examples/admin/all?category=${categoryFilter}`;

      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExamples(data);
      }
    } catch (error) {
      console.error('Error fetching examples:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten przykład?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/thesis-examples/admin/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setExamples(examples.filter((ex) => ex._id !== id));
      }
    } catch (error) {
      console.error('Error deleting example:', error);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      bachelor: 'Praca licencjacka',
      master: 'Praca magisterska',
      coursework: 'Praca zaliczeniowa',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <Layout title="Przykłady prac">
        <div>Ładowanie...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Zarządzaj przykładami prac">
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Przykłady prac</h1>
          <Link href="/admin/dashboard/thesis-examples/new">
            <Button>Dodaj nowy przykład</Button>
          </Link>
        </div>

        <div className="mb-6">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">Wszystkie kategorie</option>
            <option value="bachelor">Prace licencjackie</option>
            <option value="master">Prace magisterskie</option>
            <option value="coursework">Prace zaliczeniowe</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Tytuł</th>
                <th className="px-6 py-3 text-left">Kategoria</th>
                <th className="px-6 py-3 text-left">Wyświetlenia</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Data</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {examples.map((example) => (
                <tr key={example._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{example.title}</div>
                      <div className="text-sm text-gray-500">
                        {example.titleEn}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {getCategoryLabel(example.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{example.views}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {example.published ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          Opublikowany
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                          Szkic
                        </span>
                      )}
                      {example.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                          ⭐ Wyróżniony
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(example.createdAt).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/dashboard/thesis-examples/${example._id}/edit`}
                      >
                        <Button variant="outline" size="sm">
                          Edytuj
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(example._id)}
                      >
                        Usuń
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
