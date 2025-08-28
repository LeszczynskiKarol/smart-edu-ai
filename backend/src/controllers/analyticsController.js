// backend/src/controllers/analyticsController.js
const UserActivity = require('../models/UserActivity');
const User = require('../models/User');
const { detectDevice } = require('../utils/deviceDetection');
const ConversionService = require('../services/ConversionService');

// Funkcje pomocnicze
const processSource = (referrer) => {
  if (!referrer) return 'direct';

  if (
    referrer.includes('google.') ||
    referrer.includes('bing.') ||
    referrer.includes('yahoo.')
  ) {
    return 'organic';
  }

  if (
    referrer.includes('facebook.') ||
    referrer.includes('instagram.') ||
    referrer.includes('twitter.')
  ) {
    return 'social';
  }

  if (referrer.includes('utm_medium=cpc') || referrer.includes('gclid=')) {
    return 'paid';
  }

  return 'referral';
};

const calculatePeakTimes = (registrationStats) => {
  // Zbieramy wszystkie zdarzenia i ich godziny
  const hourlyDistribution = {};

  registrationStats.forEach((stat) => {
    if (stat.dailyStats && Array.isArray(stat.dailyStats)) {
      stat.dailyStats.forEach((day) => {
        const date = new Date(day.date);
        const hour = date.getHours();

        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + day.count;
      });
    }
  });

  // Znajdujemy godzinę z największą liczbą rejestracji
  let peakHour = 0;
  let maxCount = 0;

  Object.entries(hourlyDistribution).forEach(([hour, count]) => {
    if (count > maxCount) {
      peakHour = parseInt(hour);
      maxCount = count;
    }
  });

  // Analizujemy trendy
  const trends = {
    morning: Object.entries(hourlyDistribution)
      .filter(([h]) => h >= 6 && h < 12)
      .reduce((sum, [_, count]) => sum + count, 0),
    afternoon: Object.entries(hourlyDistribution)
      .filter(([h]) => h >= 12 && h < 18)
      .reduce((sum, [_, count]) => sum + count, 0),
    evening: Object.entries(hourlyDistribution)
      .filter(([h]) => h >= 18 && h < 22)
      .reduce((sum, [_, count]) => sum + count, 0),
    night: Object.entries(hourlyDistribution)
      .filter(([h]) => h >= 22 || h < 6)
      .reduce((sum, [_, count]) => sum + count, 0),
  };

  return {
    hour: peakHour,
    count: maxCount,
    trends,
    distribution: hourlyDistribution,
  };
};

const calculateDevicePreference = (registrationStats) => {
  const deviceStats = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
    other: 0,
  };

  let totalCount = 0;

  registrationStats.forEach((stat) => {
    if (stat.deviceDistribution && Array.isArray(stat.deviceDistribution)) {
      stat.deviceDistribution.forEach((devices) => {
        devices.forEach((device) => {
          const deviceType = device.toLowerCase();
          if (deviceType.includes('desktop')) {
            deviceStats.desktop++;
          } else if (
            deviceType.includes('mobile') ||
            deviceType.includes('phone')
          ) {
            deviceStats.mobile++;
          } else if (deviceType.includes('tablet')) {
            deviceStats.tablet++;
          } else {
            deviceStats.other++;
          }
          totalCount++;
        });
      });
    }
  });

  // Znajdujemy preferowane urządzenie
  let preferredDevice = 'desktop';
  let maxCount = deviceStats.desktop;

  Object.entries(deviceStats).forEach(([device, count]) => {
    if (count > maxCount) {
      preferredDevice = device;
      maxCount = count;
    }
  });

  return {
    device: preferredDevice,
    percentage: totalCount > 0 ? (maxCount / totalCount) * 100 : 0,
    distribution: Object.entries(deviceStats).map(([device, count]) => ({
      device,
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    })),
  };
};
const calculateRetentionRate = (stats) => {
  // Zabezpieczenie przed undefined
  if (!stats || !stats.registrationStats) {
    return {
      rates: {
        day1: { rate: 0, returningUsers: 0, totalUsers: 0 },
        day7: { rate: 0, returningUsers: 0, totalUsers: 0 },
        day30: { rate: 0, returningUsers: 0, totalUsers: 0 },
      },
      trend: 'poor',
      summary: {
        shortTerm: 0,
        mediumTerm: 0,
        longTerm: 0,
      },
    };
  }

  const RETENTION_PERIODS = {
    day1: 1,
    day7: 7,
    day30: 30,
  };

  const calculatePeriodRetention = (period) => {
    let returningUsers = 0;
    let totalUsers = 0;

    // Grupujemy użytkowników po dniach
    const userVisits = new Map();

    // Upewniamy się, że stats.registrationStats jest tablicą
    (Array.isArray(stats.registrationStats)
      ? stats.registrationStats
      : []
    ).forEach((stat) => {
      // Sprawdzamy, czy dailyStats istnieje i jest tablicą
      const dailyStats = Array.isArray(stat.dailyStats) ? stat.dailyStats : [];

      dailyStats.forEach((day) => {
        const date = new Date(day.date);
        // Sprawdzamy, czy uniqueUsers istnieje i jest tablicą
        const uniqueUsers = Array.isArray(day.uniqueUsers)
          ? day.uniqueUsers
          : [];

        uniqueUsers.forEach((userId) => {
          if (!userVisits.has(userId)) {
            userVisits.set(userId, new Set());
          }
          userVisits.get(userId).add(date.getTime());
        });
      });
    });

    // Analizujemy retencję dla każdego użytkownika
    userVisits.forEach((visits) => {
      totalUsers++;
      const sortedVisits = Array.from(visits).sort();

      if (sortedVisits.length > 1) {
        const firstVisit = new Date(sortedVisits[0]);
        const hasReturnVisit = sortedVisits.some((visit) => {
          const visitDate = new Date(visit);
          const daysDiff = Math.floor(
            (visitDate - firstVisit) / (1000 * 60 * 60 * 24)
          );
          return daysDiff >= period;
        });

        if (hasReturnVisit) {
          returningUsers++;
        }
      }
    });

    return {
      rate: totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0,
      returningUsers,
      totalUsers,
    };
  };

  const retentionRates = {
    day1: calculatePeriodRetention(RETENTION_PERIODS.day1),
    day7: calculatePeriodRetention(RETENTION_PERIODS.day7),
    day30: calculatePeriodRetention(RETENTION_PERIODS.day30),
  };

  // Analizujemy trend
  const trend = (() => {
    const day1Rate = retentionRates.day1.rate;
    const day7Rate = retentionRates.day7.rate;
    const day30Rate = retentionRates.day30.rate;

    if (day1Rate > 70 && day7Rate > 40 && day30Rate > 20) return 'excellent';
    if (day1Rate > 50 && day7Rate > 25 && day30Rate > 10) return 'good';
    if (day1Rate > 30 && day7Rate > 15 && day30Rate > 5) return 'stable';
    if (day1Rate > 20 && day7Rate > 10 && day30Rate > 2) return 'concerning';
    return 'poor';
  })();

  return {
    rates: retentionRates,
    trend,
    summary: {
      shortTerm: retentionRates.day1.rate,
      mediumTerm: retentionRates.day7.rate,
      longTerm: retentionRates.day30.rate,
    },
  };
};

const getTimeRangeInMs = (timeRange) => {
  switch (timeRange) {
    case '24h':
      return 24 * 60 * 60 * 1000;
    case '7d':
      return 7 * 24 * 60 * 60 * 1000;
    case '30d':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
};

module.exports = {
  // backend/src/controllers/analyticsController.js
  getConversionAnalytics: async (req, res) => {
    try {
      const { startDate } = req.query;
      const endDate = req.query.endDate || new Date().toISOString();

      const timeRange = {
        start: new Date(
          startDate || new Date().setDate(new Date().getDate() - 30)
        ),
        end: new Date(endDate),
      };

      // Sprawdzamy poprawność dat
      if (isNaN(timeRange.start.getTime()) || isNaN(timeRange.end.getTime())) {
        throw new Error('Nieprawidłowy format daty');
      }

      const detailedStats = await ConversionService.getDetailedAnalytics(
        timeRange.start,
        timeRange.end
      );

      // Zabezpieczamy się przed pustymi wynikami
      if (
        !detailedStats ||
        !Array.isArray(detailedStats) ||
        detailedStats.length === 0
      ) {
        return res.status(200).json({
          success: true,
          data: {
            registrations: {
              summary: {
                standard: {
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
                google: {
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
              metrics: {
                conversionEfficiency: 0,
                registrationSuccess: 0,
                preferredMethod: 'standard',
                peakRegistrationTime: {
                  hour: 0,
                  count: 0,
                  trends: { morning: 0, afternoon: 0, evening: 0, night: 0 },
                  distribution: {},
                },
                devicePreference: {
                  device: 'unknown',
                  percentage: 0,
                  distribution: [],
                },
                retentionRate: {
                  rates: {
                    day1: { rate: 0, returningUsers: 0, totalUsers: 0 },
                    day7: { rate: 0, returningUsers: 0, totalUsers: 0 },
                    day30: { rate: 0, returningUsers: 0, totalUsers: 0 },
                  },
                  trend: 'poor',
                  summary: { shortTerm: 0, mediumTerm: 0, longTerm: 0 },
                },
              },
              referrerDetails: [],
            },
            payments: {
              summary: {
                topUp: {
                  total: 0,
                  totalAmount: 0,
                  uniqueUsers: 0,
                  distribution: {
                    paymentMethods: [],
                    currencies: [],
                    devices: [],
                    peakHours: [],
                  },
                  timeline: [],
                  metrics: {
                    avgOrderValue: 0,
                    repeatCustomerRate: 0,
                    successRate: 0,
                  },
                },
                order: {
                  total: 0,
                  totalAmount: 0,
                  uniqueUsers: 0,
                  distribution: {
                    paymentMethods: [],
                    currencies: [],
                    devices: [],
                    peakHours: [],
                  },
                  timeline: [],
                  metrics: {
                    avgOrderValue: 0,
                    repeatCustomerRate: 0,
                    successRate: 0,
                  },
                },
              },
              metrics: {
                totalRevenue: 0,
                averageRevenuePerUser: 0,
                totalTransactions: 0,
              },
            },
            funnel: {
              totalSessions: 0,
              registrationRate: 0,
              paymentRate: 0,
              conversionRate: 0,
            },
            geoDistribution: {},
          },
        });
      }

      const stats = detailedStats[0] || {};
      const processedData = {
        registrations: {
          summary: {
            standard: {
              total:
                stats.registrationStats?.find((r) => r._id === 'standard')
                  ?.totalCount || 0,
              avgTimeToRegister:
                stats.registrationStats?.find((r) => r._id === 'standard')
                  ?.avgTimeOverall || 0,
              uniqueUsers:
                stats.registrationStats?.find((r) => r._id === 'standard')
                  ?.uniqueUsers?.length || 0,
              distribution: {
                sources:
                  stats.registrationStats?.find((r) => r._id === 'standard')
                    ?.sources || [],
                devices:
                  stats.registrationStats?.find((r) => r._id === 'standard')
                    ?.devices || [],
                browsers:
                  stats.registrationStats?.find((r) => r._id === 'standard')
                    ?.browsers || [],
                paths:
                  stats.registrationStats?.find((r) => r._id === 'standard')
                    ?.paths || [],
              },
              timeline:
                stats.registrationStats?.find((r) => r._id === 'standard')
                  ?.dailyStats || [],
            },
            google: {
              total:
                stats.registrationStats?.find((r) => r._id === 'google')
                  ?.totalCount || 0,
              avgTimeToRegister:
                stats.registrationStats?.find((r) => r._id === 'google')
                  ?.avgTimeOverall || 0,
              uniqueUsers:
                stats.registrationStats?.find((r) => r._id === 'google')
                  ?.uniqueUsers?.length || 0,
              distribution: {
                sources:
                  stats.registrationStats?.find((r) => r._id === 'google')
                    ?.sources || [],
                devices:
                  stats.registrationStats?.find((r) => r._id === 'google')
                    ?.devices || [],
                browsers:
                  stats.registrationStats?.find((r) => r._id === 'google')
                    ?.browsers || [],
                paths:
                  stats.registrationStats?.find((r) => r._id === 'google')
                    ?.paths || [],
              },
              timeline:
                stats.registrationStats?.find((r) => r._id === 'google')
                  ?.dailyStats || [],
            },
          },
          metrics: {
            conversionEfficiency: 0, // zostanie zaktualizowane później
            registrationSuccess: 0, // zostanie zaktualizowane później
            preferredMethod: 'standard', // zostanie zaktualizowane później
            peakRegistrationTime: calculatePeakTimes(
              stats.registrationStats || []
            ),
            devicePreference: calculateDevicePreference(
              stats.registrationStats || []
            ),
            retentionRate: calculateRetentionRate(stats),
          },
          referrerDetails:
            stats.registrationReferrerDetails?.map((detail) => ({
              url: detail.url,
              landingPage: detail.landingPage,
              source: detail.source,
              utmSource: detail?.utmSource || undefined,
              utmMedium: detail?.utmMedium || undefined,
              utmCampaign: detail?.utmCampaign || undefined,
              count: detail.count,
              details: [],
            })) || [],
        },
        payments: {
          summary: {
            topUp: stats.paymentStats?.find((p) => p.type === 'top_up') || {
              total: 0,
              totalAmount: 0,
              uniqueUsers: 0,
              distribution: {
                paymentMethods: [],
                devices: [],
                peakHours: [],
              },
              metrics: {
                avgOrderValue: 0,
                repeatCustomerRate: 0,
                successRate: 100,
              },
            },
            order: stats.paymentStats?.find((p) => p.type === 'order') || {
              total: 0,
              totalAmount: 0,
              uniqueUsers: 0,
              distribution: {
                paymentMethods: [],
                devices: [],
                peakHours: [],
              },
              metrics: {
                avgOrderValue: 0,
                repeatCustomerRate: 0,
                successRate: 100,
              },
            },
          },
        },
        funnel: {
          totalSessions: stats.funnelAnalysis?.[0]?.totalSessions || 0,
          registrationRate:
            (stats.funnelAnalysis?.[0]?.registrationSessions /
              (stats.funnelAnalysis?.[0]?.totalSessions || 1)) *
              100 || 0,
          paymentRate:
            (stats.funnelAnalysis?.[0]?.paymentSessions /
              (stats.funnelAnalysis?.[0]?.totalSessions || 1)) *
              100 || 0,
          conversionRate:
            (stats.funnelAnalysis?.[0]?.paymentSessions /
              (stats.funnelAnalysis?.[0]?.registrationSessions || 1)) *
              100 || 0,
        },
        sourceStats: processSource(stats.registrationStats || []),
      };

      // Obliczamy metryki rejestracji
      processedData.registrations.metrics = {
        conversionEfficiency:
          ((processedData.funnel.conversionRate / 100) *
            ((processedData.payments.summary.topUp?.totalAmount || 0) +
              (processedData.payments.summary.order?.totalAmount || 0))) /
          Math.max(
            processedData.registrations.summary.standard.uniqueUsers,
            processedData.registrations.summary.google.uniqueUsers,
            1
          ),
        registrationSuccess:
          ((processedData.registrations.summary.standard.total +
            processedData.registrations.summary.google.total) /
            processedData.funnel.totalSessions) *
          100,
        preferredMethod:
          processedData.registrations.summary.standard.total >
          processedData.registrations.summary.google.total
            ? 'standard'
            : 'google',
        peakRegistrationTime: calculatePeakTimes(stats.registrationStats || []),
        devicePreference: calculateDevicePreference(
          stats.registrationStats || []
        ),
        retentionRate: calculateRetentionRate(stats),
      };

      res.status(200).json({
        success: true,
        data: processedData,
      });
    } catch (error) {
      console.error('Błąd w analityce konwersji:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  trackActivity: async (req, res) => {
    try {
      if (req.user?.role === 'admin') {
        return res.status(200).json({
          success: true,
          message: 'Admin user - tracking skipped',
        });
      }
      const userId = req.user?._id !== 'anonymous' ? req.user._id : 'anonymous';
      const {
        sessionId,
        newUserId,
        eventType,
        eventData,
        deviceInfo,
        userAgent,
      } = req.body;

      const campaignData = {
        campaign: req.query.campaign || eventData?.campaignData?.campaign,
        source: req.query.source || eventData?.campaignData?.source,
        device:
          req.query.device ||
          eventData?.campaignData?.device ||
          deviceInfo?.device,
      };

      if (eventType === 'user_login' && eventData.previousUserId) {
        await UserActivity.updateMany(
          {
            sessionId,
            userId: eventData.previousUserId,
          },
          {
            $set: {
              'sessionData.userTransitions': {
                fromUserId: eventData.previousUserId,
                toUserId: newUserId,
                timestamp: new Date(),
              },
            },
          }
        );
      }

      const deviceData = detectDevice(userAgent);

      const activity = new UserActivity({
        userId,
        sessionId,
        eventType: eventType,
        eventData: {
          ...eventData,
          ...deviceInfo,
          ...deviceData,
          campaignData,
          source: eventData.source,
          isNewUser: eventData.isNewUser,
          ...(eventType === 'user_login' &&
            eventData.component === 'GoogleLogin' &&
            eventData.isNewUser && {
              conversionData: {
                type: 'registration',
                subtype: 'google',
                value: 0,
                status: 'completed',
                source: eventData.source || 'google',
                path: eventData.path,
              },
            }),
        },
        userAgent: req.headers['user-agent'],
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        locale: req.headers['accept-language'],
        deviceInfo: {
          ...deviceInfo,
          ...deviceData,
        },
        sessionData: req.body.sessionData,
        performanceMetrics: req.body.performanceMetrics,
        userContext: req.body.userContext,
      });

      await activity.save();

      res.status(200).json({
        success: true,
        activity,
      });
    } catch (error) {
      console.error('Błąd podczas zapisywania aktywności:', error);
      res.status(500).json({
        success: false,
        message: 'Wystąpił błąd podczas zapisywania aktywności',
      });
    }
  },

  getEvents: async (req, res) => {
    try {
      // Filtrowanie i paginacja
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const query = {};
      if (req.query.userId) query.userId = req.query.userId;
      if (req.query.eventType) query.eventType = req.query.eventType;
      if (req.query.startDate && req.query.endDate) {
        query.timestamp = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        };
      }

      const events = await UserActivity.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email name');

      const total = await UserActivity.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          events,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Błąd podczas pobierania zdarzeń:', error);
      res.status(500).json({
        success: false,
        message: 'Wystąpił błąd podczas pobierania zdarzeń',
      });
    }
  },

  getSessions: async (req, res) => {
    try {
      const query = {};
      const { sortField = 'startTime', sortDirection = 'desc' } = req.query; // Dodajemy nowe parametry

      if (req.query.userId) query.userId = req.query.userId;
      if (
        req.query.startDate &&
        req.query.endDate &&
        req.query.startDate !== 'undefined' &&
        req.query.endDate !== 'undefined'
      ) {
        query.timestamp = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        };
      }

      const sessions = await UserActivity.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$sessionId',
            userId: { $last: '$userId' },
            startTime: { $min: '$timestamp' },
            endTime: { $max: '$timestamp' },
            eventCount: { $sum: 1 },
            sessionData: { $first: '$sessionData' },
            firstEvent: {
              $first: {
                eventType: '$eventType',
                eventData: '$eventData',
                userContext: '$userContext',
              },
            },
            userTransitions: {
              $push: {
                $cond: [
                  { $eq: ['$eventType', 'user_login'] },
                  {
                    timestamp: '$timestamp',
                    previousUserId: '$eventData.metadata.previousUserId',
                    newUserId: '$userId',
                  },
                  null,
                ],
              },
            },
            events: {
              $push: {
                eventType: '$eventType',
                component: '$eventData.component',
                path: '$eventData.path',
                action: '$eventData.action',
                timestamp: '$timestamp',
                eventData: {
                  metadata: '$eventData.metadata',
                  source: '$eventData.source',
                  referrer: '$sessionData.referrer',
                  firstReferrer: '$sessionData.firstReferrer',
                },
                performanceMetrics: '$performanceMetrics',
                deviceInfo: '$deviceInfo',
                userId: '$userId',
              },
            },
          },
        },
        {
          $addFields: {
            source: {
              $cond: [
                { $ifNull: ['$sessionData.referrerData.firstReferrer', false] },
                '$sessionData.referrerData.firstReferrer',
                {
                  $cond: [
                    { $ifNull: ['$sessionData.firstReferrer', false] },
                    '$sessionData.firstReferrer',
                    {
                      $cond: [
                        { $ifNull: ['$firstEvent.eventData.source', false] },
                        '$firstEvent.eventData.source',
                        'direct',
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        // Dodajemy filtrowanie krótkich sesji
        {
          $match: {
            $expr: {
              $gte: [
                { $subtract: ['$endTime', '$startTime'] },
                1000, // minimum 1 sekunda
              ],
            },
          },
        },
        // Dodajemy sortowanie
        {
          $sort: {
            [sortField]: sortDirection === 'desc' ? -1 : 1,
          },
        },
        {
          $project: {
            userId: 1,
            startTime: 1,
            endTime: 1,
            eventCount: 1,
            events: 1,
            userTransitions: {
              $filter: {
                input: '$userTransitions',
                as: 'transition',
                cond: { $ne: ['$$transition', null] },
              },
            },
          },
        },
      ]);

      // Reszta kodu pozostaje bez zmian
      const allUserIds = sessions.reduce((acc, session) => {
        if (session.userId !== 'anonymous') acc.add(session.userId);
        session.userTransitions.forEach((t) => {
          if (t.previousUserId !== 'anonymous') acc.add(t.previousUserId);
          if (t.newUserId !== 'anonymous') acc.add(t.newUserId);
        });
        return acc;
      }, new Set());

      const users =
        allUserIds.size > 0
          ? await User.find({ _id: { $in: Array.from(allUserIds) } }).select(
              'email name'
            )
          : [];

      const userMap = Object.fromEntries(
        users.map((u) => [u._id.toString(), u])
      );

      const sessionsWithUsers = sessions.map((session) => ({
        ...session,
        user:
          session.userId === 'anonymous'
            ? { name: 'Anonymous User', email: 'anonymous' }
            : userMap[session.userId] || { name: 'Unknown', email: 'unknown' },
        sourceDetails: {
          source: processSource(session.source),
          referrer: session.sessionData?.referrer || '',
          firstReferrer: session.sessionData?.firstReferrer || '',
          utmSource: session.sessionData?.referrerData?.utmParams?.source || '',
          utmMedium: session.sessionData?.referrerData?.utmParams?.medium || '',
          utmCampaign:
            session.sessionData?.referrerData?.utmParams?.campaign || '',
        },
      }));

      res.status(200).json({
        success: true,
        data: sessionsWithUsers,
      });
    } catch (error) {
      console.error('Błąd podczas pobierania sesji:', error);
      res.status(500).json({
        success: false,
        message: 'Wystąpił błąd podczas pobierania sesji',
      });
    }
  },

  getAnalytics: async (req, res) => {
    try {
      const result = await UserActivity.aggregate([
        {
          $group: {
            _id: {
              userId: '$userId',
              day: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
              },
            },
            eventCount: { $sum: 1 },
            sessionCount: { $addToSet: '$sessionId' },
            averageLoadTime: { $avg: '$performanceMetrics.loadTime' },
            interactions: {
              $push: { type: '$eventType', timestamp: '$timestamp' },
            },
          },
        },
      ]);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getDashboardMetrics: async (req, res) => {
    try {
      const timeRange = req.query.timeRange || '24h';
      const timeRangeMs = getTimeRangeInMs(timeRange);

      const metrics = await UserActivity.aggregate([
        {
          $match: {
            timestamp: {
              $gte: new Date(Date.now() - timeRangeMs),
            },
          },
        },
        {
          $group: {
            _id: null,
            activeUsers: { $addToSet: '$userId' },
            totalSessions: { $addToSet: '$sessionId' },
            avgSessionTime: { $avg: '$sessionData.duration' },
            totalEvents: { $sum: 1 },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: metrics[0] || {},
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getRegistrationAnalytics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const timeRange = {
        start: new Date(
          startDate || new Date().setDate(new Date().getDate() - 30)
        ),
        end: new Date(endDate || new Date()),
      };

      const sourceAnalytics =
        await ConversionService.getRegistrationSourceAnalytics(
          timeRange.start,
          timeRange.end
        );

      // Obliczanie podsumowania
      const summary = {
        totalRegistrations: sourceAnalytics.reduce(
          (acc, src) => acc + src.totalRegistrations,
          0
        ),
        sourcesBreakdown: sourceAnalytics.map((src) => ({
          source: src._id,
          percentage: (
            (src.totalRegistrations /
              sourceAnalytics.reduce(
                (acc, s) => acc + s.totalRegistrations,
                0
              )) *
            100
          ).toFixed(2),
          total: src.totalRegistrations,
        })),
        topPerformingSource: sourceAnalytics[0]?._id || 'none',
        registrationsByMethod: {
          standard: sourceAnalytics.reduce(
            (acc, src) =>
              acc +
              (src.registrationTypes.find((t) => t.type === 'standard')
                ?.total || 0),
            0
          ),
          google: sourceAnalytics.reduce(
            (acc, src) =>
              acc +
              (src.registrationTypes.find((t) => t.type === 'google')?.total ||
                0),
            0
          ),
        },
      };

      res.status(200).json({
        success: true,
        data: {
          summary,
          sourceAnalytics,
          timeRange,
        },
      });
    } catch (error) {
      console.error('Błąd w getRegistrationAnalytics:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getConversionSessions: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const conversionSessions = await UserActivity.aggregate([
        {
          $match: {
            eventType: { $regex: /^conversion_/ },
            timestamp: {
              $gte: new Date(
                startDate || new Date().setDate(new Date().getDate() - 30)
              ),
              $lte: new Date(endDate || new Date()),
            },
          },
        },
        {
          $group: {
            _id: '$sessionId',
            sessionId: { $first: '$sessionId' },
            userId: { $first: '$userId' },
            startTime: { $min: '$timestamp' },
            endTime: { $max: '$timestamp' },
            conversionType: {
              $first: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $regexMatch: { input: '$eventType', regex: /google/ },
                      },
                      then: 'google',
                    },
                    {
                      case: {
                        $regexMatch: { input: '$eventType', regex: /standard/ },
                      },
                      then: 'standard',
                    },
                    {
                      case: {
                        $regexMatch: { input: '$eventType', regex: /top_up/ },
                      },
                      then: 'top_up',
                    },
                    {
                      case: {
                        $regexMatch: { input: '$eventType', regex: /order/ },
                      },
                      then: 'order_payment',
                    },
                  ],
                  default: 'unknown',
                },
              },
            },
            conversionValue: { $first: '$eventData.conversionData.value' },
            source: { $first: '$eventData.source' },
            path: { $first: '$eventData.path' },
            eventCount: { $sum: 1 },
            deviceInfo: { $first: '$deviceInfo' },
            events: { $push: '$$ROOT' },
          },
        },
        {
          $addFields: {
            timeToConversion: {
              $subtract: ['$endTime', '$startTime'],
            },
          },
        },
        { $sort: { startTime: -1 } },
      ]);

      // Pobierz dane użytkowników
      const userIds = conversionSessions
        .map((session) => session.userId)
        .filter((id) => id !== 'anonymous');

      const users = await User.find({ _id: { $in: userIds } }).select(
        'email name'
      );

      const userMap = Object.fromEntries(
        users.map((u) => [u._id.toString(), u])
      );

      const processedSessions = conversionSessions.map((session) => ({
        ...session,
        user:
          session.userId === 'anonymous'
            ? { name: 'Anonimowy', email: 'anonymous' }
            : userMap[session.userId] || { name: 'Nieznany', email: 'unknown' },
      }));

      res.status(200).json({
        success: true,
        data: {
          sessions: processedSessions,
          total: processedSessions.length,
        },
      });
    } catch (error) {
      console.error('Błąd podczas pobierania sesji konwersji:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
