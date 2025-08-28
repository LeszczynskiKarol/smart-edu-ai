// src/app/[locale]/terms/page.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Layout from '@/components/layout/Layout';
import { useTheme } from '@/context/ThemeContext';

interface DefinitionItems {
  [key: string]: string;
}

const TermsPage = () => {
  const t = useTranslations('Terms');
  const { theme } = useTheme();

  const sections = [
    'registration',
    'services',
    'payments',
    'refunds',
    'rights',
    'intellectual',
    'data',
    'liability',
    'final',
  ];

  // Pomocnicza funkcja do bezpiecznego pobierania danych sekcji
  const getSectionItems = (section: string): string[] => {
    try {
      const sectionData = t.raw(`sections.${section}`);
      return Array.isArray(sectionData?.items) ? sectionData.items : [];
    } catch (error) {
      console.warn(`Missing translation for section: ${section}`);
      return [];
    }
  };

  // Pomocnicza funkcja do bezpiecznego pobierania definicji
  const getDefinitions = (): DefinitionItems => {
    try {
      return t.raw('sections.definitions.items') as DefinitionItems;
    } catch (error) {
      console.warn('Missing definitions translations');
      return {};
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 mt-10 py-8">
        <h1
          className={`text-3xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {t('title')}
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {t('lastUpdated')}
        </p>

        <div className="space-y-8">
          {/* Definitions section */}
          <section>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              {t('sections.definitions.title')}
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              {Object.entries(getDefinitions()).map(([key, value]) => (
                <li
                  key={key}
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  <strong>{key}</strong> - {value}
                </li>
              ))}
            </ul>
          </section>

          {/* Other sections */}
          {sections.map((section) => {
            const items = getSectionItems(section);
            if (items.length === 0) return null;

            return (
              <section key={section}>
                <h2
                  className={`text-2xl font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {t(`sections.${section}.title`)}
                </h2>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <p
                      key={index}
                      className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {item}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Contact section */}
          {t.raw('sections.contact') && (
            <section className="border-t pt-6 dark:border-gray-700">
              <h2
                className={`text-2xl font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                {t('sections.contact.title')}
              </h2>
              <div className="space-y-2">
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {t('sections.contact.email')}
                </p>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {t('sections.contact.address')}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;
