'use client';

import React, { useMemo, useCallback } from 'react';
import type {
  AppTab,
  BlogItem,
  PageItem,
  RequestUser,
  Submission,
} from '@/types/dashboard';

interface OverviewTabProps {
  userName: string;
  totalBlogsCount?: number;
  totalSubmissions: number;
  submissions: Submission[];
  unreadLeadsCount?: number;
  allUsers: RequestUser[];
  approvedUsersCount?: number;
  requests: RequestUser[];
  blogs: BlogItem[];
  totalFilteredPagesCount: number;
  pagesList: PageItem[];
  userRole: string;
  fetchData: (tab: AppTab) => void;
  setEditingBlogId: (id: number | null) => void;
}

function OverviewTabComponent({
  userName,
  totalBlogsCount = 0,
  totalSubmissions,
  submissions,
  unreadLeadsCount,
  allUsers,
  approvedUsersCount,
  requests,
  totalFilteredPagesCount,
  pagesList,
  userRole,
  fetchData,
  setEditingBlogId,
}: OverviewTabProps) {

  const unreadLeads = useMemo(() => {
    return submissions.filter(s => (s.status || '').toLowerCase() === 'unread');
  }, [submissions]);

  const totalUnread = unreadLeadsCount ?? unreadLeads.length;

  const limitedUnreadLeads = useMemo(() => {
    return unreadLeads.slice(0, 5);
  }, [unreadLeads]);

  const limitedPages = useMemo(() => {
    return pagesList.slice(0, 5);
  }, [pagesList]);

  // 🚀 Optimized Stable Handlers
  const handleWriteBlogClick = useCallback(() => {
    setEditingBlogId(null);
    fetchData('add-blog');
  }, [setEditingBlogId, fetchData]);

  const handleFetchSubmissions = useCallback(() => fetchData('submissions'), [fetchData]);
  const handleFetchUsersOrOverview = useCallback(() => fetchData(userRole === 'Super-Admin' ? 'users' : 'overview'), [fetchData, userRole]);
  const handleFetchAllBlogs = useCallback(() => fetchData('all-blogs'), [fetchData]);
  const handleFetchAllPages = useCallback(() => fetchData('all-pages'), [fetchData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="small-heading sm:text-2xl font-bold">Welcome back, {userName}! 👋</h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">Here is a quick snapshot and overview of your website activity today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleWriteBlogClick}
            className="px-4 py-2 bg-white text-primary hover:bg-blue-50 rounded-xl text-xs sm:text-sm font-bold shadow transition cursor-pointer"
          >
            + Write Blog
          </button>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div onClick={handleFetchSubmissions} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-primary transition-colors">Total Leads</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-primary flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-gray-900">{totalSubmissions}</p>
            <p className="text-xs text-blue-600 font-medium mt-1">View Leads</p>
          </div>
        </div>

        <div onClick={handleFetchSubmissions} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all duration-200 cursor-pointer flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-amber-500 transition-colors">New Leads</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-amber-500">{totalUnread}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Requires attention</p>
          </div>
        </div>

        {userRole === 'Super-Admin' && (
          <div onClick={handleFetchUsersOrOverview} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-purple-600 transition-colors">All Users</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-extrabold text-gray-900">{approvedUsersCount !== undefined ? approvedUsersCount : allUsers.length}</p>
                <span className="text-xs text-gray-400 font-medium">Approved</span>
              </div>
              {requests.length > 0 && (
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-500">{requests.length}</p>
                  <span className="text-[10px] text-amber-600 font-semibold uppercase">Pending</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div onClick={handleFetchAllBlogs} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-emerald-600 transition-colors">Content</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6m-4 4h4" /></svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-extrabold text-emerald-600">{totalBlogsCount}</p>
              <span className="text-xs text-gray-400 font-medium">Total Blogs</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-800">{totalFilteredPagesCount}</p>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Pages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <h3 className="small-heading text-gray-900">New Unread Leads</h3>
                <span className="px-2 py-0.5 bg-blue-50 text-primary border border-blue-200 rounded-full text-xs font-bold">
                  {totalUnread}
                </span>
              </div>
              <button onClick={handleFetchSubmissions} className="text-xs font-bold text-primary hover:underline cursor-pointer">View All →</button>
            </div>
            
            <div className="divide-y divide-gray-100 mt-2">
              {limitedUnreadLeads.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No new unread leads right now! 🎉</p>
              ) : (
                limitedUnreadLeads.map((sub) => {
                  const pData = sub.parsed_data || {};
                  const leadName = pData.fullName || pData.name || pData.ceoName || (pData.firstName ? `${pData.firstName} ${pData.lastName || ''}`.trim() : 'N/A');
                  const leadEmail = pData.email || pData.ceoEmail || 'N/A';
                  const dateObj = new Date(sub.created_at);

                  return (
                    <div key={sub.id} className="py-3 flex items-center justify-between hover:bg-gray-50/60 px-3 rounded-2xl transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {leadName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{leadName}</p>
                          <p className="text-xs text-gray-400">{leadEmail} <span className="font-medium text-primary">{sub.form_type}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-50 text-primary border border-blue-200">
                          Unread
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">{!isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <button onClick={handleFetchSubmissions} className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-blue-50 text-primary rounded-xl text-xs font-bold transition border border-gray-100 cursor-pointer">
            Open Submissions Manager
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <h3 className="small-heading text-gray-900">Recent Pages</h3>
                <span className="px-2 py-0.5 bg-blue-50 text-primary border border-blue-200 rounded-full text-xs font-bold">
                  {totalFilteredPagesCount}
                </span>
              </div>
              <button onClick={handleFetchAllPages} className="text-xs font-bold text-primary hover:underline cursor-pointer">View All →</button>
            </div>
            
            <div className="divide-y divide-gray-100 mt-2">
              {limitedPages.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No pages found in directory.</p>
              ) : (
                limitedPages.map((page, idx) => {
                  return (
                    <div key={idx} className="py-3 flex items-center justify-between hover:bg-gray-50/60 px-3 rounded-2xl transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          📄
                        </div>
                        <div className="max-w-[220px] sm:max-w-[260px]">
                          <p className="text-sm font-semibold text-gray-900 truncate" title={page.name}>{page.name}</p>
                          <p className="text-xs font-mono text-primary truncate">{page.path}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <button onClick={handleFetchAllPages} className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-blue-50 text-primary rounded-xl text-xs font-bold transition border border-gray-100 cursor-pointer">
            Open Pages Directory
          </button>
        </div>
      </div>
    </div>
  );
}

export const OverviewTab = React.memo(OverviewTabComponent);
export default OverviewTab;