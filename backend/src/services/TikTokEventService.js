// backend/src/services/TikTokEventService.js
const crypto = require('crypto');

class TikTokEventService {
  constructor() {
    this.ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
    this.PIXEL_ID = 'CTKK923C77U1GH2B812G';
    this.API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
  }

  async trackEvent(eventName, data) {
    if (!data.source || !['tiktok', 'ttclid'].includes(data.source)) {
      return;
    }
    try {
      const payload = {
        event_source: 'web',
        event_source_id: this.PIXEL_ID,
        data: [
          {
            event: eventName,
            event_time: Math.floor(Date.now() / 1000),
            user: {
              email: data.email ? this.hashData(data.email) : undefined,
              external_id: data.external_id
                ? this.hashData(data.external_id)
                : undefined,
            },
            properties: {
              currency: data.currency,
              value: data.value,
              content_id: data.content_id,
              content_type: data.content_type,
              content_name: data.content_name,
            },
            page: {
              url: data.url,
              referrer: data.referrer,
            },
          },
        ],
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Access-Token': this.ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.json();
    } catch (error) {
      console.error('TikTok Event API Error:', error);
      throw error;
    }
  }

  hashData(data) {
    return crypto
      .createHash('sha256')
      .update(data.toLowerCase().trim())
      .digest('hex');
  }
}

module.exports = new TikTokEventService();
