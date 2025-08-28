// src/components/privacy/PrivacyLink.tsx 
'use client';
import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';
import PrivacyModal from './PrivacyModal';

const PrivacyLink: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { theme } = useTheme();
    const t = useTranslations('Privacy');

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
                {t('linkText')}
            </button>
            <PrivacyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default PrivacyLink; 
