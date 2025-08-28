// src/app/[locale]/admin/analytics/page.tsx
'use client';

import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import UserActivityDashboard from '@/components/analytics/UserActivityDashboard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const AnalyticsPage = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/admin/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Ładowanie...</div>;
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <Layout title="Analityka">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Panel Analityczny</h1>
                <UserActivityDashboard />
            </div>
        </Layout>
    );
};

export default AnalyticsPage;
