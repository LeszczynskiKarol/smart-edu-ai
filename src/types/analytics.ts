// src/types/analytics.ts

interface RegistrationMetrics {
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
}

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

interface SourceStats {
  count: number;
  rate: number;
  conversions: number;
}

interface AnalyticsBaseResponse {
  success: boolean;
  data: any;
}

interface SessionData {
  sessions: Array<{
    events: any[];
    homeTrackingEvents: any[];
  }>;
  total: number;
}

export type {
  SessionData,
  ConversionData,
  AnalyticsBaseResponse,
  RegistrationMetrics,
};
