// src/hooks/useAnalyticsData.ts
import { useState, useEffect } from 'react';
import type { SessionEvent } from '@/components/analytics/SessionDetailsModal';

interface ReferrerDetail {
  browser: string;
  device: string;
  os: string;
  timestamp: string;
}

interface ReferrerInfo {
  url: string;
  landingPage: string;
  source: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  count: number;
  details: ReferrerDetail[];
}

interface ConversionData {
  registrations: {
    summary: {
      standard: {
        total: number;
        avgTimeToRegister: number;
        uniqueUsers: number;
        distribution: {
          sources: string[];
          devices: string[];
          browsers: string[];
          paths: string[];
        };
        timeline: Array<{
          date: string;
          count: number;
          avgTimeToRegister: number;
        }>;
      };
      google: {
        total: number;
        avgTimeToRegister: number;
        uniqueUsers: number;
        distribution: {
          sources: string[];
          devices: string[];
          browsers: string[];
          paths: string[];
        };
        timeline: Array<{
          date: string;
          count: number;
          avgTimeToRegister: number;
        }>;
      };
    };
    referrerDetails: ReferrerInfo[];
    metrics: {
      conversionEfficiency: number;
      registrationSuccess: number;
      preferredMethod: string;
      peakRegistrationTime: {
        hour: number;
        count: number;
        trends: {
          morning: number;
          afternoon: number;
          evening: number;
          night: number;
        };
        distribution: Record<string, number>;
      };
      devicePreference: {
        device: string;
        percentage: number;
        distribution: Array<{
          device: string;
          count: number;
          percentage: number;
        }>;
      };
      retentionRate: {
        rates: {
          day1: { rate: number; returningUsers: number; totalUsers: number };
          day7: { rate: number; returningUsers: number; totalUsers: number };
          day30: { rate: number; returningUsers: number; totalUsers: number };
        };
        trend: string;
        summary: {
          shortTerm: number;
          mediumTerm: number;
          longTerm: number;
        };
      };
    };
  };
  payments: {
    summary: {
      topUp: {
        total: number;
        totalAmount: number;
        uniqueUsers: number;
        distribution: {
          sources: string[];
          sourceBreakdown: Array<{
            source: string;
            count: number;
            totalAmount: number;
            percentage: number;
          }>;
          devices: string[];
          browsers: string[];
          paymentMethods: string[];
          currencies: string[];
          peakHours: Array<{
            hour: number;
            count: number;
          }>;
          referrerDetails: Array<{
            url: string;
            landingPage: string;
            source: string;
            amount: number;
          }>;
        };
        timeline: Array<{
          date: string;
          count: number;
          totalAmount: number;
        }>;
        metrics: {
          avgOrderValue: number;
          repeatCustomerRate: number;
          successRate: number;
        };
      };
      order: {
        total: number;
        totalAmount: number;
        uniqueUsers: number;
        distribution: {
          paymentMethods: string[];
          currencies: string[];
          devices: string[];
          peakHours: number[];
          sourceBreakdown: Array<{
            source: string;
            count: number;
            totalAmount: number;
            percentage: number;
          }>;
          referrerDetails: Array<{
            url: string;
            landingPage: string;
            source: string;
            amount: number;
          }>;
        };
        timeline: Array<{
          date: string;
          count: number;
          totalAmount: number;
        }>;
        metrics: {
          avgOrderValue: number;
          repeatCustomerRate: number;
          successRate: number;
        };
      };
    };
    metrics: {
      totalRevenue: number;
      averageRevenuePerUser: number;
      totalTransactions: number;
    };
  };
  paymentReferrerDetails?: Array<{
    url: string;
    landingPage: string;
    source: string;
    count: number;
    totalAmount: number;
  }>;
  funnel: {
    totalSessions: number;
    registrationRate: number;
    paymentRate: number;
    conversionRate: number;
  };
  geoDistribution: Record<
    string,
    {
      registrations: number;
      payments: number;
      revenue: number;
    }
  >;
  sourceStats: Record<string, SourceStats>;
}

export interface ConversionSessionsData {
  sessions: Array<{
    sessionId: string;
    userId: string;
    conversionType: 'standard' | 'google' | 'top_up' | 'order_payment';
    conversionSubtype: string;
    conversionValue: number;
    timestamp: string;
    startTime: string;
    endTime: string;
    timeToConversion: number;
    source: string;
    path: string;
    user: {
      name: string;
      email: string;
    };
    eventCount: number;
    events: SessionEvent[];
    deviceInfo?: {
      browser: string;
      os: string;
      device: string;
    };
  }>;
  total: number;
}

export interface SessionData {
  _id: string;
  userId: string;
  startTime: string;
  endTime: string;
  eventCount: number;
  events: SessionEvent[];
  user: {
    name: string;
    email: string;
  };
  sessionData?: {
    referrerData?: {
      firstReferrer?: string;
      landingPage?: string;
      utmParams?: {
        source?: string;
        medium?: string;
        campaign?: string;
      };
    };
    firstReferrer?: string;
    referrer?: string;
  };
  source?: string;
}

export function useAnalyticsData(endpoint: 'conversion-analytics'): {
  data: ConversionData | null;
  loading: boolean;
  error: string | null;
};
export function useAnalyticsData(endpoint: 'conversion-sessions'): {
  data: ConversionSessionsData | null;
  loading: boolean;
  error: string | null;
};

export function useAnalyticsData(
  endpoint: `sessions?page=${number}&pageSize=${number}&startDate=${string | undefined}&endDate=${string | undefined}&userFilter=${string}`
): {
  data: SessionData[] | null; // Zmieniamy typ zwracany
  loading: boolean;
  error: string | null;
};

export function useAnalyticsData(endpoint: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(`/api/admin/analytics/${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Błąd HTTP! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'API zwróciło błąd');
        }

        // Szczegółowe logowanie dla debugowania
        if (endpoint === 'conversion-analytics') {
          // Sprawdzanie struktury danych
          const processedData = {
            registrations: {
              summary: {
                standard: result.data?.registrations?.summary?.standard || {
                  total: 0,
                  avgTimeToRegister: 0,
                  uniqueUsers: 0,
                  distribution: {
                    sources: [],
                    devices: [],
                    browsers: [],
                    paths: [],
                  },
                  timeline: [],
                },
                google: result.data?.registrations?.summary?.google || {
                  total: 0,
                  avgTimeToRegister: 0,
                  uniqueUsers: 0,
                  distribution: {
                    sources: [],
                    devices: [],
                    browsers: [],
                    paths: [],
                  },
                  timeline: [],
                },
              },
              metrics: result.data?.registrations?.metrics || {
                conversionEfficiency: 0,
                registrationSuccess: 0,
                preferredMethod: 'standard',
                peakRegistrationTime: {
                  hour: 0,
                  count: 0,
                  trends: {
                    morning: 0,
                    afternoon: 0,
                    evening: 0,
                    night: 0,
                  },
                  distribution: {},
                },
                devicePreference: {
                  device: '',
                  percentage: 0,
                  distribution: [],
                },
                retentionRate: {
                  rates: {
                    day1: { rate: 0, returningUsers: 0, totalUsers: 0 },
                    day7: { rate: 0, returningUsers: 0, totalUsers: 0 },
                    day30: { rate: 0, returningUsers: 0, totalUsers: 0 },
                  },
                  trend: '',
                  summary: {
                    shortTerm: 0,
                    mediumTerm: 0,
                    longTerm: 0,
                  },
                },
              },
              referrerDetails:
                result.data?.registrations?.referrerDetails || [],
            },
            payments: {
              summary: {
                topUp: {
                  ...result.data?.payments?.summary?.topUp,
                  metrics: {
                    avgOrderValue: Number(
                      result.data?.payments?.summary?.topUp?.metrics
                        ?.avgOrderValue || 0
                    ),
                    repeatCustomerRate: Number(
                      result.data?.payments?.summary?.topUp?.metrics
                        ?.repeatCustomerRate || 0
                    ),
                    successRate: Number(
                      result.data?.payments?.summary?.topUp?.metrics
                        ?.successRate || 0
                    ),
                  },
                },
                order: {
                  ...result.data?.payments?.summary?.order,
                  metrics: {
                    avgOrderValue: Number(
                      result.data?.payments?.summary?.order?.metrics
                        ?.avgOrderValue || 0
                    ),
                    repeatCustomerRate: Number(
                      result.data?.payments?.summary?.order?.metrics
                        ?.repeatCustomerRate || 0
                    ),
                    successRate: Number(
                      result.data?.payments?.summary?.order?.metrics
                        ?.successRate || 0
                    ),
                  },
                },
              },
              metrics: result.data?.payments?.metrics || {
                totalRevenue: 0,
                averageRevenuePerUser: 0,
                totalTransactions: 0,
              },
            },

            funnel: {
              totalSessions: Number(result.data?.funnel?.totalSessions || 0),
              registrationRate: Number(
                result.data?.funnel?.registrationRate || 0
              ),
              paymentRate: Number(result.data?.funnel?.paymentRate || 0),
              conversionRate: Number(result.data?.funnel?.conversionRate || 0),
            },
            geoDistribution: result.data?.geoDistribution || {},
          };

          setData(processedData);
        } else {
          setData(result.data);
        }
      } catch (err) {
        console.error('Błąd podczas pobierania danych:', err);
        setError(err instanceof Error ? err.message : 'Wystąpił błąd');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}

export interface SourceStats {
  count: number;
  rate: number;
  conversions: number;
}
