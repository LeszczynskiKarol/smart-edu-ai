// src/app/[locale]/register/RegisterClient.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '../../../context/AuthContext';
import { useAnalytics } from '../../../context/AnalyticsContext';

export default function RegisterClient() {
  const { user, loading } = useAuth();
  const { trackEvent } = useAnalytics();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const pageViewTracked = useRef(false);

  useEffect(() => {
    if (!pageViewTracked.current) {
      pageViewTracked.current = true;
      trackEvent('pageView', {
        action: 'page_load',
        path: '/register',
        component: 'RegisterForm',
        referrer: document.referrer || sessionStorage.getItem('lastPath') || '',
      });
    }
  }, []);

  useEffect(() => {
    // Jeśli użytkownik jest zalogowany
    if (user && !hasRedirected.current) {
      hasRedirected.current = true;

      // Sprawdź czy jest w trakcie weryfikacji
      const pendingVerification = sessionStorage.getItem('pendingVerification');

      if (pendingVerification) {
        // Jeśli jest w trakcie weryfikacji, zostaw go na stronie weryfikacji
        router.push('/verification');
      } else if (!user.isVerified) {
        // Jeśli nie jest zweryfikowany, wyślij na weryfikację
        router.push('/verification');
      } else {
        // Jeśli jest zweryfikowany, wpuść do dashboardu
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <RegisterForm />;
}
