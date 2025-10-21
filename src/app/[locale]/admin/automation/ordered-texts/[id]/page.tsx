// src/app/[locale]/admin/automation/ordered-texts/[id]/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import Loader from '@/components/ui/Loader';
import { ArrowLeft, Edit, Trash2, Download } from 'lucide-react';

interface OrderedTextDetails {
  _id: string;
  temat: string;
  idZamowienia: string;
  itemId: string;
  cena: number;
  cenaZamowienia: number;
  rodzajTresci: string;
  dlugoscTekstu: number;
  liczbaZnakow: number;
  status: string;
  email: string;
  jezyk: string;
  jezykWyszukiwania: string;
  countryCode: string;
  model: string;
  bibliografia: boolean;
  faq: boolean;
  tabele: boolean;
  boldowanie: boolean;
  listyWypunktowane: boolean;
  frazy: string;
  link1?: string;
  link2?: string;
  link3?: string;
  link4?: string;
  wytyczneIndywidualne: string;
  tonIStyl: string;
  startDate: string;
  createdAt: string;
  userId?: {
    name: string;
    email: string;
  };
}

export default function OrderedTextDetailsPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();

  const [orderedText, setOrderedText] = useState<OrderedTextDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ NAPRAWIONY - sprawdza czy user istnieje
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (params.id) {
      fetchOrderedText();
    }
  }, [params.id]);

  const fetchOrderedText = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/automation/ordered-texts/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrderedText(data.data.orderedText);
      }
    } catch (error) {
      console.error('Error fetching ordered text:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Czy na pewno chcesz usunąć ten tekst?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/automation/ordered-texts/${params.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        router.push('/admin/automation/ordered-texts');
      }
    } catch (error) {
      console.error('Error deleting text:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!orderedText) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Nie znaleziono tekstu</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/automation/ordered-texts')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Powrót do listy
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1
              className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {orderedText.temat}
            </h1>
            <p
              className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              ID: {orderedText._id}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 size={18} />
              Usuń
            </button>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Podstawowe informacje */}
        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4">Podstawowe informacje</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">ID Zamówienia</p>
              <p className="font-medium font-mono">
                {orderedText.idZamowienia}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Item ID</p>
              <p className="font-medium font-mono">{orderedText.itemId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{orderedText.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{orderedText.status}</p>
            </div>
          </div>
        </div>

        {/* Ceny */}
        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4">Ceny</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Cena</p>
              <p className="font-medium text-2xl">
                {orderedText.cena.toFixed(2)} PLN
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cena zamówienia</p>
              <p className="font-medium">
                {orderedText.cenaZamowienia.toFixed(2)} PLN
              </p>
            </div>
          </div>
        </div>

        {/* Parametry treści */}
        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4">Parametry treści</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Rodzaj treści</p>
              <p className="font-medium">{orderedText.rodzajTresci}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Długość tekstu</p>
              <p className="font-medium">{orderedText.dlugoscTekstu}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Liczba znaków</p>
              <p className="font-medium">{orderedText.liczbaZnakow}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Język</p>
              <p className="font-medium">{orderedText.jezyk}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="font-medium">{orderedText.model}</p>
            </div>
          </div>
        </div>

        {/* Opcje */}
        <div
          className={`p-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4">Opcje</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={orderedText.bibliografia}
                disabled
              />
              <label>Bibliografia</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={orderedText.faq} disabled />
              <label>FAQ</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={orderedText.tabele} disabled />
              <label>Tabele</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={orderedText.boldowanie}
                disabled
              />
              <label>Boldowanie</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={orderedText.listyWypunktowane}
                disabled
              />
              <label>Listy wypunktowane</label>
            </div>
          </div>
        </div>

        {/* Wytyczne */}
        <div
          className={`p-6 rounded-lg shadow md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4">Wytyczne</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Ton i styl</p>
              <p className="font-medium">{orderedText.tonIStyl}</p>
            </div>
            {orderedText.wytyczneIndywidualne && (
              <div>
                <p className="text-sm text-gray-500">Wytyczne indywidualne</p>
                <p className="font-medium whitespace-pre-wrap">
                  {orderedText.wytyczneIndywidualne}
                </p>
              </div>
            )}
            {orderedText.frazy && (
              <div>
                <p className="text-sm text-gray-500">Frazy kluczowe</p>
                <p className="font-medium">{orderedText.frazy}</p>
              </div>
            )}
          </div>
        </div>

        {/* Linki */}
        {(orderedText.link1 ||
          orderedText.link2 ||
          orderedText.link3 ||
          orderedText.link4) && (
          <div
            className={`p-6 rounded-lg shadow md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
          >
            <h2 className="text-xl font-bold mb-4">Linki</h2>
            <div className="space-y-2">
              {orderedText.link1 && (
                <div>
                  <p className="text-sm text-gray-500">Link 1</p>

                  <a
                    href={orderedText.link1}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {orderedText.link1}
                  </a>
                </div>
              )}
              {orderedText.link2 && (
                <div>
                  <p className="text-sm text-gray-500">Link 2</p>

                  <a
                    href={orderedText.link2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {orderedText.link2}
                  </a>
                </div>
              )}
              {orderedText.link3 && (
                <div>
                  <p className="text-sm text-gray-500">Link 3</p>

                  <a
                    href={orderedText.link3}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {orderedText.link3}
                  </a>
                </div>
              )}
              {orderedText.link4 && (
                <div>
                  <p className="text-sm text-gray-500">Link 4</p>

                  <a
                    href={orderedText.link4}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {orderedText.link4}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Daty */}
        <div
          className={`p-6 rounded-lg shadow md:col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className="text-xl font-bold mb-4">Daty</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Data rozpoczęcia</p>
              <p className="font-medium">{formatDate(orderedText.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data utworzenia</p>
              <p className="font-medium">{formatDate(orderedText.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
