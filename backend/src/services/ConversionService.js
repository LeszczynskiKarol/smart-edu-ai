// backend/src/services/ConversionService.js
const UserActivity = require('../models/UserActivity');
const { mapReferrerToSource } = require('../utils/referrerMapping');

class ConversionService {
  static async getRegistrationSourceAnalytics(startDate, endDate) {
    try {
      return await UserActivity.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate },
            eventType: {
              $in: [
                'conversion_registration_standard',
                'conversion_registration_google',
              ],
            },
          },
        },
        {
          $addFields: {
            mappedSource: {
              $let: {
                vars: {
                  firstReferrer: {
                    $ifNull: ['$sessionData.firstReferrer', ''],
                  },
                },
                in: {
                  $switch: {
                    branches: [
                      {
                        // Google rejestracja powinna być wykrywana najpierw
                        case: {
                          $eq: ['$eventType', 'conversion_registration_google'],
                        },
                        then: 'google',
                      },
                      {
                        case: { $eq: ['$$firstReferrer', ''] },
                        then: 'direct',
                      },
                      {
                        case: {
                          $regexMatch: {
                            input: '$$firstReferrer',
                            regex: /google\./,
                            options: 'i',
                          },
                        },
                        then: 'organic',
                      },
                      {
                        case: {
                          $regexMatch: {
                            input: '$$firstReferrer',
                            regex: /facebook\.|instagram\.|twitter\./,
                            options: 'i',
                          },
                        },
                        then: 'social',
                      },
                      {
                        case: {
                          $regexMatch: {
                            input: '$$firstReferrer',
                            regex: /utm_medium=cpc|gclid=/,
                            options: 'i',
                          },
                        },
                        then: 'paid',
                      },
                    ],
                    default: 'referral',
                  },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: {
              type: {
                $cond: [
                  { $eq: ['$eventType', 'conversion_registration_standard'] },
                  'standard',
                  'google',
                ],
              },
            },
            total: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            devices: { $addToSet: '$deviceInfo.device' },
            sources: { $addToSet: '$mappedSource' },
            sourceStats: {
              $push: {
                source: '$mappedSource',
                count: 1,
              },
            },
            referrerDetails: {
              $push: {
                url: { $ifNull: ['$sessionData.referrer', ''] },
                landingPage: { $ifNull: ['$sessionData.landingPage', '/'] },
                utmSource: '$sessionData.referrerData.utmParams.source',
                utmMedium: '$sessionData.referrerData.utmParams.medium',
                utmCampaign: '$sessionData.referrerData.utmParams.campaign',
                source: '$mappedSource',
              },
            },
            hourlyStats: {
              $push: {
                hour: { $hour: '$timestamp' },
                count: 1,
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            type: '$_id.type',
            total: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            distribution: {
              devices: '$devices',
              sources: '$sources',
              sourceBreakdown: {
                $map: {
                  input: { $setUnion: ['$sources'] },
                  as: 'source',
                  in: {
                    source: '$$source',
                    count: {
                      $size: {
                        $filter: {
                          input: '$sourceStats',
                          as: 'stat',
                          cond: { $eq: ['$$stat.source', '$$source'] },
                        },
                      },
                    },
                    percentage: {
                      $multiply: [
                        {
                          $divide: [
                            {
                              $size: {
                                $filter: {
                                  input: '$sourceStats',
                                  as: 'stat',
                                  cond: { $eq: ['$$stat.source', '$$source'] },
                                },
                              },
                            },
                            { $size: '$sourceStats' },
                          ],
                        },
                        100,
                      ],
                    },
                  },
                },
              },
              referrerDetails: {
                $filter: {
                  input: '$referrerDetails',
                  as: 'detail',
                  cond: { $ne: ['$$detail', null] },
                },
              },
              peakHours: {
                $map: {
                  input: { $range: [0, 24] },
                  as: 'hour',
                  in: {
                    hour: '$$hour',
                    count: {
                      $size: {
                        $filter: {
                          input: '$hourlyStats',
                          as: 'stat',
                          cond: { $eq: ['$$stat.hour', '$$hour'] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ]);
    } catch (error) {
      console.error('Błąd w getRegistrationSourceAnalytics:', error);
      throw error;
    }
  }

  static async trackConversion(sessionId, userId, eventType, eventData) {
    try {
      if (!eventData.source || eventData.source === 'unknown') {
        let referrer = eventData.firstReferrer || eventData.referrer;

        if (referrer) {
          eventData.source = mapReferrerToSource(referrer);
        } else {
          // Próba pobrania z pierwszej aktywności
          const firstActivity = await UserActivity.findOne({
            sessionId: sessionId,
          }).sort({ timestamp: 1 });

          if (firstActivity?.sessionData?.firstReferrer) {
            eventData.source = mapReferrerToSource(
              firstActivity.sessionData.firstReferrer
            );
          }
        }
      }

      // Mapowanie typów konwersji na prawidłowe subtype
      const getConversionSubtype = (type) => {
        const subtypeMap = {
          conversion_registration_standard: 'standard',
          conversion_registration_google: 'google',
          conversion_payment_top_up: 'top_up',
          conversion_payment_order: 'order',
        };
        return subtypeMap[type] || 'standard';
      };

      if (!eventData.source || eventData.source === 'unknown') {
        let referrer = eventData.firstReferrer || eventData.referrer;

        if (referrer) {
          eventData.source = mapReferrerToSource(referrer);
        } else {
          // Próba pobrania z pierwszej aktywności
          const firstActivity = await UserActivity.findOne({
            sessionId: sessionId,
          }).sort({ timestamp: 1 });

          if (firstActivity?.sessionData?.firstReferrer) {
            eventData.source = mapReferrerToSource(
              firstActivity.sessionData.firstReferrer
            );
          } else if (firstActivity?.userContext?.referrer) {
            eventData.source = mapReferrerToSource(
              firstActivity.userContext.referrer
            );
          }
        }
      }

      const activity = await UserActivity.create({
        sessionId,
        userId,
        eventType,
        sessionData: {
          firstReferrer: eventData.firstReferrer,
          referrer: eventData.referrer,
          landingPage: eventData.path,
        },
        eventData: {
          ...eventData,
          deviceInfo: eventData.deviceInfo || 'unknown',
          conversionData: {
            type: eventType.includes('payment') ? 'payment' : 'registration',
            subtype: getConversionSubtype(eventType),
            value: eventData.value || 0,
            status: eventData.status || 'completed',
            source: eventData.source || 'unknown',
            path: eventData.path || null,
          },
          metadata: eventData.metadata || {},
        },
        deviceInfo: eventData.deviceInfo,
        timestamp: new Date(),
      });

      return activity;
    } catch (error) {
      console.error('Błąd podczas śledzenia konwersji:', {
        error: error.message,
        stack: error.stack,
        sessionId,
        userId,
        eventType,
      });
      throw error;
    }
  }

  static async getDetailedAnalytics(startDate, endDate) {
    try {
      const result = await UserActivity.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate },
            eventType: {
              $in: [
                'conversion_registration_standard',
                'conversion_registration_google',
                'conversion_payment_top_up',
                'conversion_payment_order',
              ],
            },
          },
        },
        {
          $facet: {
            registrationStats: [
              {
                $match: {
                  eventType: {
                    $in: [
                      'conversion_registration_standard',
                      'conversion_registration_google',
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: {
                    type: {
                      $cond: [
                        {
                          $eq: [
                            '$eventType',
                            'conversion_registration_standard',
                          ],
                        },
                        'standard',
                        'google',
                      ],
                    },
                    date: {
                      $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
                    },
                    source: {
                      $let: {
                        vars: {
                          firstReferrer: {
                            $ifNull: ['$sessionData.firstReferrer', 'unknown'],
                          },
                        },
                        in: {
                          $switch: {
                            branches: [
                              {
                                case: { $eq: ['$$firstReferrer', ''] },
                                then: 'direct',
                              },
                              {
                                case: {
                                  $regexMatch: {
                                    input: '$$firstReferrer',
                                    regex: /google\.|bing\.|yahoo\./,
                                  },
                                },
                                then: 'organic',
                              },
                              {
                                case: {
                                  $regexMatch: {
                                    input: '$$firstReferrer',
                                    regex:
                                      /facebook\.|instagram\.|twitter\.|tiktok\.|linkedin\./,
                                  },
                                },
                                then: 'social',
                              },
                              {
                                case: {
                                  $regexMatch: {
                                    input: '$$firstReferrer',
                                    regex: /utm_medium=cpc|gclid=/,
                                  },
                                },
                                then: 'paid',
                              },
                            ],
                            default: 'referral',
                          },
                        },
                      },
                    },
                  },
                  count: { $sum: 1 },

                  avgTimeToRegister: {
                    $avg: { $ifNull: ['$eventData.duration', 0] },
                  },
                  uniqueUsers: { $addToSet: '$userId' },
                  sources: {
                    $addToSet: {
                      $ifNull: ['$eventData.conversionData.source', 'unknown'],
                    },
                  },
                  devices: {
                    $addToSet: { $ifNull: ['$deviceInfo.device', 'unknown'] },
                  },
                  browsers: {
                    $addToSet: { $ifNull: ['$deviceInfo.browser', 'unknown'] },
                  },
                  paths: {
                    $addToSet: { $ifNull: ['$eventData.path', 'unknown'] },
                  },
                },
              },
              {
                $group: {
                  _id: '$_id.type',
                  totalCount: { $sum: '$count' },
                  avgTimeOverall: { $avg: '$avgTimeToRegister' },
                  dailyStats: {
                    $push: {
                      date: '$_id.date',
                      count: '$count',
                      avgTimeToRegister: '$avgTimeToRegister',
                    },
                  },
                  uniqueUsers: { $addToSet: '$uniqueUsers' },
                  sources: {
                    $addToSet: '$_id.source',
                  },
                  devices: { $first: '$devices' },
                  browsers: { $first: '$browsers' },
                  paths: { $first: '$paths' },
                },
              },
            ],
            registrationReferrerDetails: [
              {
                $match: {
                  eventType: {
                    $in: [
                      'conversion_registration_standard',
                      'conversion_registration_google',
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: {
                    url: '$sessionData.referrer',
                    landingPage: { $ifNull: ['$sessionData.landingPage', '/'] },
                    source: {
                      $switch: {
                        branches: [
                          {
                            case: { $eq: ['$sessionData.referrer', ''] },
                            then: 'direct',
                          },
                          {
                            case: {
                              $regexMatch: {
                                input: '$sessionData.referrer',
                                regex: /google\./,
                              },
                            },
                            then: 'organic',
                          },
                          {
                            case: {
                              $regexMatch: {
                                input: '$sessionData.referrer',
                                regex: /facebook\.|instagram\.|twitter\./,
                              },
                            },
                            then: 'social',
                          },
                        ],
                        default: 'referral',
                      },
                    },
                  },
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  url: '$_id.url',
                  landingPage: '$_id.landingPage',
                  source: '$_id.source',
                  count: 1,
                },
              },
            ],
            paymentStats: [
              {
                $match: {
                  eventType: {
                    $in: [
                      'conversion_payment_top_up',
                      'conversion_payment_order',
                    ],
                  },
                },
              },
              {
                $addFields: {
                  mappedSource: {
                    $let: {
                      vars: {
                        firstReferrer: {
                          $ifNull: ['$sessionData.firstReferrer', ''],
                        },
                      },
                      in: {
                        $switch: {
                          branches: [
                            {
                              // Najpierw sprawdzamy, czy to jest google
                              case: {
                                $regexMatch: {
                                  input: {
                                    $ifNull: ['$sessionData.referrer', ''],
                                  },
                                  regex: /google\./,
                                  options: 'i',
                                },
                              },
                              then: 'organic',
                            },
                            // Potem sprawdzamy inne przypadki
                            {
                              case: {
                                $eq: [
                                  '$eventType',
                                  'conversion_registration_google',
                                ],
                              },
                              then: 'google',
                            },
                            {
                              case: { $eq: ['$$firstReferrer', ''] },
                              then: 'direct',
                            },
                          ],
                          default: 'referral',
                        },
                      },
                    },
                  },
                },
              },
              {
                $group: {
                  _id: {
                    type: {
                      $cond: [
                        { $eq: ['$eventType', 'conversion_payment_top_up'] },
                        'top_up',
                        'order',
                      ],
                    },
                  },
                  total: { $sum: 1 },
                  totalAmount: { $sum: '$eventData.conversionData.value' },
                  uniqueUsers: { $addToSet: '$userId' },
                  paymentMethods: {
                    $addToSet: '$eventData.metadata.paymentMethod',
                  },
                  devices: { $addToSet: '$deviceInfo.device' },
                  sources: { $addToSet: '$mappedSource' },
                  sourceStats: {
                    $push: {
                      source: {
                        $switch: {
                          branches: [
                            {
                              case: {
                                $or: [
                                  { $eq: ['$sessionData.firstReferrer', null] },
                                  { $eq: ['$sessionData.firstReferrer', ''] },
                                ],
                              },
                              then: 'direct',
                            },
                            {
                              case: {
                                $regexMatch: {
                                  input: {
                                    $ifNull: ['$sessionData.firstReferrer', ''],
                                  },
                                  regex: /google\.|bing\.|yahoo\./,
                                },
                              },
                              then: 'organic',
                            },
                            {
                              case: {
                                $regexMatch: {
                                  input: {
                                    $ifNull: ['$sessionData.firstReferrer', ''],
                                  },
                                  regex: /facebook\.|instagram\.|twitter\./,
                                },
                              },
                              then: 'social',
                            },
                            {
                              case: {
                                $regexMatch: {
                                  input: {
                                    $ifNull: ['$sessionData.firstReferrer', ''],
                                  },
                                  regex: /utm_medium=cpc|gclid=/,
                                },
                              },
                              then: 'paid',
                            },
                          ],
                          default: 'referral',
                        },
                      },
                      amount: '$eventData.conversionData.value',
                      count: 1,
                    },
                  },
                  referrerDetails: {
                    $push: {
                      url: { $ifNull: ['$sessionData.referrer', ''] },
                      landingPage: {
                        $ifNull: ['$sessionData.landingPage', '/'],
                      },
                      source: {
                        $switch: {
                          branches: [
                            {
                              case: {
                                $or: [
                                  { $eq: ['$sessionData.referrer', null] },
                                  { $eq: ['$sessionData.referrer', ''] },
                                ],
                              },
                              then: 'direct',
                            },
                            {
                              case: {
                                $regexMatch: {
                                  input: {
                                    $ifNull: ['$sessionData.referrer', ''],
                                  },
                                  regex: /google\.|bing\.|yahoo\./,
                                },
                              },
                              then: 'organic', // Wyszukiwarki
                            },
                            {
                              case: {
                                $regexMatch: {
                                  input: {
                                    $ifNull: ['$sessionData.referrer', ''],
                                  },
                                  regex: /facebook\.|instagram\.|twitter\./,
                                },
                              },
                              then: 'social', // Media społecznościowe
                            },
                            {
                              case: {
                                $regexMatch: {
                                  input: {
                                    $ifNull: ['$sessionData.referrer', ''],
                                  },
                                  regex: /utm_medium=cpc|gclid=/,
                                },
                              },
                              then: 'paid', // Płatne reklamy
                            },
                          ],
                          default: 'referral',
                        },
                      },
                      amount: '$eventData.conversionData.value',
                    },
                  },
                  hourlyStats: {
                    $push: {
                      hour: { $hour: '$timestamp' },
                      count: 1,
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  type: '$_id.type',
                  total: 1,
                  totalAmount: 1,
                  uniqueUsers: { $size: '$uniqueUsers' },
                  distribution: {
                    paymentMethods: '$paymentMethods',
                    devices: '$devices',
                    sources: '$sources',
                    sourceBreakdown: {
                      $map: {
                        input: { $setUnion: ['$sources'] },
                        as: 'source',
                        in: {
                          source: '$$source',
                          count: {
                            $size: {
                              $filter: {
                                input: '$sourceStats',
                                as: 'stat',
                                cond: { $eq: ['$$stat.source', '$$source'] },
                              },
                            },
                          },
                          totalAmount: {
                            $sum: {
                              $map: {
                                input: {
                                  $filter: {
                                    input: '$sourceStats',
                                    as: 'stat',
                                    cond: {
                                      $eq: ['$$stat.source', '$$source'],
                                    },
                                  },
                                },
                                as: 'stat',
                                in: '$$stat.amount',
                              },
                            },
                          },
                        },
                      },
                    },
                    referrerDetails: {
                      $filter: {
                        input: '$referrerDetails',
                        as: 'detail',
                        cond: { $ne: ['$$detail', null] }, // Tylko filtrujemy nulle, ale zachowujemy puste referrery
                      },
                    },

                    peakHours: {
                      $map: {
                        input: { $range: [0, 24] },
                        as: 'hour',
                        in: {
                          hour: '$$hour',
                          count: {
                            $size: {
                              $filter: {
                                input: '$hourlyStats',
                                as: 'stat',
                                cond: { $eq: ['$$stat.hour', '$$hour'] },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  metrics: {
                    avgOrderValue: { $divide: ['$totalAmount', '$total'] },
                    repeatCustomerRate: {
                      $multiply: [
                        {
                          $divide: [
                            { $subtract: [{ $size: '$uniqueUsers' }, 1] },
                            { $max: [{ $size: '$uniqueUsers' }, 1] },
                          ],
                        },
                        100,
                      ],
                    },
                    successRate: 100,
                  },
                },
              },
            ],
            funnelAnalysis: [
              {
                $group: {
                  _id: '$sessionId',
                  hasPayment: {
                    $max: {
                      $cond: [
                        {
                          $in: [
                            '$eventType',
                            [
                              'conversion_payment_top_up',
                              'conversion_payment_order',
                            ],
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  totalSessions: { $sum: 1 },
                  sessionsWithPayment: { $sum: '$hasPayment' },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalSessions: 1,
                  sessionsWithPayment: 1,
                  paymentConversionRate: {
                    $multiply: [
                      { $divide: ['$sessionsWithPayment', '$totalSessions'] },
                      100,
                    ],
                  },
                },
              },
            ],
            referrerDetails: [
              {
                $match: {
                  eventType: {
                    $in: [
                      'conversion_payment_top_up',
                      'conversion_payment_order',
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: {
                    url: '$sessionData.referrer',
                    landingPage: { $ifNull: ['$sessionData.landingPage', '/'] },
                    source: {
                      $switch: {
                        branches: [
                          {
                            case: { $eq: ['$sessionData.referrer', ''] },
                            then: 'direct',
                          },
                          {
                            case: {
                              $regexMatch: {
                                input: '$sessionData.referrer',
                                regex: /google\./,
                              },
                            },
                            then: 'organic',
                          },
                          {
                            case: {
                              $regexMatch: {
                                input: '$sessionData.referrer',
                                regex: /facebook\.|instagram\.|twitter\./,
                              },
                            },
                            then: 'social',
                          },
                        ],
                        default: 'referral',
                      },
                    },
                  },
                  amount: { $sum: '$eventData.conversionData.value' },
                },
              },
              {
                $project: {
                  _id: 0,
                  url: '$_id.url',
                  landingPage: '$_id.landingPage',
                  source: '$_id.source',
                  amount: 1,
                },
              },
            ],
          },
        },
      ]);

      return result;
    } catch (error) {
      console.error('Błąd w getDetailedAnalytics:', error);
      throw error;
    }
  }
}

module.exports = ConversionService;
