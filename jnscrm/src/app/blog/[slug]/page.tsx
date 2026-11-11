import React, { cache as reactCache } from 'react';
import { notFound } from 'next/navigation';
import SingleBlogLayout from '@/components/SingleBlogLayout';
import { Metadata } from 'next';
import { backendUrl } from '@/lib/serverApi';
import type { BlogRecord } from '@/types/content';

export const revalidate = 60;

const SITE_URL = (process.env.SITE_URL || 'https://jnsedu.com').replace(/\/$/, '');
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/pages-banner/Blogs-Banner.webp`;

const getBlog = reactCache(async (slug: string): Promise<BlogRecord | null> => {
  try {
    const res = await fetch(
      backendUrl(`/blogs/public/${encodeURIComponent(slug)}`),
      {
        next: { revalidate: 60 },
        headers: { Accept: 'application/json' },
      },
    );

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as BlogRecord;
  } catch {
    return null;
  }
});

function toAbsoluteUrl(value: string | null | undefined): string {
  if (!value) {
    return DEFAULT_OG_IMAGE;
  }

  try {
    const url = new URL(value, SITE_URL);
    return url.toString();
  } catch {
    // If URL parsing fails, return as-is or default
    return value.startsWith('http') ? value : DEFAULT_OG_IMAGE;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);

  if (!blog) {
    return { title: 'Blog Not Found' };
  }

  const plainText = blog.content
    ? blog.content.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim()
    : '';
  const cleanDescription =
    plainText.length > 160 ? `${plainText.substring(0, 157)}...` : plainText;
  const canonicalUrl = `${SITE_URL}/blog/${blog.slug}`;
  const imageUrl = toAbsoluteUrl(blog.cover_image);

  return {
    title: blog.title,
    description: cleanDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: blog.title,
      description: cleanDescription,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: cleanDescription,
      images: [imageUrl],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);

  if (!blog) {
    notFound();
  }

  return <SingleBlogLayout blog={blog} />;
}
