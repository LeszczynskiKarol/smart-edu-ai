// src/hooks/useHomeTracking.ts
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import type { EventType } from '../context/AnalyticsContext';
import { useAuth } from '@/context/AuthContext';

export const useHomeTracking = (sectionName: string) => {
  const { trackEvent: analyticsTrackEvent } = useAnalytics();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const trackEvent = (eventType: EventType, eventData: Record<string, any>) => {
    if (isAdmin) {
      console.log('Admin - skipping home tracking');
      return;
    }
    analyticsTrackEvent(eventType, {
      ...eventData,
      section: sectionName,
      timestamp: new Date().toISOString(),
    });
  };

  useEffect(() => {
    return () => {
      if (elementRef.current && intersectionObserver.current) {
        intersectionObserver.current.unobserve(elementRef.current);
      }
    };
  }, []);

  return {
    trackEvent,
    trackCTAClick: (ctaId: string, metadata = {}) => {
      trackEvent('ctaClick', { ctaId, ...metadata });
    },
    trackInteraction: (action: string, metadata = {}) => {
      trackEvent('interaction', { action, ...metadata });
    },
  };
};
