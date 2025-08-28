// src/app/[locale]/privacy/page.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Layout from '@/components/layout/Layout';
import { useTheme } from '@/context/ThemeContext';

interface RetentionPeriods {
  account: string;
  analytical: string;
  logs: string;
  billing: string;
}

interface Category {
  title: string;
  items: string[];
}

interface ProcessingCategory {
  title: string;
  items: string[];
}

interface DataCollection {
  title: string;
  categories: {
    voluntary: Category;
    automatic: Category;
    analytical: Category;
  };
}

interface ProcessingPurposes {
  title: string;
  categories: {
    services: ProcessingCategory;
    legitInterests: ProcessingCategory;
    consent: ProcessingCategory;
  };
}

const PrivacyPage = () => {
  const t = useTranslations('Privacy');
  const { theme } = useTheme();

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

        <div className="space-y-12">
          {/* General Section */}
          <section>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              {t('sections.general.title')}
            </h2>
            <div className="space-y-4">
              <p
                className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t('sections.general.content')}
              </p>
              <div className="mt-4">
                <h3
                  className={`text-xl font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  {t('sections.general.administrator.title')}
                </h3>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {t('sections.general.administrator.content')}
                </p>
              </div>
            </div>
          </section>

          {/* Data Collection Section */}
          <section>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              {t('sections.dataCollection.title')}
            </h2>
            {Object.entries(
              t.raw(
                'sections.dataCollection.categories'
              ) as DataCollection['categories']
            ).map(([key, category]) => (
              <div key={key} className="mb-6">
                <h3
                  className={`text-xl font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  {category.title}
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {category.items.map((item, index) => (
                    <li
                      key={index}
                      className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section>
            <h2
              className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
            >
              {t('sections.googleData.title')}
            </h2>
            <div className="space-y-4">
              <div className="mb-6">
                <h3
                  className={`text-xl font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  {t('sections.googleData.usage.title')}
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {t
                    .raw('sections.googleData.usage.items')
                    .map((item: string, index: number) => (
                      <li
                        key={index}
                        className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {item}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="mb-6">
                <h3
                  className={`text-xl font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  {t('sections.googleData.protection.title')}
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {t
                    .raw('sections.googleData.protection.items')
                    .map((item: string, index: number) => (
                      <li
                        key={index}
                        className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {item}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Processing Purposes Section */}
          <section>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              {t('sections.processingPurposes.title')}
            </h2>
            {Object.entries(
              t.raw(
                'sections.processingPurposes.categories'
              ) as ProcessingPurposes['categories']
            ).map(([key, category]) => (
              <div key={key} className="mb-6">
                <h3
                  className={`text-xl font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  {category.title}
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {category.items.map((item, index) => (
                    <li
                      key={index}
                      className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          {/* Retention Periods Section */}
          <section>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              {t('sections.retentionPeriods.title')}
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(
                t.raw('sections.retentionPeriods.periods') as RetentionPeriods
              ).map(([key, period]) => (
                <li
                  key={key}
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {period}
                </li>
              ))}
            </ul>
          </section>

          {/* Contact Section */}
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
                {t('sections.contact.content')}
              </p>
              <p
                className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t('sections.contact.email')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
