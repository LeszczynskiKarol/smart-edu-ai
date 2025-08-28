// src/utils/analytics.ts
import { v4 as uuidv4 } from 'uuid';
import { EventType } from '../context/AnalyticsContext';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  networkLatency: number;
  memoryUsage: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

interface SessionData {
  startTime: Date;
  endTime: Date;
  duration: number;
  isActive: boolean;
  lastActivity: Date;
}

interface UserContext {
  isLoggedIn: boolean;
  userRole: string;
  lastVisit: Date;
  visitCount: number;
}

const getPerformanceMetrics = (): Partial<PerformanceMetrics> => {
  if (!window.performance) return {};

  return {
    loadTime:
      window.performance.timing.loadEventEnd -
      window.performance.timing.navigationStart,
    renderTime:
      window.performance.timing.domComplete -
      window.performance.timing.domLoading,
    networkLatency:
      window.performance.timing.responseEnd -
      window.performance.timing.requestStart,
    memoryUsage: (window.performance as any).memory?.usedJSHeapSize,
    firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
    firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime,
  };
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

const getUserContext = (): UserContext => {
  const lastVisit =
    sessionStorage.getItem('lastVisit') || new Date().toISOString();
  const visitCount = parseInt(sessionStorage.getItem('visitCount') || '1', 10);

  return {
    isLoggedIn: !!localStorage.getItem('token'),
    userRole: 'client', // można pobrać z auth context jeśli potrzebne
    lastVisit: new Date(lastVisit),
    visitCount,
  };
};

// Funkcja do wysyłania danych do backendu
const sendToOurBackend = async (
  eventName: EventType,
  params: Record<string, any>,
  sessionId: string
) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const deviceInfo = {
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: window.screen.colorDepth,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
        eventType: eventName,
        eventData: {
          ...params,
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
        },
        deviceInfo,
        performanceMetrics: getPerformanceMetrics(),
        sessionData: getSessionData(),
        userContext: getUserContext(),
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error('Error sending analytics to backend:', error);
  }
};

let currentSessionId = sessionStorage.getItem('analyticsSessionId') || uuidv4();
sessionStorage.setItem('analyticsSessionId', currentSessionId);

export const sendAnalyticsEvent = async (
  eventName: EventType,
  params: Record<string, any> = {}
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }

  await sendToOurBackend(eventName, params, currentSessionId);
};

// Funkcja pomocnicza do sprawdzania czy użytkownik jest adminem
export const isUserAdmin = (user: any) => {
  return user?.role === 'admin';
};

export const analyticsEvents = {
  pageView: (path: string, isAdmin = false) =>
    sendAnalyticsEvent('pageView', {
      path,
      referrer: document.referrer,
      loadTime: window.performance.now(),
    }),

  click: (elementId: string, metadata = {}) =>
    sendAnalyticsEvent('click', {
      elementId,
      ...metadata,
    }),

  formInteraction: (
    formId: string,
    action: 'start' | 'complete' | 'error',
    metadata = {},
    isAdmin = false
  ) =>
    sendAnalyticsEvent('formSubmit', {
      formId,
      action,
      ...metadata,
    }),

  componentInteraction: (
    componentName: string,
    action: string,
    metadata = {}
  ) =>
    sendAnalyticsEvent('interaction', {
      component: componentName,
      action,
      ...metadata,
    }),

  apiCall: (
    endpoint: string,
    status: number,
    duration: number,
    isAdmin = false
  ) =>
    sendAnalyticsEvent('apiCall', {
      endpoint,
      status,
      duration,
    }),

  error: (errorType: string, message: string, stack?: string) =>
    sendAnalyticsEvent('error', {
      type: errorType,
      message,
      stack,
      url: window.location.href,
    }),

  payment: (
    transactionId: string,
    amount: number,
    status: string,
    metadata = {}
  ) =>
    sendAnalyticsEvent('payment', {
      transactionId,
      amount,
      status,
      ...metadata,
    }),

  order: (orderId: string, total: number, items: number, metadata = {}) =>
    sendAnalyticsEvent('order', {
      orderId,
      total,
      items,
      ...metadata,
    }),

  search: (query: string, results: number, metadata = {}) =>
    sendAnalyticsEvent('search', {
      query,
      results,
      ...metadata,
    }),

  filter: (filterType: string, value: string, metadata = {}) =>
    sendAnalyticsEvent('filter', {
      filterType,
      value,
      ...metadata,
    }),
};
