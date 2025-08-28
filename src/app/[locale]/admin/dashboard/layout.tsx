// src/app/[locale]/admin/dashboard/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.role || user.role !== 'admin') {
      router.push('/admin/login');
    }
  }, []);

  return <div>{children}</div>;
}
