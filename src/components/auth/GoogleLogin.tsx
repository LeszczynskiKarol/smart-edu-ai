'use client';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useTheme } from '@/context/ThemeContext';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

interface GoogleLoginResponse {
  credential: string;
}

const GoogleLogin: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { trackEvent } = useHomeTracking('GoogleLogin');
  const { getSessionId } = useAnalytics();
  const { updateUser } = useAuth();

  // ✅ useRef przechowuje aktualną funkcję BEZ triggerowania re-renderów
  const handleGoogleAuthRef =
    useRef<(response: GoogleLoginResponse) => Promise<void>>();

  // ✅ Aktualizuj ref przy każdym renderze (bez triggerowania useEffect)
  handleGoogleAuthRef.current = async (response: GoogleLoginResponse) => {
    console.log('🔍 Google callback fired!');
    console.log('🔍 Token length:', response.credential?.length);
    console.log('🔍 Token preview:', response.credential?.substring(0, 50));

    try {
      const firstReferrer = sessionStorage.getItem('firstReferrer');
      const originalReferrer = sessionStorage.getItem('originalReferrer');

      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/google-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: response.credential,
            sessionId: getSessionId(),
            path: window.location.pathname,
            firstReferrer: firstReferrer,
            originalReferrer: originalReferrer,
          }),
        }
      );

      const data = await result.json();
      console.log('📡 Backend response:', data.success ? 'SUCCESS' : 'FAILED');

      if (data.success) {
        localStorage.setItem('token', data.token);
        updateUser(data.user);

        if (data.isNewUser) {
          trackEvent('conversion_registration_google', {
            component: 'GoogleLogin',
            action: 'registration_success',
            path: '/register',
            value: 1,
            status: 'completed',
            source: firstReferrer || 'unknown',
            metadata: {
              userId: data.user.id,
              registrationType: 'google',
            },
          });

          if (window.ttq) {
            const hashedEmail = await crypto.subtle
              .digest('SHA-256', new TextEncoder().encode(data.user.email))
              .then((hash) => {
                return Array.from(new Uint8Array(hash))
                  .map((b) => b.toString(16).padStart(2, '0'))
                  .join('');
              });

            window.ttq.identify({
              email: hashedEmail,
              external_id: data.user.id,
            });

            window.ttq.track('CompleteRegistration', {
              contents: [
                {
                  content_type: 'registration',
                  content_name: 'google_registration',
                  content_id: data.user.id,
                },
              ],
              currency: 'USD',
              value: 0.3,
              event_id: `reg_google_${Date.now()}_${data.user.id}`,
            });
          }

          router.push('/onboarding');
        } else {
          trackEvent('user_login', {
            component: 'GoogleLogin',
            source: 'google',
            isNewUser: false,
            success: true,
          });
          router.push('/dashboard');
        }
      } else {
        console.error('❌ Google auth failed:', data.message);
        trackEvent('formError', {
          component: 'GoogleLogin',
          source: 'google',
          errorType: 'auth_failed',
        });
      }
    } catch (error) {
      console.error('❌ Google auth error:', error);
      trackEvent('formError', {
        component: 'GoogleLogin',
        source: 'google',
        errorType: 'system_error',
      });
    }
  };

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    console.log('🔍 Client ID:', clientId ? 'SET' : 'NOT SET');

    if (!clientId) {
      console.error('❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID not set!');
      return;
    }

    // Sprawdź czy skrypt już istnieje
    let script = document.getElementById(
      'google-auth-script'
    ) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = 'google-auth-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onerror = () => {
        console.error('❌ Failed to load Google script');
      };

      document.head.appendChild(script);
    }

    const initializeGoogle = () => {
      console.log('✅ Initializing Google');

      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: GoogleLoginResponse) => {
              // ✅ Wywołaj aktualną wersję funkcji przez ref
              handleGoogleAuthRef.current?.(response);
            },
          });

          const buttonDiv = document.getElementById('googleButton');
          if (buttonDiv) {
            window.google.accounts.id.renderButton(buttonDiv, {
              size: 'large',
              type: 'standard',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
            });
            console.log('✅ Google button rendered');
          }
        } catch (error) {
          console.error('❌ Google init error:', error);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      script.onload = initializeGoogle;
    }

    // ✅ NIE usuwaj skryptu przy unmount - to powoduje pulsowanie
    // Google SDK może być współdzielony między komponentami
  }, []); // ✅ PUSTE DEPENDENCIES - uruchom tylko raz!

  return <div id="googleButton" className="w-full flex justify-center" />;
};

export default GoogleLogin;
