// src/app/[locale]/admin/dashboard/examples/edit/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import Editor from '@/components/Editor';
import { EducationLevel, Example } from '@/types/example';
import { useAuth } from '@/context/AuthContext';

export default function EditExamplePage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('admin.examples');
  const { getToken } = useAuth();
  const lengthOptions = [
    { value: '2000', label: 'Bardzo krótki (250 słów)' },
    { value: '3000', label: 'Krótki (350 słów)' },
    { value: '4000', label: 'Średni (500 słów)' },
    { value: '7000', label: 'Długi (800-900 słów)' },
    { value: '10000', label: 'Bardzo długi (1300 słów)' },
    { value: '20000', label: 'Mega długi (ok. 2500 słów)' },
    { value: '30000', label: 'Najdłuższy (ok. 4000 słów)' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    content: '',
    contentEn: '',
    level: '' as EducationLevel,
    subject: '',
    workType: '',
    tags: '',
    length: '4000',
    metaTitlePl: '',
    metaTitleEn: '',
    metaDescriptionPl: '',
    metaDescriptionEn: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExample = async () => {
      try {
        const token = getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/examples/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const example: Example = await response.json();
          setFormData({
            title: example.title,
            titleEn: example.titleEn,
            content: example.content,
            contentEn: example.contentEn,
            level: example.level,
            subject: example.subject.slug,
            workType: example.workType.slug,
            tags: example.tags.join(', '),
            length: example.length,
            metaTitlePl: example.metaTitlePl,
            metaTitleEn: example.metaTitleEn,
            metaDescriptionPl: example.metaDescriptionPl,
            metaDescriptionEn: example.metaDescriptionEn,
          });
        }
      } catch (error) {
        console.error('Błąd podczas pobierania przykładu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchExample();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/examples/${params.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            tags: formData.tags.split(',').map((tag) => tag.trim()),
          }),
        }
      );

      if (response.ok) {
        router.push('/admin/dashboard/examples');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji przykładu:', error);
      alert('Wystąpił błąd podczas aktualizacji przykładu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <Layout title={t('editExample')}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('editExample')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">{t('form.title')}</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="titleEn">{t('form.titleEn')}</Label>
              <Input
                id="titleEn"
                name="titleEn"
                value={formData.titleEn}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Meta Tytuł (PL)</Label>
              <Input
                name="metaTitlePl"
                value={formData.metaTitlePl}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Meta Tytuł (EN)</Label>
              <Input
                name="metaTitleEn"
                value={formData.metaTitleEn}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Meta Opis (PL)</Label>
              <Input
                name="metaDescriptionPl"
                value={formData.metaDescriptionPl}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Meta Opis (EN)</Label>
              <Input
                name="metaDescriptionEn"
                value={formData.metaDescriptionEn}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="level">{t('form.level')}</Label>
              <Select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                options={[
                  { value: 'primary', label: t('levels.primary') },
                  { value: 'secondary', label: t('levels.secondary') },
                  { value: 'university', label: t('levels.university') },
                ]}
                required
              />
            </div>

            <div>
              <Label htmlFor="subject">{t('form.subject')}</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="length">{t('form.length')}</Label>
            <Select
              id="length"
              name="length"
              value={formData.length}
              onChange={handleChange}
              options={lengthOptions}
              required
            />
          </div>

          <div>
            <Label htmlFor="tags">{t('form.tags')}</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder={t('form.tagsPlaceholder')}
            />
          </div>

          <div>
            <Label>{t('form.content')}</Label>
            <Editor
              value={formData.content}
              onChange={handleEditorChange('content')}
              placeholder={t('form.contentPlaceholder')}
            />
          </div>

          <div>
            <Label>{t('form.contentEn')}</Label>
            <Editor
              value={formData.contentEn}
              onChange={handleEditorChange('contentEn')}
              placeholder={t('form.contentEnPlaceholder')}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/dashboard/examples')}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
