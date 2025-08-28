// src/components/privacy/PrivacyModal.tsx
'use client';
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';
import Modal from '../ui/Modal';

interface RetentionPeriods {
    account: string;
    analytical: string;
    logs: string;
    billing: string;
}



interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
    const { theme } = useTheme();
    const t = useTranslations('Privacy');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('title')}>
            <div className="space-y-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('lastUpdated')}
                </p>

                {/* Sekcja 1: Informacje ogólne */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('sections.general.title')}
                    </h3>
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                            {t('sections.general.content')}
                        </p>
                        <div>
                            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                                {t('sections.general.administrator.title')}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300">
                                {t('sections.general.administrator.content')}
                            </p>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            {t('sections.general.contact')}
                        </p>
                    </div>
                </section>

                {/* Sekcja 2: Zakres zbieranych danych */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('sections.dataCollection.title')}
                    </h3>
                    {['voluntary', 'automatic', 'analytical'].map((category) => (
                        <div key={category} className="mb-4">
                            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                                {t(`sections.dataCollection.categories.${category}.title`)}
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                                {t.raw(`sections.dataCollection.categories.${category}.items`).map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                {/* Sekcja 3: Cele przetwarzania */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('sections.processingPurposes.title')}
                    </h3>
                    {['services', 'legitInterests', 'consent'].map((category) => (
                        <div key={category} className="mb-4">
                            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                                {t(`sections.processingPurposes.categories.${category}.title`)}
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                                {t.raw(`sections.processingPurposes.categories.${category}.items`).map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                {/* Sekcja 4: Analytics */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('sections.analytics.title')}
                    </h3>
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">{t('sections.analytics.content')}</p>
                        <p className="text-gray-600 dark:text-gray-300">{t('sections.analytics.cookieManagement')}</p>
                        <div>
                            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                                {t('sections.analytics.cookieTypes.title')}
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                                {t.raw('sections.analytics.cookieTypes.items').map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Sekcja 5: Odbiorcy danych */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('sections.dataRecipients.title')}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                                {t('sections.dataRecipients.recipients.title')}
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                                {t.raw('sections.dataRecipients.recipients.items').map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                                {t('sections.dataRecipients.transfer.title')}
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                                {t.raw('sections.dataRecipients.transfer.items').map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Sekcja 6: Prawa użytkownika */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('sections.userRights.title')}
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                        {t.raw('sections.userRights.rights').map((right: string, index: number) => (
                            <li key={index}>{right}</li>
                        ))}
                    </ul>
                </section>

                {/* Sekcja 7: Okres przechowywania */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('sections.retentionPeriods.title')}
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                        {Object.entries(t.raw('sections.retentionPeriods.periods') as RetentionPeriods).map(([key, value]) => (
                            <li key={key}>{value}</li>
                        ))}
                    </ul>
                </section>

                {/* Sekcja 8: Bezpieczeństwo */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('sections.security.title')}
                    </h3>
                    <div>
                        <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                            {t('sections.security.measures.title')}
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                            {t.raw('sections.security.measures.items').map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Sekcja 9: Zmiany */}
                <section>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('sections.changes.title')}
                    </h3>
                    <div className="space-y-2">
                        <p className="text-gray-600 dark:text-gray-300">{t('sections.changes.content')}</p>
                        <p className="text-gray-600 dark:text-gray-300">{t('sections.changes.notification')}</p>
                    </div>
                </section>

                {/* Sekcja 10: Kontakt */}
                <section className="border-t pt-6 dark:border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t('sections.contact.title')}
                    </h3>
                    <div className="space-y-2">
                        <p className="text-gray-600 dark:text-gray-300">{t('sections.contact.content')}</p>
                        <p className="text-gray-600 dark:text-gray-300">{t('sections.contact.email')}</p>
                    </div>
                </section>
            </div>
        </Modal>
    );
};

export default PrivacyModal;
