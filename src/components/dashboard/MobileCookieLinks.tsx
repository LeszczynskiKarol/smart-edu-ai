// src/components/dashboard/MobileCookieLinks.tsx
import React from 'react';
import { Settings, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

const MobileCookieLinks = ({
  onOpenSettings,
  onOpenContact,
  theme,
}: {
  onOpenSettings: () => void;
  onOpenContact: () => void;
  theme: string;
}) => {
  const t = useTranslations('CookieConsent');

  return (
    <div className="flex items-center justify-end space-x-2 px-4 mb-2">
      <div className="flex items-center space-x-2 text-xs">
        <button
          onClick={onOpenSettings}
          className={`hover:underline
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
        >
          {t('settingsButton')}
        </button>
        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
          •
        </span>
        <button
          onClick={onOpenContact}
          className={`hover:underline
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
        >
          {t('contactButton')}
        </button>
      </div>
    </div>
  );
};

export default MobileCookieLinks;
