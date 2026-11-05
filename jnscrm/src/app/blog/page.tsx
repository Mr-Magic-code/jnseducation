// src/app/blog/page.tsx
export const dynamic = 'force-dynamic';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from "next";
import PageHeader from '@/components/PageHeader';
import pool from '@/lib/db'; // Aapke project ki database connection file (path verify kar lein agar alag ho)
import type { BlogRecord } from '@/types/content';

export const metadata: Metadata = {
  title: "Blogs | JnS Education",
  description: "Stay updated with global education news, university admission guidance, and student visa updates.",
};

async function getGeneralBlogs() {
  try {
    // Direct database query aapke blogs table se data fetch karne ke liye
    const [rows] = await pool.query<BlogRecord[]>(
      `SELECT blogs.*, blog_categories.name AS category_name 
       FROM blogs 
       LEFT JOIN blog_categories ON blogs.category_id = blog_categories.id 
       WHERE LOWER(blogs.status) = 'published' 
       ORDER BY blogs.created_at DESC`
    );
    return rows || [];
  } catch (error) {
    console.error('Error fetching general blogs from DB:', error);
    return []; // Safety fallback so the page never crashes
  }
}

export default async function GeneralBlogPage() {
  const blogs = await getGeneralBlogs();

  return (
    <>
      <PageHeader title='Blogs' />
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="best-heading font-extrabold text-gray-900 tracking-tight">General Blogs & Articles</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">Explore our global insights, updates, and study abroad guides.</p>
          </div>

          {blogs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs max-w-xl mx-auto">
              <p className="text-gray-500 text-sm font-medium">No published blogs found in database right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {blogs.map((blog) => (
                <article key={blog.id} className="bg-white rounded-3xl overflow-hidden border border-gray-200/85 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                      {blog.cover_image ? (
                        <Image
                          src={blog.cover_image}
                          alt={blog.title}
                          fill
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold uppercase tracking-wider">JnS Education</div>
                      )}
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-xs text-primary rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        {blog.category_name || 'General'}
                      </span>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <span>{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : ''}</span>
                        <span>•</span>
                        <span>By {blog.author_name || 'Admin'}</span>
                      </div>
                      <h2 className="small-heading text-gray-900 group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h2>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <Link href={`/blog/${blog.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-blue-700 transition-colors">
                      <span>Read Article</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}