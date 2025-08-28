// src/hooks/useTracking.ts
import { useEffect } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import type { EventType } from '../context/AnalyticsContext';
import { useAuth } from '../context/AuthContext';

interface Metadata {
  [key: string]: any;
}

export const useTracking = (
  componentName: string,
  options: { skipMountTracking?: boolean } = {}
) => {
  const { trackEvent } = useAnalytics();
  const { user } = useAuth();
  const startTime = Date.now();
  const isAdmin = user?.role === 'admin';
  const { skipMountTracking } = options;

  useEffect(() => {
    if (skipMountTracking || isAdmin) {
      return;
    }

    return () => {
      if (isAdmin) return;
    };
  }, [componentName, trackEvent, isAdmin, skipMountTracking]);

  // Wszystkie funkcje śledzące zwracamy niezależnie od roli, ale wewnętrznie sprawdzamy isAdmin
  const trackClick = (elementId: string, metadata: Metadata = {}) => {
    if (isAdmin) {
      console.log('Admin - pomijam śledzenie kliknięcia:', elementId);
      return;
    }

    trackEvent('click' as EventType, {
      component: componentName,
      elementId,
      metadata,
      timestamp: new Date().toISOString(),
    });
  };

  const trackInteraction = (action: string, metadata: Metadata = {}) => {
    if (isAdmin) {
      console.log('Admin - skipping interaction tracking');
      return;
    }

    trackEvent('interaction' as EventType, {
      component: componentName,
      action,
      metadata,
      timestamp: new Date().toISOString(),
    });
  };

  const trackForm = (
    formId: string,
    action: 'start' | 'submit' | 'error',
    metadata = {}
  ) => {
    if (isAdmin) {
      console.log('Admin - skipping form tracking');
      return;
    }

    trackEvent('formSubmit' as EventType, {
      component: componentName,
      formId,
      action,
      metadata,
      timestamp: new Date().toISOString(),
    });
  };

  const trackNavigation = (from: string, to: string, metadata = {}) => {
    if (isAdmin) {
      console.log('Admin - skipping navigation tracking');
      return;
    }

    trackEvent('navigation' as EventType, {
      component: componentName,
      from,
      to,
      metadata,
      timestamp: new Date().toISOString(),
    });
  };

  const trackPerformance = () => {
    if (isAdmin) {
      console.log('Admin - skipping performance tracking');
      return;
    }

    if (window.performance) {
      const metrics = {
        loadTime:
          window.performance.timing.loadEventEnd -
          window.performance.timing.navigationStart,
        domReady:
          window.performance.timing.domContentLoadedEventEnd -
          window.performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
        firstContentfulPaint:
          performance.getEntriesByType('paint')[1]?.startTime,
      };

      trackEvent('performance' as EventType, {
        component: componentName,
        metrics,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Śledzenie interakcji z modalnymi
  const trackModal = (
    action: 'open' | 'close',
    modalId: string,
    metadata = {}
  ) => {
    if (isAdmin) {
      console.log('Admin - skipping modal tracking');
      return;
    }

    trackEvent('interaction' as EventType, {
      // Zmień typ na 'interaction'
      component: componentName,
      action: `modal_${action}`,
      modalId,
      metadata,
    });
  };

  // Śledzenie interakcji z formularzami
  const trackFormField = (
    fieldId: string,
    action: 'focus' | 'blur' | 'change',
    value?: string
  ) => {
    if (isAdmin) {
      console.log('Admin - skipping form field interactions');
      return;
    }

    trackEvent('formInteraction' as EventType, {
      component: componentName,
      fieldId,
      action,
      value: value ? value.substring(0, 100) : undefined,
    });
  };

  // Śledzenie operacji CRUD
  const trackCRUD = (
    action: 'create' | 'read' | 'update' | 'delete',
    itemId: string,
    metadata = {}
  ) => {
    if (isAdmin) {
      console.log('Admin - skipping crud tracking');
      return;
    }

    trackEvent(action as EventType, {
      component: componentName,
      itemId,
      metadata,
    });
  };

  // Śledzenie filtrowania i sortowania
  const trackDataOperation = (operation: 'sort' | 'filter', params: any) => {
    if (isAdmin) {
      console.log('Admin - skipping filtering tracking');
      return;
    }

    trackEvent(operation as EventType, {
      component: componentName,
      params,
    });
  };

  // Śledzenie błędów
  const trackError = (error: Error, context: string) => {
    if (isAdmin) {
      console.log('Admin - skipping error tracking');
      return;
    }

    trackEvent('error' as EventType, {
      component: componentName,
      errorMessage: error.message,
      errorStack: error.stack,
      context,
    });
  };

  // Śledzenie wydajności
  const trackPerformanceMetric = (metricName: string, value: number) => {
    if (isAdmin) {
      console.log('Admin - skipping performance tracking');
      return;
    }

    trackEvent('performance' as EventType, {
      component: componentName,
      metric: metricName,
      value,
    });
  };

  return {
    trackModal,
    trackFormField,
    trackCRUD,
    trackDataOperation,
    trackError,
    trackPerformanceMetric,
    trackNavigation,
    trackPerformance,
    trackClick,
    trackInteraction,
    trackForm,
  };
};
