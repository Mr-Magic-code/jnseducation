'use client';
import React from 'react';
import ShareModal from '../ShareModal';
export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
}

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="w-full font-sans">
      {/* 1. Dynamic Hero Blue Banner */}
      <section className="bg-[#2270c9] text-white py-8 sm:py-12 md:py-14 px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-start gap-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.2] text-white">
            {title}
          </h1>

          {/* Share Button (Without published date) */}
          <div className="flex items-center">
            <ShareModal title={title} />
          </div>
        </div>
      </section>
    </div>
  );
}
