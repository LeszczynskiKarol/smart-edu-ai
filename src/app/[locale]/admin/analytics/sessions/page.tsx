// src/app/[locale]/admin/analytics/sessions/page.tsx
'use client';

import Layout from '@/components/layout/Layout';
import SessionsAnalytics from '@/components/analytics/SessionsAnalytics';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const SessionsAnalyticsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Zmień kolejność warunków
  if (!loading && (!user || user.role !== 'admin')) {
    router.push('/admin/login');
    return null;
  }

  // Nie zwracaj loading podczas sprawdzania
  return (
    <Layout title="Analiza Sesji">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Szczegółowa Analiza Sesji</h1>
        <SessionsAnalytics />
      </div>
    </Layout>
  );
};

export default SessionsAnalyticsPage;
