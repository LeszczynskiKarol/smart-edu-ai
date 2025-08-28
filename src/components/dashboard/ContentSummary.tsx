// src/components/dashboard/ContentSummary.tsx
import React from 'react';
import {
  BookOpen,
  Table,
  List,
  BookmarkCheck,
  GraduationCap,
  CheckSquare,
  Flag,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ContentSummaryProps {
  contentType: string;
  theme: string;
}

export const ContentSummary: React.FC<ContentSummaryProps> = ({
  contentType,
  theme,
}) => {
  const t = useTranslations('contentSummary');
  const isLicencjacka = contentType === 'licencjacka';
  const isMagisterska = contentType === 'magisterska';

  if (!isLicencjacka && !isMagisterska) return null;

  return (
    <div
      className={`mt-3 p-3 rounded-lg border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700 text-gray-300'
          : 'bg-blue-50 border-blue-200 text-gray-700'
      }`}
    >
      <h4
        className={`text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
        }`}
      >
        {isLicencjacka ? t('licencjacka') : t('magisterska')}
      </h4>

      <div className="space-y-1">
        <div className="flex items-start">
          <CheckSquare
            className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}
          />
          <p className="text-xs">
            <span className="font-medium">
              {isLicencjacka
                ? t('chapters.licencjacka')
                : t('chapters.magisterska')}
            </span>
            {isLicencjacka
              ? t('chapters.licencjackaDetails')
              : t('chapters.magisterskaDetails')}
          </p>
        </div>

        <div className="flex items-start">
          <CheckSquare
            className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}
          />
          <p className="text-xs">
            <span className="font-medium">
              {isLicencjacka ? t('pages.licencjacka') : t('pages.magisterska')}
            </span>
            {t('pages.text')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
          <div className="flex items-center">
            <Table
              className={`w-3.5 h-3.5 mr-1 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            />
            <span className="text-xs">{t('features.tables')}</span>
          </div>
          <div className="flex items-center">
            <List
              className={`w-3.5 h-3.5 mr-1 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            />
            <span className="text-xs">{t('features.tableOfContents')}</span>
          </div>
          <div className="flex items-center">
            <BookmarkCheck
              className={`w-3.5 h-3.5 mr-1 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            />
            <span className="text-xs">{t('features.bibliography')}</span>
          </div>
          <div className="flex items-center">
            <GraduationCap
              className={`w-3.5 h-3.5 mr-1 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            />
            <span className="text-xs">{t('features.academicLanguage')}</span>
          </div>
          <div className="flex items-center">
            <BookOpen
              className={`w-3.5 h-3.5 mr-1 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            />
            <span className="text-xs">{t('features.introduction')}</span>
          </div>
          <div className="flex items-center">
            <Flag
              className={`w-3.5 h-3.5 mr-1 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            />
            <span className="text-xs">{t('features.conclusion')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
