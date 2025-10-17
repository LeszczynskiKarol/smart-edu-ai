// src/app/[locale]/admin/dashboard/thesis-examples/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import Editor from '@/components/Editor';

export default function NewThesisExamplePage() {
  const router = useRouter();
  const { getToken } = useAuth();
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
        alert('Brak tokenu autoryzacyjnego. Zaloguj się ponownie.');
        router.push('/admin/login');
        return;
      }

      console.log('🔑 Wysyłam z tokenem:', token.substring(0, 20) + '...');

      const dataToSend = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      console.log('📤 Wysyłam dane:', dataToSend);

      // ✅ POPRAWIONY URL - PEŁNY PATH
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/thesis-examples/admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // ✅ Token w headerze
          },
          body: JSON.stringify(dataToSend),
        }
      );

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || 'Failed to create example');
      }

      const result = await response.json();
      console.log('✅ Success:', result);

      alert('Przykład został utworzony pomyślnie!');
      router.push('/admin/dashboard/thesis-examples');
    } catch (error) {
      console.error('❌ Error creating example:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Nie udało się utworzyć przykładu'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Nowy przykład pracy">
      <div className="container mx-auto px-4 py-8 mt-10">
        <h1 className="text-3xl font-bold mb-8">Dodaj nowy przykład pracy</h1>

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
                placeholder="Wpływ sztucznej inteligencji na..."
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
                placeholder="The Impact of Artificial Intelligence on..."
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
                placeholder="Informatyka"
              />
            </div>

            <div>
              <Label htmlFor="subjectEn">Przedmiot (EN)</Label>
              <Input
                id="subjectEn"
                name="subjectEn"
                value={formData.subjectEn}
                onChange={handleChange}
                placeholder="Computer Science"
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
                placeholder="AI, technologia, przyszłość"
              />
            </div>

            <div>
              <Label htmlFor="wordCount">Liczba słów</Label>
              <Input
                id="wordCount"
                name="wordCount"
                type="number"
                value={formData.wordCount}
                onChange={handleChange}
                placeholder="5000"
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
                placeholder="Wprowadź treść..."
              />
            </div>
          </div>

          <div>
            <Label>Treść (EN) *</Label>
            <div className="border rounded-lg overflow-hidden">
              <Editor
                value={formData.contentEn}
                onChange={handleEditorChange('contentEn')}
                placeholder="Enter content..."
              />
            </div>
          </div>

          {/* Przyciski */}
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
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz przykład'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
