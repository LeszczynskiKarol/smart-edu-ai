// src/app/[locale]/admin/dashboard/examples/new/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import Editor from '@/components/Editor';
import {
  WorkType,
  Subject,
  ExampleLength,
  EducationLevel,
} from '@/types/example';
import { useAuth } from '@/context/AuthContext';

export default function NewExamplePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', nameEn: '' });
  const lengthOptions = [
    { value: '2000', label: 'Bardzo krótki (250 słów)' },
    { value: '3000', label: 'Krótki (350 słów)' },
    { value: '4000', label: 'Średni (500 słów)' },
    { value: '7000', label: 'Długi (800-900 słów)' },
    { value: '10000', label: 'Bardzo długi (1300 słów)' },
    { value: '20000', label: 'Najdłuższy (ok. 2500 słów)' },
  ];
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [isAddingWorkType, setIsAddingWorkType] = useState(false);
  const [newWorkType, setNewWorkType] = useState({ name: '', nameEn: '' });
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    content: '',
    contentEn: '',
    level: 'primary' as EducationLevel,
    subject: '',
    workType: '',
    tags: '',
    length: '4000' as ExampleLength,
    metaTitlePl: '',
    metaTitleEn: '',
    metaDescriptionPl: '',
    metaDescriptionEn: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subjects`
        );
        if (response.ok) {
          const fetchedSubjects = await response.json();
          setSubjects(fetchedSubjects);
          if (fetchedSubjects.length > 0) {
            setFormData((prev) => ({
              ...prev,
              subject: fetchedSubjects[0]._id, // używamy _id
            }));
          }
        }
      } catch (error) {
        console.error('Błąd pobierania przedmiotów:', error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchWorkTypes = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/work-types`
        );
        if (response.ok) {
          const fetchedWorkTypes = await response.json();
          setWorkTypes(fetchedWorkTypes);
          if (fetchedWorkTypes.length > 0) {
            setFormData((prev) => ({
              ...prev,
              workType: fetchedWorkTypes[0]._id, // używamy _id
            }));
          }
        }
      } catch (error) {
        console.error('Błąd pobierania typów prac:', error);
      }
    };

    fetchWorkTypes();
  }, []);

  const handleAddSubject = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subjects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newSubject),
        }
      );

      if (response.ok) {
        const addedSubject = await response.json();
        setSubjects((prev) => [...prev, addedSubject]);
        setFormData((prev) => ({
          ...prev,
          subject: addedSubject._id,
        }));
        setIsAddingSubject(false);
        setNewSubject({ name: '', nameEn: '' });
      }
    } catch (error) {
      console.error('Błąd dodawania przedmiotu:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Brak autoryzacji');
      }

      // Dodaj te logi
      const dataToSend = {
        ...formData,
        tags: formData.tags.split(',').map((tag) => tag.trim()),
      };

      const response = await fetch('/api/admin/examples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        console.error('Response status:', response.status);
        throw new Error(
          `Failed to create example: ${JSON.stringify(errorData)}`
        );
      }
    } catch (error) {
      console.error('Error creating example:', error);
      alert('Failed to create example');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'subject') {
      setFormData((prev) => ({
        ...prev,
        subject: value,
      }));
    } else if (name === 'workType') {
      setFormData((prev) => ({
        ...prev,
        workType: value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddWorkType = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/work-types`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newWorkType),
        }
      );

      if (response.ok) {
        const addedWorkType = await response.json();
        setWorkTypes((prev) => [...prev, addedWorkType]);
        setFormData((prev) => ({
          ...prev,
          workType: addedWorkType._id, // używamy _id zamiast slug
        }));
        setIsAddingWorkType(false);
        setNewWorkType({ name: '', nameEn: '' });
      }
    } catch (error) {
      console.error('Błąd dodawania typu pracy:', error);
    }
  };

  const handleEditorChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Layout title="newExample">
      <div className="container mx-auto mt-8 px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Nowa praca</h1>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Tytuł</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="titleEn">Title EN</Label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="level">Poziom edukacji</Label>
                <Select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  options={[
                    { value: 'primary', label: 'podstawówka' },
                    {
                      value: 'secondary',
                      label: 'szkoła średnia (liceum, technikum)',
                    },
                    { value: 'university', label: 'studia (szkoła wyższa)' },
                  ]}
                  required
                />
              </div>

              <div>
                <Label>Przedmiot</Label>
                <div className="flex items-center space-x-2">
                  <Select
                    id="subject"
                    name="subject"
                    value={formData.subject} // teraz przechowujemy _id
                    onChange={handleChange}
                    options={subjects.map((s) => ({
                      value: s._id,
                      label: `${s.name} (${s.slug})`,
                    }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingSubject(true)}
                  >
                    Dodaj nowy
                  </Button>
                </div>
              </div>
              <div>
                <Label>Typ pracy</Label>
                <div className="flex items-center space-x-2">
                  <Select
                    id="workType"
                    name="workType"
                    value={formData.workType} // teraz przechowujemy _id
                    onChange={handleChange}
                    options={workTypes.map((w) => ({
                      value: w._id,
                      label: `${w.name} (${w.slug})`,
                    }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingWorkType(true)}
                  >
                    Dodaj
                  </Button>
                </div>
              </div>
            </div>
            {isAddingWorkType && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg space-y-4">
                  <h3 className="text-lg font-bold">Dodaj nowy typ pracy</h3>
                  <div>
                    <Label>Nazwa (PL)</Label>
                    <Input
                      value={newWorkType.name}
                      onChange={(e) =>
                        setNewWorkType((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Nazwa (EN)</Label>
                    <Input
                      value={newWorkType.nameEn}
                      onChange={(e) =>
                        setNewWorkType((prev) => ({
                          ...prev,
                          nameEn: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingWorkType(false)}
                    >
                      Anuluj
                    </Button>
                    <Button type="button" onClick={(e) => handleAddWorkType(e)}>
                      Dodaj
                    </Button>{' '}
                  </div>
                </div>
              </div>
            )}
            {isAddingSubject && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg space-y-4">
                  <h3 className="text-lg font-bold">Dodaj nowy przedmiot</h3>
                  <div>
                    <Label>Nazwa (PL)</Label>
                    <Input
                      value={newSubject.name}
                      onChange={(e) =>
                        setNewSubject((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Nazwa (EN)</Label>
                    <Input
                      value={newSubject.nameEn}
                      onChange={(e) =>
                        setNewSubject((prev) => ({
                          ...prev,
                          nameEn: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingSubject(false)}
                    >
                      Anuluj
                    </Button>
                    <Button type="button" onClick={(e) => handleAddSubject(e)}>
                      Dodaj
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="length">Długość</Label>
              <Select
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
                options={lengthOptions}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tagi</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Edytor</Label>
            <Editor
              value={formData.content}
              onChange={handleEditorChange('content')}
              placeholder={'Edytor'}
            />
          </div>

          <div>
            <Label>Tekst PO ANGIELSKU</Label>
            <Editor
              value={formData.contentEn}
              onChange={handleEditorChange('contentEn')}
              placeholder={'Tekst PO ANGIELSKU'}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/dashboard/examples')}
            >
              {'anuluj'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'zapisywanie' : 'zapisz'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
