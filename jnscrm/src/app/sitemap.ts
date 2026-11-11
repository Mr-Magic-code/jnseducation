import type { MetadataRoute } from 'next';
import { backendUrl } from '@/lib/serverApi';

const SITE_URL = (process.env.SITE_URL || 'https://jnsedu.com').replace(/\/$/, '');

export const revalidate = 3600;

const STATIC_ROUTES = [
  '',
  '/about-us',
  '/blog',
  '/events',
  '/offices',
  '/get-free-consultation',
  '/jns-support',
  '/agent-registration',
  '/study-in-uk',
  '/thank-you',
];

interface PublicBlog {
  slug: string;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(backendUrl('/blogs/public?limit=100'), {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = (await response.json()) as { blogs?: PublicBlog[] };
      blogEntries = (data.blogs ?? [])
        .filter((blog) => Boolean(blog.slug))
        .map((blog) => ({
          url: `${SITE_URL}/blog/${blog.slug}`,
          lastModified: blog.updated_at ? new Date(blog.updated_at) : now,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }));
    }
  } catch {
    blogEntries = [];
  }

  return [...staticEntries, ...blogEntries];
}
