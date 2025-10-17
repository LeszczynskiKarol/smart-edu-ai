// src/app/[locale]/admin/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user, loading, refreshUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      await refreshUserData();
    };
    initializeAuth();
  }, [refreshUserData]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Ładowanie...
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const dashboardItems = [
    {
      title: 'Dodaj Nowy Artykuł',
      link: '/admin/articles/new',
      buttonText: 'Dodaj artykuł',
    },
    {
      title: 'Dodaj Nową Kategorię',
      link: '/admin/categories/new',
      buttonText: 'Dodaj kategorię',
    },
    {
      title: 'Zarządzaj Użytkownikami',
      link: '/admin/users',
      buttonText: 'Zobacz użytkowników',
    },
    {
      title: 'Zarządzaj Zamówieniami',
      link: '/admin/orders',
      buttonText: 'Zobacz zamówienia',
    },
    {
      title: 'Zarządzaj Przykładami Prac', // NOWA SEKCJA
      link: '/admin/dashboard/thesis-examples',
      buttonText: 'Zobacz przykłady',
    },
    {
      title: 'Dodaj Nowy Przykład Pracy', // NOWA SEKCJA
      link: '/admin/dashboard/thesis-examples/new',
      buttonText: 'Dodaj przykład',
    },
    {
      title: 'Analityka',
      link: '/admin/analytics',
      buttonText: 'Zobacz analitykę',
    },
    {
      title: 'Zarządzaj Stronami',
      link: '/admin/dashboard/pages',
      buttonText: 'Zobacz strony',
    },
    {
      title: 'Dodaj Nową Stronę',
      link: '/admin/dashboard/pages/new',
      buttonText: 'Dodaj stronę',
    },
  ];

  return (
    <Layout title="Panel Administracyjny">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold mb-8 text-primary-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Panel Administracyjny
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {item.title}
              </h2>
              <Link
                href={item.link}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
              >
                {item.buttonText}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
