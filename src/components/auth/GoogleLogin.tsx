// src/components/auth/GoogleLogin.tsx

'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useHomeTracking } from '@/hooks/useHomeTracking';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '@/context/AnalyticsContext';

interface GoogleLoginResponse {
  credential: string;
}

const GoogleLogin: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { trackEvent } = useHomeTracking('GoogleLogin');
  const { getSessionId } = useAnalytics();
  const { updateUser } = useAuth();

  const handleGoogleAuth = async (response: GoogleLoginResponse) => {
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
          if (window.ttq && data.isNewUser) {
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
        console.error('Google auth failed:', data.message);
        trackEvent('formError', {
          component: 'GoogleLogin',
          source: 'google',
          errorType: 'auth_failed',
        });
      }
    } catch (error) {
      console.error('Google auth error:', error);
      trackEvent('formError', {
        component: 'GoogleLogin',
        source: 'google',
        errorType: 'system_error',
      });
    }
  };

  useEffect(() => {
    // Usunięcie starego skryptu Google, jeśli istnieje
    const existingScript = document.getElementById('google-auth-script');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }

    // Dodanie nowego skryptu Google
    const script = document.createElement('script');
    script.id = 'google-auth-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleGoogleAuth,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleButton')!,
          {
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      }
    };

    return () => {
      const scriptToRemove = document.getElementById('google-auth-script');
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [theme]);

  return <div id="googleButton" className="w-full flex justify-center" />;
};

export default GoogleLogin;
