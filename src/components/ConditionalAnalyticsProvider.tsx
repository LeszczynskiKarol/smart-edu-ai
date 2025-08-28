// src/components/ConditionalAnalyticsProvider.tsx
'use client';

import { usePathname } from 'next/navigation';
import { AnalyticsProvider } from '@/context/AnalyticsContext';
import { useAuth } from '@/context/AuthContext';

interface ConditionalAnalyticsProviderProps {
  children: React.ReactNode;
}

export function ConditionalAnalyticsProvider({
  children,
}: ConditionalAnalyticsProviderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Sprawdzamy czy jesteśmy w panelu admina lub czy użytkownik jest adminem
  const isAdminContext =
    pathname?.startsWith('/admin') || user?.role === 'admin';

  // Jeśli jesteśmy w kontekście admina, nie opakowujemy w AnalyticsProvider
  if (isAdminContext) {
    return <>{children}</>;
  }

  // W przeciwnym razie używamy AnalyticsProvider
  return <AnalyticsProvider>{children}</AnalyticsProvider>;
}
