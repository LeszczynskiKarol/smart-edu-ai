// src/components/GoogleAnalytics.tsx
'use client';
import { useEffect } from 'react';
import Script from 'next/script';
import { useAuth } from '../context/AuthContext';

export default function GoogleAnalytics() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const analyticsScript = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    const isEU = navigator.language.toLowerCase().includes('pl') || 
                 navigator.language.toLowerCase().startsWith('de');

    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'region': ['EU'],
        'wait_for_update': 2000
    });

    gtag('js', new Date());
    
    gtag('config', 'G-T1813ZQY64', {
        debug_mode: ${isAdmin},
        send_page_view: true,
        ${isAdmin ? "'traffic_type': 'internal'," : ''}
        allow_custom_scripts: true,
        campaign_tracking: true,
        link_attribution: true,
        transport_url: 'https://www.google-analytics.com' // Dodaj tę linię
    });

    ${isAdmin ? "gtag('set', 'user_properties', {'traffic_type': 'internal'});" : ''}
    
    gtag('set', {
      'allow_custom_scripts': true,
      'linker': {
        'domains': ['smart-edu.ai']
      }
    });
  `;

  useEffect(() => {
    if (isAdmin && typeof window !== 'undefined') {
      console.log(
        '🔧 Analytics w trybie administratora - ruch oznaczony jako wewnętrzny'
      );
    }
  }, [isAdmin]);

  return (
    <>
      {/* Google Analytics tag */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-T1813ZQY64"
        strategy="afterInteractive"
      />

      {/* Wspólny skrypt konfiguracyjny */}
      <Script id="google-analytics" strategy="afterInteractive">
        {analyticsScript}
      </Script>
    </>
  );
}
