// src/app/[locale]/admin/AdminLayoutClient.tsx
'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LoaderProvider } from '@/context/LoaderContext';
import { LocaleProvider } from '@/context/LocaleContext';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
}

export default function AdminLayoutClient({
  children,
  locale,
  messages,
}: AdminLayoutClientProps) {
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
