// src/context/AnalyticsContext.tsx
'use client';
import React, { useEffect, createContext, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { mapReferrerToSource } from '../utils/referrerMapping';

export type EventType =
  | 'pageView'
  | 'apiCall'
  | 'formSubmit'
  | 'error'
  | 'formError'
  | 'user_login'
  | 'navigation'
  | 'interaction'
  | 'payment'
  | 'order'
  | 'search'
  | 'filter'
  | 'modalOpen'
  | 'modalClose'
  | 'dropdownToggle'
  | 'copy'
  | 'download'
  | 'upload'
  | 'delete'
  | 'edit'
  | 'save'
  | 'share'
  | 'print'
  | 'resize'
  | 'sort'
  | 'export'
  | 'import'
  | 'zoom'
  | 'drag'
  | 'drop'
  | 'contextMenu'
  | 'keyPress'
  | 'focus'
  | 'blur'
  | 'idle'
  | 'performance'
  | 'warning'
  | 'success'
  | 'info'
  | 'session_start'
  | 'session_end'
  | 'engagement'
  | 'heroInteraction'
  | 'ctaClick'
  | 'conversion_registration_google'
  | 'conversion_payment_top_up'
  | 'conversion_payment_order'
  | 'click'
  | 'logo_click'
  | 'conversion_registration_standard'
  | 'serviceInteraction';

interface AnalyticsContextType {
  trackEvent: (
    eventType: EventType,
    eventData: Record<string, any>
  ) => Promise<void>;
  startSession: () => void;
  endSession: () => void;
  getSessionId: () => string;
}

interface SessionData {
  startTime: Date;
  endTime: Date;
  duration: number;
  isActive: boolean;
  lastActivity: Date;
  firstReferrer?: string;
  referrer?: string;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  networkLatency: number;
  memoryUsage: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

interface UserContext {
  isLoggedIn: boolean;
  userRole: string;
  lastVisit: Date;
  visitCount: number;
  sessionId: string;
  isReturningUser: boolean;
  referrer: string;
  landingPage: string;
  isAdmin?: boolean;
}

interface ActivityData {
  userId: string;
  sessionId: string;
  eventType: EventType;
  eventData: {
    path: string;
    timestamp: string;
    component?: string;
    action?: string;
    duration?: number;
    status?: string;
    formId?: string;
    elementId?: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
    userChanged?: boolean;
    referrer?: string;
    source?: string;
    campaignData?: {
      campaign?: string;
      source?: string;
      device?: string;
    };
  };
  deviceInfo: {
    screenResolution: string;
    viewportSize: string;
    colorDepth: number;
    timeZone: string;
    browser?: string;
    os?: string;
    device?: string;
    language: string;
  };
  sessionData: SessionData;
  performanceMetrics: PerformanceMetrics;
  userContext: UserContext;
  userAgent: string;
}

const getPerformanceMetrics = (): PerformanceMetrics => {
  if (!window.performance || !window.performance.timing) {
    return {
      loadTime: 0,
      renderTime: 0,
      networkLatency: 0,
      memoryUsage: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
    };
  }

  // Zabezpieczamy się przed ujemnymi wartościami
  const metrics: PerformanceMetrics = {
    loadTime: Math.max(
      0,
      window.performance.timing.loadEventEnd -
        window.performance.timing.navigationStart
    ),
    renderTime: Math.max(
      0,
      window.performance.timing.domComplete -
        window.performance.timing.domLoading
    ),
    networkLatency: Math.max(
      0,
      window.performance.timing.responseEnd -
        window.performance.timing.requestStart
    ),
    memoryUsage: (window.performance as any).memory?.usedJSHeapSize || 0,
    firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
    firstContentfulPaint:
      performance.getEntriesByType('paint')[1]?.startTime || 0,
  };

  // Filtrujemy nierealne wartości
  (Object.keys(metrics) as Array<keyof PerformanceMetrics>).forEach((key) => {
    if (metrics[key] < 0 || metrics[key] > 60000) {
      metrics[key] = 0;
    }
  });

  return metrics;
};

const getSessionData = (): SessionData => {
  const sessionStart =
    sessionStorage.getItem('sessionStart') || new Date().toISOString();
  const now = new Date();
  return {
    startTime: new Date(sessionStart),
    endTime: now,
    duration: now.getTime() - new Date(sessionStart).getTime(),
    isActive: true,
    lastActivity: now,
  };
};

const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: async () => {},
  startSession: () => {},
  endSession: () => {},
  getSessionId: () => '',
});

export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: ReactNode;
}

const SESSION_TIMEOUT = 30 * 60 * 1000;

const isSessionValid = (): boolean => {
  const lastActivity = localStorage.getItem('lastActivityTime');
  if (!lastActivity) return false;

  const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
  return timeSinceLastActivity < SESSION_TIMEOUT;
};

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const sessionId = React.useRef<string>('');
  const hasInitialized = React.useRef(false);
  const isFirstMount = React.useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      if (!sessionStorage.getItem('firstReferrer')) {
        const ref = document.referrer;
        sessionStorage.setItem('originalReferrer', ref);
        sessionStorage.setItem('firstReferrer', mapReferrerToSource(ref));
      }
      isFirstMount.current = false;
    }
  }, []);
  const initializeSessionId = React.useCallback(() => {
    // Sprawdź czy istnieje zapisany sessionId i czy sesja jest wciąż ważna
    const savedSessionId = localStorage.getItem('analyticsSessionId');
    const lastActivity = localStorage.getItem('lastActivityTime');

    if (savedSessionId && lastActivity && isSessionValid()) {
      sessionId.current = savedSessionId;
    } else {
      // Utwórz nowy sessionId tylko jeśli poprzednia sesja wygasła
      sessionId.current = uuidv4();
      localStorage.setItem('analyticsSessionId', sessionId.current);
    }

    // Aktualizuj czas ostatniej aktywności
    localStorage.setItem('lastActivityTime', Date.now().toString());
  }, []);

  // Okresowe odświeżanie czasu ostatniej aktywności
  useEffect(() => {
    const updateActivityTime = () => {
      localStorage.setItem('lastActivityTime', Date.now().toString());
    };

    // Aktualizuj przy interakcji użytkownika
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, updateActivityTime);
    });

    // Aktualizuj co minutę jeśli strona jest aktywna
    const interval = setInterval(updateActivityTime, 60000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivityTime);
      });
      clearInterval(interval);
    };
  }, []);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const trackEvent = async (
    eventType: EventType,
    eventData: Record<string, any>
  ) => {
    if (user?.role === 'admin') {
      console.log('Admin user - tracking disabled');
      return;
    }
    const debouncedEvents = [
      'pageView',
      'modal_open',
      'modal_close',
      'navigation',
      'logo_click',
    ];

    // 3. Jeśli event jest na liście do debouncowania, używamy wersji z debounce
    if (debouncedEvents.includes(eventType)) {
      // Używamy debouncedTrackEvent tylko dla określonych typów
      await debouncedTrackEvent(eventType, eventData);
      return;
    }

    const lastPath = sessionStorage.getItem('currentPath');
    // Aktualna ścieżka
    const currentPath = window.location.pathname;

    let referrer = '';
    if (eventType === 'pageView') {
      // Dla pageView używamy lastPath jako referrer
      referrer = lastPath || document.referrer;
      // Zapisz aktualną ścieżkę
      sessionStorage.setItem('currentPath', currentPath);
    } else if (eventType === 'navigation') {
      // Dla nawigacji używamy aktualnej ścieżki jako referrer
      referrer = currentPath;
    }

    const userContext: UserContext = {
      isLoggedIn: !!user,
      userRole: user?.role || 'anonymous',
      lastVisit: new Date(
        localStorage.getItem('lastVisit') || new Date().toISOString()
      ),
      visitCount: parseInt(localStorage.getItem('visitCount') || '1', 10),
      sessionId: sessionId.current,
      isReturningUser: !!localStorage.getItem('lastVisit'),
      referrer:
        sessionStorage.getItem('originalReferrer') || document.referrer || '',
      landingPage: sessionStorage.getItem('landingPage') || currentPath,
    };

    if (eventType === 'pageView') {
      sessionStorage.setItem('lastPath', window.location.pathname);
      sessionStorage.setItem('landingPage', window.location.pathname);
    }

    const activityData: ActivityData = {
      userId: user?.id ? user.id : 'anonymous',
      sessionId: sessionId.current,
      eventType,
      eventData: {
        ...eventData,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        referrer:
          eventData.referrer ||
          sessionStorage.getItem('originalReferrer') ||
          '',
        source:
          eventData.source ||
          sessionStorage.getItem('firstReferrer') ||
          'direct',
      },
      userAgent: navigator.userAgent,
      deviceInfo: {
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        colorDepth: window.screen.colorDepth,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      },
      sessionData: {
        ...eventData.sessionData,
        firstReferrer: sessionStorage.getItem('firstReferrer'),
        referrer: sessionStorage.getItem('originalReferrer'),
      },
      performanceMetrics: getPerformanceMetrics(),
      userContext: {
        ...userContext,
        isAdmin: user?.role === 'admin', // Dodaj też tutaj
      },
    };

    if (eventType === 'pageView' && user?.id) {
      activityData.eventData.userChanged = true;
    }

    if (eventType === 'payment') {
      activityData.eventData = {
        ...eventData,
        action: eventData.action || 'payment_pending',
        component: 'Stripe',
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        metadata: {
          ...eventData.metadata,
          conversionType: eventData.metadata?.conversionType || 'top_up',
          timestamp: new Date().toISOString(),
          status: 'pending',
        },
      };
    }

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }),
        },
        body: JSON.stringify(activityData),
      });

      // Aktualizuj dane sesji
      if (eventType === 'pageView' || eventType === 'navigation') {
        sessionStorage.setItem('lastPath', currentPath);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const debouncedTrackEvent = debounce(
    async (eventType: EventType, eventData: Record<string, any>) => {
      // Ta sama logika co w głównym trackEvent, ale bez sprawdzania czy event powinien być zdebounceowany
      const lastPath = sessionStorage.getItem('currentPath');
      const currentPath = window.location.pathname;

      let referrer = '';
      if (eventType === 'pageView') {
        // Dla pageView używamy lastPath jako referrer
        referrer = lastPath || document.referrer;
        // Zapisz aktualną ścieżkę
        sessionStorage.setItem('currentPath', currentPath);
      } else if (eventType === 'navigation') {
        // Dla nawigacji używamy aktualnej ścieżki jako referrer
        referrer = currentPath;
      }

      const userContext: UserContext = {
        isLoggedIn: !!user,
        userRole: user?.role || 'anonymous',
        lastVisit: new Date(
          localStorage.getItem('lastVisit') || new Date().toISOString()
        ),
        visitCount: parseInt(localStorage.getItem('visitCount') || '1', 10),
        sessionId: sessionId.current,
        isReturningUser: !!localStorage.getItem('lastVisit'),
        referrer:
          sessionStorage.getItem('originalReferrer') || document.referrer || '',
        landingPage: sessionStorage.getItem('landingPage') || currentPath,
      };
      if (eventType === 'pageView') {
        sessionStorage.setItem('lastPath', window.location.pathname);
        sessionStorage.setItem('landingPage', window.location.pathname);
      }

      const activityData: ActivityData = {
        userId: user?.id || 'anonymous',
        sessionId: sessionId.current,
        eventType,
        eventData: {
          ...eventData,
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
          referrer: referrer || '',
        },
        userAgent: navigator.userAgent,
        deviceInfo: {
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
          colorDepth: window.screen.colorDepth,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
        },
        sessionData: getSessionData(),
        performanceMetrics: getPerformanceMetrics(),
        userContext,
      };

      if (eventType === 'pageView' && user?.id) {
        activityData.eventData.userChanged = true;
      }

      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(user && {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
          },
          body: JSON.stringify(activityData),
        });

        // Aktualizuj dane sesji
        if (eventType === 'pageView' || eventType === 'navigation') {
          sessionStorage.setItem('lastPath', currentPath);
        }
      } catch (error) {
        console.error('Error tracking event:', error);
      }
    },
    300
  );

  useEffect(() => {
    if (!localStorage.getItem('analyticsSessionId')) {
      localStorage.setItem('analyticsSessionId', sessionId.current);
    }
  }, []);

  const getSessionId = React.useCallback(() => {
    return sessionId.current;
  }, []);

  // Efekt śledzący zmianę użytkownika
  useEffect(() => {
    if (user?.id) {
      trackEvent('user_login', {
        previousUserId: 'anonymous',
        newUserId: user.id,
        sessionId: sessionId.current,
        component: 'LoginForm',
      });
    }
  }, [user?.id]);

  const startSession = React.useCallback(() => {
    if (hasInitialized.current) return;

    initializeSessionId();

    // Jeśli to nowa sesja (nie kontynuacja poprzedniej)
    if (!isSessionValid()) {
      const visitCount =
        parseInt(localStorage.getItem('visitCount') || '0', 10) + 1;
      localStorage.setItem('visitCount', visitCount.toString());
      localStorage.setItem('lastVisit', new Date().toISOString());

      trackEvent('pageView', {
        action: 'session_start',
        path: window.location.pathname,
        isNewSession: true,
      });
    }

    hasInitialized.current = true;
  }, []);

  // Zakończenie sesji
  const endSession = React.useCallback(() => {
    if (!hasInitialized.current) return;

    const sessionStart = sessionStorage.getItem('sessionStart');
    if (sessionStart) {
      const sessionDuration =
        new Date().getTime() - new Date(sessionStart).getTime();
      if (sessionDuration > 1000) {
        // tylko jeśli sesja trwała dłużej niż 1 sekunda
        trackEvent('session_end', { duration: sessionDuration });
      }
    }
  }, []);

  // Nasłuchuj na zamknięcie okna/zakładki
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      // Sprawdzamy, czy nie jesteśmy w trakcie płatności
      if (!localStorage.getItem('payment_pending')) {
        endSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [endSession]);

  useEffect(() => {
    startSession();
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{ trackEvent, getSessionId, startSession, endSession }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
