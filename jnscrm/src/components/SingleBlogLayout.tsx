import React from 'react';
import ShareModal from './ShareModal';
import { sanitizeBlogHtml } from '@/lib/sanitize';
import Image from 'next/image';

interface SingleBlogLayoutProps {
  blog: {
    title: string;
    cover_image: string | null;
    author_name: string | null;
    created_at: string | Date;
    content: string;
    category_name?: string | null; // Region ki jagah category name
  };
}

export default function SingleBlogLayout({ blog }: SingleBlogLayoutProps) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 font-sans">
      {/* Cover Image */}
      {blog.cover_image && (
        <Image 
          src={blog.cover_image} 
          alt={blog.title} 
          width={1200}
          height={630}
          className="w-full h-80 sm:h-96 object-cover rounded-3xl shadow-lg mb-8" 
        />
      )}
      
      <div className="space-y-4 mb-8">
        {/* Category Badge */}
        {blog.category_name && (
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#0071f6] rounded-full text-xs font-bold uppercase tracking-wide">
            {blog.category_name}
          </span>
        )}
        
        {/* Blog Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          {blog.title}
        </h1>
        
        {/* Author Info & Share Modal Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-gray-100 pb-6">
          
          {/* Author Details */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0071f6] text-white rounded-full flex items-center justify-center font-bold text-xs">
                {blog.author_name ? blog.author_name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="font-semibold text-gray-800">{blog.author_name || 'Admin'}</span>
            </div>
            <span>•</span>
            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
          </div>

          {/* Share Modal Integration (Original as requested) */}
          <div className='w-10 h-10 bg-primary rounded-full'>
            <ShareModal title={blog.title} />
          </div>
          
        </div>
      </div>

      {/* Blog HTML Content with Bullet Lists Fixed */}
      <div 
        className="prose max-w-none text-gray-800 text-base sm:text-lg leading-relaxed space-y-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
        dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(blog.content) }} 
      />
    </main>
  );
}