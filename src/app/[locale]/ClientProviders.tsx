// src/app/[locale]/ClientProviders.tsx
'use client';
import { Providers } from '@/components/Providers';
import React, { useEffect } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { usePathname } from 'next/navigation';

interface ClientProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
}

function ClientProvidersContent({ children }: { children: React.ReactNode }) {
  const { trackEvent } = useAnalytics();
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes('/admin');

  useEffect(() => {
    if (isAdminRoute) return;

    const timeoutId = setTimeout(() => {
      const originalReferrer = sessionStorage.getItem('originalReferrer');
      const mappedReferrer = sessionStorage.getItem('firstReferrer');

      trackEvent('pageView', {
        action: 'page_load',
        path: pathname,
        component: 'App',
        referrer: originalReferrer || document.referrer,
        source: mappedReferrer || 'direct',
      });
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  return <>{children}</>;
}

export function ClientProviders({
  children,
  locale,
  messages,
}: ClientProvidersProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes('/admin');

  if (isAdminRoute) {
    return children;
  }

  return (
    <Providers locale={locale} messages={messages}>
      <ClientProvidersContent>{children}</ClientProvidersContent>
    </Providers>
  );
}
