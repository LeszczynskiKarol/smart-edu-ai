// src/app/[locale]/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ZMIEŃ URL NA POPRAWNY!
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/admin-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      console.log('Login response:', data); // Debug

      if (data.success) {
        localStorage.setItem('token', data.token);
        // Zapisz pełne dane użytkownika
        localStorage.setItem('user', JSON.stringify(data.user));

        // Wymuś odświeżenie auth context
        window.dispatchEvent(new Event('storage'));

        // Przekieruj
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Nieprawidłowe dane logowania');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Wystąpił błąd podczas logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <html lang="pl">
      <head>
        <title>Admin Login</title>
      </head>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-5 text-center">
              Panel Administracyjny
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-1 font-medium">
                  Hasło
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Logowanie...' : 'Zaloguj się'}
              </button>
            </form>
          </div>
        </div>
      </body>
    </html>
  );
}
