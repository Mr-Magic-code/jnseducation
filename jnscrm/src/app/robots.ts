import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.SITE_URL || 'https://jnsedu.com').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/protection/', '/backend/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
