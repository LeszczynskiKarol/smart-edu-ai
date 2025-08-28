// src/app/[locale]/admin/dashboard/examples/page.tsx
'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Example } from '@/types/example';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminExamplesPage() {
  const { getToken, user } = useAuth();
  const t = useTranslations('admin.examples');
  const [examples, setExamples] = useState<Example[]>([]);
  const params = useParams();
  const locale = params.locale as string;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/examples`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        setExamples(data);
      } else {
        const errorData = await response.json();
        console.error('Błąd odpowiedzi:', errorData); // Zobacz szczegóły błędu
      }
    } catch (error) {
      console.error('Błąd podczas pobierania przykładów:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        const token = getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/examples/${_id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          setExamples(examples.filter((example) => example._id !== _id));
        }
      } catch (error) {
        console.error('Błąd podczas usuwania przykładu:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title={t('title')}>
      <div className="container mx-auto px-4 mt-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <Link href="/admin/dashboard/examples/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('addNew')}
            </Button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.title')}</TableHead>
              <TableHead>{t('table.level')}</TableHead>
              <TableHead>{t('table.subject')}</TableHead>
              <TableHead>{t('table.views')}</TableHead>
              <TableHead>{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {examples.map((example) => (
              <TableRow key={example._id}>
                {' '}
                <TableCell>{example.title}</TableCell>
                <TableCell>{t(`levels.${example.level}.name`)}</TableCell>
                <TableCell>{example.subject.name}</TableCell>
                <TableCell>{example.views}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link
                      href={`/${locale}/examples/${example.level}/${example.workType.slugEn}/${example.subject.slugEn}/${example.slugEn}`}
                    >
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link
                      href={`/admin/dashboard/examples/edit/${example._id}`}
                    >
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(example._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
