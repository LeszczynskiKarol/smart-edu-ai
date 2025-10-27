// src/app/robots.ts
import { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pl/', '/en/'],
        disallow: ['/api/', '/*?*', '/private/', '/admin/'],
      },
    ],
    sitemap: 'https://www.smart-edu.ai/sitemap.xml',
  };
}
