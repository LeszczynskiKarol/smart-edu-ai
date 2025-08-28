// src/components/auth/TikTokLogin.tsx
'use client';
import React from 'react';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useAuth } from '../../context/AuthContext';

const TikTokLogin: React.FC = () => {
  const { trackEvent } = useHomeTracking('TikTokLogin');
  const { getSessionId } = useAnalytics();
  const { updateUser } = useAuth();

  const handleTikTokLogin = () => {
    try {
      console.log('Próba logowania TikTok');
      console.log('Client Key:', process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY);
      console.log('Redirect URI:', process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI);
      console.log('State:', getSessionId());

      if (!process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY) {
        console.error('Brak TIKTOK_CLIENT_KEY');
        return;
      }

      const authUrl = 'https://www.tiktok.com/auth/authorize';
      const params = new URLSearchParams({
        client_key: 'aw2acvljdvio7nis', // tymczasowo na sztywno
        response_type: 'code',
        scope: 'user.info.basic',
        redirect_uri: 'https://www.smart-edu.ai/api/users/tiktok-callback',
        state: getSessionId(),
      });

      const fullUrl = `${authUrl}?${params.toString()}`;
      console.log('Pełny URL autoryzacji:', fullUrl);

      window.location.href = fullUrl;
    } catch (error) {
      console.error('Błąd podczas inicjowania logowania TikTok:', error);
    }
  };

  return (
    <button
      onClick={handleTikTokLogin}
      className="btn w-full bg-white hover:bg-gray-200 text-black"
    >
      <img
        src="/images/tiktok-logo.svg"
        alt="TikTok"
        className="w-10 h-10 mr-2"
      />
      Kontynuuj z TikTok
    </button>
  );
};

export default TikTokLogin;
