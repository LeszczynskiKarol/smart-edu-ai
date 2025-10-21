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
      title: '🔄 Automation Flow Control', // NOWY!
      link: '/admin/automation',
      buttonText: 'Zarządzaj automatyzacją',
      description: 'System kontroli przepływu zamówień i generowania tekstów',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    },
    {
      title: 'Dodaj Nowy Artykuł',
      link: '/admin/articles/new',
      buttonText: 'Dodaj artykuł',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    },
    {
      title: 'Dodaj Nową Kategorię',
      link: '/admin/categories/new',
      buttonText: 'Dodaj kategorię',
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
    },
    {
      title: 'Zarządzaj Użytkownikami',
      link: '/admin/users',
      buttonText: 'Zobacz użytkowników',
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
    },
    {
      title: 'Zarządzaj Zamówieniami',
      link: '/admin/orders',
      buttonText: 'Zobacz zamówienia',
      color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    },
    {
      title: 'Zarządzaj Przykładami Prac',
      link: '/admin/dashboard/thesis-examples',
      buttonText: 'Zobacz przykłady',
      color: 'bg-gradient-to-br from-indigo-500 to-purple-500',
    },
    {
      title: 'Dodaj Nowy Przykład Pracy',
      link: '/admin/dashboard/thesis-examples/new',
      buttonText: 'Dodaj przykład',
      color: 'bg-gradient-to-br from-pink-500 to-rose-500',
    },
    {
      title: 'Analityka',
      link: '/admin/analytics',
      buttonText: 'Zobacz analitykę',
      color: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    },
    {
      title: 'Zarządzaj Stronami',
      link: '/admin/dashboard/pages',
      buttonText: 'Zobacz strony',
      color: 'bg-gradient-to-br from-violet-500 to-purple-500',
    },
    {
      title: 'Dodaj Nową Stronę',
      link: '/admin/dashboard/pages/new',
      buttonText: 'Dodaj stronę',
      color: 'bg-gradient-to-br from-sky-500 to-blue-500',
    },
  ];

  return (
    <Layout title="Panel Administracyjny">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold mb-8 text-primary-800 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Panel Administracyjny
        </motion.h1>

        {/* Powitanie */}
        <motion.div
          className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">
            Witaj, {user.name}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Wybierz akcję z poniższych opcji zarządzania systemem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <motion.div
              key={index}
              className={`${item.color || 'bg-white dark:bg-gray-800'} p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-white`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>

              {item.description && (
                <p className="text-sm opacity-90 mb-4">{item.description}</p>
              )}

              <Link
                href={item.link}
                className="inline-block mt-2 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 font-medium"
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
