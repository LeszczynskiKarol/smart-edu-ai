// backend/src/models/UserActivity.js
const mongoose = require('mongoose');

const essentialEventTypes = [
  'pageView',
  'click',
  'formSubmit',
  'formError',
  'user_registration',
  'navigation',
  'user_login',
  'session_start',
  'serviceInteraction',
  'session_end',
  'ctaClick',
  'logo_click',
  'conversion_registration_standard',
  'conversion_registration_google',
  'conversion_payment_top_up',
  'conversion_payment_order',
  'payment',
  'payment_success',
  'payment_pending',
  'interaction',
];

const UserActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionData: {
      startTime: Date,
      endTime: Date,
      duration: Number,
      isActive: Boolean,
      lastActivity: Date,
      visitCount: Number,
      isReturningUser: Boolean,
      firstReferrer: String,
      referrer: String,
      referrerData: {
        firstReferrer: String,
        landingPage: String,
        registrationPath: String,
        utmParams: {
          source: String,
          medium: String,
          campaign: String,
          content: String,
          term: String,
        },
        campaignParams: {
          utm_source: String,
          utm_medium: String,
          utm_campaign: String,
        },
      },
      landingPage: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    eventType: {
      type: String,
      required: true,
      enum: essentialEventTypes,
    },
    eventData: {
      component: String,
      action: String,
      path: String,
      duration: Number,
      status: String,
      formId: String,
      elementId: String,
      errorMessage: String,
      serviceId: String,
      serviceTitle: String,
      category: String,
      visiblePercentage: Number,
      source: String,
      isNewUser: Boolean,
      metadata: mongoose.Schema.Types.Mixed,
      campaignData: {
        campaign: String,
        source: String,
        device: String,
      },
      paymentData: {
        stripeSessionId: String,
        amount: Number,
        currency: String,
        status: {
          type: String,
          enum: ['pending', 'success', 'failed'],
        },
        type: String,
      },
      conversionData: {
        type: {
          type: String,
          enum: ['registration', 'payment'],
        },
        subtype: {
          type: String,
          enum: ['standard', 'google', 'top_up', 'order'],
        },
        value: Number,
        status: {
          type: String,
          enum: ['pending', 'completed', 'failed'],
        },
        source: String,
        path: String,
      },
    },
    userAgent: String,
    ipAddress: String,
    locale: String,
    deviceInfo: {
      screenResolution: String,
      browser: String,
      os: String,
      device: String,
      viewportSize: String,
      colorDepth: Number,
      timeZone: String,
      language: String,
    },
    performanceMetrics: {
      loadTime: Number,
      renderTime: Number,
      networkLatency: Number,
      memoryUsage: Number,
      firstPaint: Number,
      firstContentfulPaint: Number,
      timeToInteractive: Number,
      domContentLoaded: Number,
    },
    userContext: {
      isLoggedIn: Boolean,
      userRole: String,
      lastVisit: Date,
      visitCount: Number,
      isReturningUser: Boolean,
      referrer: String,
      landingPage: String,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indeksy
UserActivitySchema.index({ userId: 1, timestamp: -1 });
UserActivitySchema.index({ sessionId: 1 });
UserActivitySchema.index({ eventType: 1 });
UserActivitySchema.index({ 'eventData.serviceId': 1 });
UserActivitySchema.index({ 'eventData.category': 1 });
UserActivitySchema.index({ 'userContext.isReturningUser': 1 });
UserActivitySchema.index({ 'eventData.conversionData.type': 1 });
UserActivitySchema.index({ 'eventData.metadata.conversionType': 1 });
UserActivitySchema.index({ 'eventData.paymentData.type': 1 });
UserActivitySchema.index({ 'eventData.paymentData.amount': 1 });
UserActivitySchema.index({ 'eventData.paymentData.status': 1 });
UserActivitySchema.index({ 'sessionData.firstReferrer': 1 });
UserActivitySchema.index({ 'sessionData.referrerData.firstReferrer': 1 });
UserActivitySchema.index({ 'eventData.source': 1 });
const UserActivity = mongoose.model('UserActivity', UserActivitySchema);

module.exports = UserActivity;
