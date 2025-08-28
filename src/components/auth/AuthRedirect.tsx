// src/components/auth/AuthRedirect.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const AuthRedirect: React.FC<{ children: React.ReactNode; currentPath: string }> = ({ children, currentPath }) => {
  const { user, loading, getToken } = useAuth();
  const router = useRouter();
  const authCheckPerformed = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (authCheckPerformed.current) return;

      const token = getToken();
      if (!token) {
        authCheckPerformed.current = true;
        router.push('/login');
      }
    };

    if (!loading) {
      checkAuth();
    }
  }, [loading, getToken, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default AuthRedirect;
 
