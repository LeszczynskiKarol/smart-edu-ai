// src/app/layout.tsx
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <AuthProvider>
          <LocaleProvider initialLocale="en">{children}</LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
