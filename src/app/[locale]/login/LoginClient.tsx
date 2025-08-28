// src/app/[locale]/login/LoginClient.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm'
import { useAuth } from '../../../context/AuthContext'
import { useAnalytics } from '../../../context/AnalyticsContext';

export default function LoginClient() {
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
        path: '/login',
        component: 'LoginForm',
        referrer: document.referrer,
      });
    }
  }, []);


  useEffect(() => {
    if (user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <LoginForm />
}
