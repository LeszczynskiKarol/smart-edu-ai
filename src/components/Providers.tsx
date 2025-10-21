// src/components/Providers.tsx
'use client';

import BackgroundDecoration from '@/components/BackgroundDecoration';
import GlobalLoader from '@/components/GlobalLoader';
import { AnalyticsProvider } from '@/context/AnalyticsContext';
import { AuthProvider } from '@/context/AuthContext';
import { ConsentProvider } from '@/context/ConsentContext';
import { LoaderProvider } from '@/context/LoaderContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';
import React from 'react';
import CookieConsent from './CookieConsent';
import GoogleAnalytics from './GoogleAnalytics';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes('/admin');

  if (isAdminRoute) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <AuthProvider>
              <LoaderProvider>{children}</LoaderProvider>
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ConsentProvider>
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <AuthProvider>
              <AnalyticsProvider>
                <LoaderProvider>
                  <GoogleAnalytics />

                  <BackgroundDecoration />
                  <GlobalLoader />
                  {children}
                  <CookieConsent />
                </LoaderProvider>
              </AnalyticsProvider>
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </ConsentProvider>
    </NextIntlClientProvider>
  );
}
