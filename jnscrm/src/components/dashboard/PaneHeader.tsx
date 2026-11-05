'use client';

import React from 'react';

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: string;
  editingBlogId: number | null;
  editingEventId: number | null;
  userName: string;
  userEmail: string;
  userRole: string;
}

export default function Header({
  setIsSidebarOpen,
  activeTab,
  editingBlogId,
  editingEventId,
  userName,
  userEmail,
  userRole,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 sm:p-5 bg-white border-b border-gray-200 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-1 text-gray-600 rounded-xl hover:bg-gray-100 lg:hidden focus:outline-none cursor-pointer">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h1 className="best-heading text-gray-800 truncate">
          {activeTab === 'overview' && 'Overview'}
          {activeTab === 'all-pages' && 'All Pages'}
          {activeTab === 'submissions' && 'Leads'}
          {activeTab === 'all-blogs' && 'All Blogs'}
          {activeTab === 'add-blog' && (editingBlogId ? 'Edit Blog' : 'Create New Blog')}
          {activeTab === 'blog-categories' && 'Blog Categories'}
          {activeTab === 'all-events' && 'All Events'}
          {activeTab === 'add-event' && (editingEventId ? 'Edit Event' : 'Add New Event')}
          {activeTab === 'requests' && 'Pending Requests'}
          {activeTab === 'users' && 'Approved Users'}
        </h1>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-right hidden sm:flex flex-col justify-center">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p>
          {userEmail && <p className="text-xs text-gray-500 leading-tight mt-0.5">{userEmail}</p>}
          <p className="text-xs font-medium text-primary leading-tight mt-0.5">
            {userRole === 'Super-Admin' ? 'Super Admin' : userRole || 'Manager'}
          </p>
        </div>
        <div className="w-10 h-10 bg-primary rounded-full flex shrink-0 items-center justify-center text-white font-bold shadow">
          {userName ? userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}