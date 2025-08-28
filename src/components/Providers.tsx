// src/components/Providers.tsx
'use client';

import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LoaderProvider } from '@/context/LoaderContext';
import { AnalyticsProvider } from '@/context/AnalyticsContext';
import { usePathname } from 'next/navigation';
import { LocaleProvider } from '@/context/LocaleContext';
import { ConsentProvider } from '@/context/ConsentContext';
import BackgroundDecoration from '@/components/BackgroundDecoration';
import GlobalLoader from '@/components/GlobalLoader';
import CookieConsent from './CookieConsent';
//import GoogleAnalytics from './GoogleAnalytics';
//import ClarityAnalytics from './ClarityAnalytics';

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
                  {/*<GoogleAnalytics />*/}
                  {/*<ClarityAnalytics />*/}
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
