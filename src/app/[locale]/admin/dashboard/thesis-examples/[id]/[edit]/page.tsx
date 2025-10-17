// src/app/[locale]/admin/dashboard/thesis-examples/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import Editor from '@/components/Editor';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditThesisExamplePage({ params }: PageProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: 'bachelor',
    title: '',
    titleEn: '',
    content: '',
    contentEn: '',
    subject: '',
    subjectEn: '',
    tags: '',
    wordCount: 0,
    metaTitlePl: '',
    metaTitleEn: '',
    metaDescriptionPl: '',
    metaDescriptionEn: '',
    published: true,
    featured: false,
  });

  const categoryOptions = [
    { value: 'bachelor', label: 'Praca licencjacka' },
    { value: 'master', label: 'Praca magisterska' },
    { value: 'coursework', label: 'Praca zaliczeniowa' },
  ];

  useEffect(() => {
    fetchExample();
  }, [params.id]);

  const fetchExample = async () => {
    try {
      const token = getToken();
      const response = await fetch(`/api/thesis-examples/admin/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch example');
      }

      const data = await response.json();
      setFormData({
        category: data.category,
        title: data.title,
        titleEn: data.titleEn,
        content: data.content,
        contentEn: data.contentEn,
        subject: data.subject || '',
        subjectEn: data.subjectEn || '',
        tags: (data.tags || []).join(', '),
        wordCount: data.wordCount || 0,
        metaTitlePl: data.metaTitlePl || '',
        metaTitleEn: data.metaTitleEn || '',
        metaDescriptionPl: data.metaDescriptionPl || '',
        metaDescriptionEn: data.metaDescriptionEn || '',
        published: data.published,
        featured: data.featured || false,
      });
    } catch (error) {
      console.error('Error fetching example:', error);
      alert('Nie udało się pobrać przykładu');
      router.push('/admin/dashboard/thesis-examples');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'wordCount') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditorChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Brak autoryzacji');
      }

      const dataToSend = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const response = await fetch(`/api/thesis-examples/admin/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update example');
      }

      alert('Przykład został zaktualizowany pomyślnie!');
      router.push('/admin/dashboard/thesis-examples');
    } catch (error) {
      console.error('Error updating example:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Nie udało się zaktualizować przykładu'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Edycja przykładu">
        <div className="flex justify-center items-center h-screen">
          Ładowanie...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edycja przykładu pracy">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edytuj przykład pracy</h1>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          {/* Kategoria */}
          <div>
            <Label htmlFor="category">Kategoria *</Label>
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              required
            />
          </div>

          {/* Tytuły */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Tytuł (PL) *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="titleEn">Tytuł (EN) *</Label>
              <Input
                id="titleEn"
                name="titleEn"
                value={formData.titleEn}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Przedmioty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="subject">Przedmiot (PL)</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="subjectEn">Przedmiot (EN)</Label>
              <Input
                id="subjectEn"
                name="subjectEn"
                value={formData.subjectEn}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Meta Tytuły */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="metaTitlePl">Meta Tytuł (PL)</Label>
              <Input
                id="metaTitlePl"
                name="metaTitlePl"
                value={formData.metaTitlePl}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="metaTitleEn">Meta Tytuł (EN)</Label>
              <Input
                id="metaTitleEn"
                name="metaTitleEn"
                value={formData.metaTitleEn}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Meta Opisy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="metaDescriptionPl">Meta Opis (PL)</Label>
              <Input
                id="metaDescriptionPl"
                name="metaDescriptionPl"
                value={formData.metaDescriptionPl}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="metaDescriptionEn">Meta Opis (EN)</Label>
              <Input
                id="metaDescriptionEn"
                name="metaDescriptionEn"
                value={formData.metaDescriptionEn}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Tagi i Liczba słów */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="tags">Tagi (oddziel przecinkami)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="wordCount">Liczba słów (przybliżona)</Label>
              <Input
                id="wordCount"
                name="wordCount"
                type="number"
                value={formData.wordCount}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Checkboxy */}
          <div className="flex gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="mr-2"
              />
              <Label htmlFor="published" className="mb-0">
                Opublikowany
              </Label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="mr-2"
              />
              <Label htmlFor="featured" className="mb-0">
                Wyróżniony ⭐
              </Label>
            </div>
          </div>

          {/* Edytory treści */}
          <div>
            <Label>Treść (PL) *</Label>
            <div className="border rounded-lg overflow-hidden">
              <Editor
                value={formData.content}
                onChange={handleEditorChange('content')}
                placeholder="Wprowadź treść pracy po polsku..."
              />
            </div>
          </div>

          <div>
            <Label>Treść (EN) *</Label>
            <div className="border rounded-lg overflow-hidden">
              <Editor
                value={formData.contentEn}
                onChange={handleEditorChange('contentEn')}
                placeholder="Enter content in English..."
              />
            </div>
          </div>

          {/* Przyciski akcji */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/dashboard/thesis-examples')}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Zapisywanie...' : 'Zaktualizuj przykład'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
