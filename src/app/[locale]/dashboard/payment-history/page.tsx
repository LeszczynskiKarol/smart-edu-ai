// src/app/[locale]/dashboard/payment-history/page.tsx
'use client';
import React, { useRef, Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { NextIntlClientProvider, useLocale } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import defaultMessages from '../../../../messages/pl.json';
import { useAnalytics } from '@/context/AnalyticsContext';

// Definicja typu dla zagnieżdżonych tłumaczeń
interface NestedMessages {
    [key: string]: string | NestedMessages | Array<string | NestedMessages> | undefined;
}

interface TranslationMessages extends NestedMessages {
    paymentHistory: {
        [key: string]: string | NestedMessages;
    };
}

const getTranslationMessages = async (locale: string): Promise<TranslationMessages> => {
    try {
        const messages = (await import(`../../../../messages/${locale}.json`)).default;

        if (!messages.paymentHistory) {
            console.warn(`Missing paymentHistory translations for locale: ${locale}, falling back to default`);
            return defaultMessages as TranslationMessages;
        }

        return messages as TranslationMessages;
    } catch (error) {
        console.error(`Error loading translations for locale: ${locale}, falling back to default`, error);
        return defaultMessages as TranslationMessages;
    }
};

interface PaymentHistoryProps {
    messages: TranslationMessages;
}

const PaymentHistory = dynamic<PaymentHistoryProps>(() => import('../../../../components/dashboard/PaymentHistory'), {
    loading: () => <Loader />,
    ssr: false
});

const Loader = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

export default function PaymentHistoryPage() {
    const { trackEvent } = useAnalytics();
    const pageViewTracked = useRef(false);
    const locale = useLocale();
    const [messages, setMessages] = useState<TranslationMessages | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!pageViewTracked.current) {
            pageViewTracked.current = true;

            trackEvent('pageView', {
                action: 'page_load',
                path: window.location.pathname,
                component: 'paymentHistory',
                referrer: document.referrer || sessionStorage.getItem('lastPath') || ''
            });
        }
    }, [trackEvent]);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                setIsLoading(true);
                const msgs = await getTranslationMessages(locale);
                setMessages(msgs);
            } catch (error) {
                console.error('Error loading messages:', error);
                setMessages(defaultMessages as TranslationMessages);
            } finally {
                setIsLoading(false);
            }
        };
        loadMessages();
    }, [locale]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div>
            <Suspense fallback={<Loader />}>
                {messages && (
                    <NextIntlClientProvider
                        locale={locale}
                        messages={messages as AbstractIntlMessages}
                    >
                        <PaymentHistory messages={messages} />
                    </NextIntlClientProvider>
                )}
            </Suspense>
        </div>
    );
}