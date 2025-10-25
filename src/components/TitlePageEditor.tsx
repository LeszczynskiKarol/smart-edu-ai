// src/components/TitlePageEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Save, FileText, X } from 'lucide-react';

interface TitlePageData {
  studentName: string;
  studentIndexNumber: string;
  university: string;
  faculty: string;
  fieldOfStudy: string;
  specialization: string;
  supervisor: string;
  city: string;
  year: string;
  workType: string;
}

interface TitlePageEditorProps {
  orderId: string;
  onSave?: (data: TitlePageData) => void;
  onClose?: () => void;
}

export default function TitlePageEditor({
  orderId,
  onSave,
  onClose,
}: TitlePageEditorProps) {
  const [formData, setFormData] = useState<TitlePageData>({
    studentName: '',
    studentIndexNumber: '',
    university: '',
    faculty: '',
    fieldOfStudy: '',
    specialization: '',
    supervisor: '',
    city: '',
    year: new Date().getFullYear().toString(),
    workType: 'Praca licencjacka',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadTitlePageData();
  }, [orderId]);

  const loadTitlePageData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/title-page`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setFormData(result.data);
        }
      }
    } catch (error) {
      console.error('Błąd podczas ładowania danych strony tytułowej:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/title-page`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (onSave) {
          onSave(formData);
        }
      } else {
        alert('Nie udało się zapisać danych. Spróbuj ponownie.');
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania danych:', error);
      alert('Wystąpił błąd podczas zapisywania. Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FileText className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Strona tytułowa
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Wypełnij dane, które pojawią się na stronie tytułowej dokumentu
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Success notification */}
      {saveSuccess && (
        <div className="mb-4 px-4 py-3 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">
            ✓ Dane zostały zapisane pomyślnie!
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Podstawowe informacje */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imię i nazwisko studenta *
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
              placeholder="np. Jan Kowalski"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Numer indeksu
            </label>
            <input
              type="text"
              name="studentIndexNumber"
              value={formData.studentIndexNumber}
              onChange={handleChange}
              placeholder="np. 123456"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Uczelnia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Uczelnia *
          </label>
          <input
            type="text"
            name="university"
            value={formData.university}
            onChange={handleChange}
            required
            placeholder="np. Uniwersytet Warszawski"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Wydział i kierunek */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wydział *
            </label>
            <input
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              required
              placeholder="np. Wydział Informatyki"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kierunek *
            </label>
            <input
              type="text"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              required
              placeholder="np. Informatyka"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Specjalizacja */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Specjalizacja (opcjonalnie)
          </label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="np. Sztuczna Inteligencja"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Promotor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Promotor *
          </label>
          <input
            type="text"
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            required
            placeholder="np. dr hab. Anna Nowak"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Miejsce, rok i typ pracy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Miasto *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="np. Warszawa"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rok *
            </label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              placeholder="np. 2025"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Typ pracy *
            </label>
            <select
              name="workType"
              value={formData.workType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="Praca licencjacka">Praca licencjacka</option>
              <option value="Praca magisterska">Praca magisterska</option>
              <option value="Praca inżynierska">Praca inżynierska</option>
              <option value="Praca dyplomowa">Praca dyplomowa</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            <Save size={18} />
            <span>{isSaving ? 'Zapisywanie...' : 'Zapisz dane'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
            >
              Anuluj
            </button>
          )}
        </div>

        {/* Info text */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          * Pola oznaczone gwiazdką są wymagane. Dane zostaną użyte przy
          generowaniu dokumentów PDF i DOCX.
        </p>
      </form>
    </div>
  );
}
