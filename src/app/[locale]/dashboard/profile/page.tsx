// src/app/[locale]/dashboard/profile/page.tsx
'use client';
import React, { useRef, Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import dynamic from 'next/dynamic';
import { NextIntlClientProvider, useLocale } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import defaultMessages from '../../../../messages/pl.json';
import { TranslationMessages, UserData } from '@/types/translations';
import { useAnalytics } from '@/context/AnalyticsContext';

// Osobne interfejsy dla każdego komponentu
interface ProfileFormProps {
  user: UserData;
  messages: TranslationMessages;
}

interface ChangePasswordFormProps {
  messages: TranslationMessages;
}

// Dynamiczne importy z poprawnymi typami
const ProfileForm = dynamic<ProfileFormProps>(() =>
  import('../../../../components/dashboard/profile/ProfileForm')
    .then((mod) => {
      return mod.default as React.ComponentType<ProfileFormProps>;
    })
  , {
    loading: () => <Loader />,
    ssr: false,
  });

const ChangePasswordForm = dynamic<ChangePasswordFormProps>(() =>
  import('../../../../components/dashboard/profile/ChangePasswordForm')
    .then((mod) => {
      return mod.default as React.ComponentType<ChangePasswordFormProps>;
    })
  , {
    loading: () => <Loader />,
    ssr: false,
  });

const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const getTranslationMessages = async (locale: string): Promise<TranslationMessages> => {
  try {
    const messages = (await import(`../../../../messages/${locale}.json`)).default;

    if (!messages.profile) {
      console.warn(`Missing profile translations for locale: ${locale}, falling back to default`);
      return defaultMessages as unknown as TranslationMessages;
    }

    return messages as unknown as TranslationMessages;
  } catch (error) {
    console.error(`Error loading translations for locale: ${locale}, falling back to default`, error);
    return defaultMessages as unknown as TranslationMessages;
  }
};

const ProfilePage: React.FC = () => {
  const { trackEvent } = useAnalytics();
  const pageViewTracked = useRef(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [messages, setMessages] = useState<TranslationMessages | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (!pageViewTracked.current) {
      pageViewTracked.current = true;

      trackEvent('pageView', {
        action: 'page_load',
        path: window.location.pathname,
        component: 'profilePage',
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
        setMessages(defaultMessages as unknown as TranslationMessages);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [locale]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || isLoading || !messages || !messages.profile) {

    return <Loader />;
  }

  // Konwersja obiektu user do typu UserData
  const userData: UserData = {
    name: user.name,
    email: user.email,
    id: user.id,
    role: user.role,
    accountBalance: user.accountBalance,
    notificationPermissions: user.notificationPermissions || {},
    newsletterPreferences: user.newsletterPreferences || {},
    companyDetails: user.companyDetails ? {
      companyName: user.companyDetails.companyName || '',
      nip: user.companyDetails.nip || '',
      address: user.companyDetails.address || '',
      buildingNumber: user.companyDetails.buildingNumber || '',
      postalCode: user.companyDetails.postalCode || '',
      city: user.companyDetails.city || ''
    } : undefined
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {typeof messages.profile.title === 'string' ? messages.profile.title : ''}
      </h1>
      <NextIntlClientProvider
        locale={locale}
        messages={messages as AbstractIntlMessages}
      >
        <Suspense fallback={<Loader />}>
          <ProfileForm
            user={userData}
            messages={messages}
          />
        </Suspense>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">
            {typeof messages.profile.changePassword.title === 'string'
              ? messages.profile.changePassword.title
              : ''}
          </h2>
          <Suspense fallback={<Loader />}>
            <ChangePasswordForm
              messages={messages}
            />
          </Suspense>
        </div>
      </NextIntlClientProvider>
    </div>
  );
};

export default ProfilePage;