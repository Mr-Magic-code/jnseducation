'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import type { AppTab, EventStatus } from '@/types/dashboard';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: string;
  fetchData: (tab: AppTab) => void;
  userRole: string;
  isEventsMenuOpen: boolean;
  setIsEventsMenuOpen: (isOpen: boolean) => void;
  isBlogsMenuOpen: boolean;
  setIsBlogsMenuOpen: (isOpen: boolean) => void;
  setEditingEventId: (id: number | null) => void;
  setEventName: (val: string) => void;
  setEventDayDate: (val: string) => void;
  setEventTime: (val: string) => void;
  setEventVenue: (val: string) => void;
  setEventCoverImage: (val: string) => void;
  setEventTargetPage: (val: string) => void;
  setEventStatus: (status: EventStatus) => void;
  setEditingBlogId: (id: number | null) => void;
  handleLogout: () => void;
}

function SidebarComponent({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  fetchData,
  userRole,
  isEventsMenuOpen,
  setIsEventsMenuOpen,
  isBlogsMenuOpen,
  setIsBlogsMenuOpen,
  setEditingEventId,
  setEventName,
  setEventDayDate,
  setEventTime,
  setEventVenue,
  setEventCoverImage,
  setEventTargetPage,
  setEventStatus,
  setEditingBlogId,
  handleLogout,
}: SidebarProps) {

  // 🚀 Optimized Memoized Handlers
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), [setIsSidebarOpen]);
  const handleOverviewClick = useCallback(() => fetchData('overview'), [fetchData]);
  const handlePagesClick = useCallback(() => fetchData('all-pages'), [fetchData]);
  const handleSubmissionsClick = useCallback(() => fetchData('submissions'), [fetchData]);
  
  const handleToggleEventsMenu = useCallback(() => setIsEventsMenuOpen(!isEventsMenuOpen), [isEventsMenuOpen, setIsEventsMenuOpen]);
  const handleFetchAllEvents = useCallback(() => fetchData('all-events'), [fetchData]);
  
  const handleAddEventClick = useCallback(() => {
    setEditingEventId(null);
    setEventName('');
    setEventDayDate('');
    setEventTime('');
    setEventVenue('');
    setEventCoverImage('');
    setEventTargetPage('');
    setEventStatus('Live');
    fetchData('add-event');
  }, [setEditingEventId, setEventName, setEventDayDate, setEventTime, setEventVenue, setEventCoverImage, setEventTargetPage, setEventStatus, fetchData]);

  const handleToggleBlogsMenu = useCallback(() => setIsBlogsMenuOpen(!isBlogsMenuOpen), [isBlogsMenuOpen, setIsBlogsMenuOpen]);
  const handleFetchAllBlogs = useCallback(() => fetchData('all-blogs'), [fetchData]);

  const handleAddBlogClick = useCallback(() => {
    setEditingBlogId(null);
    fetchData('add-blog');
  }, [setEditingBlogId, fetchData]);

  const handleCategoriesClick = useCallback(() => fetchData('blog-categories'), [fetchData]);
  const handleRequestsClick = useCallback(() => fetchData('requests'), [fetchData]);
  const handleUsersClick = useCallback(() => fetchData('users'), [fetchData]);

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity" onClick={handleCloseSidebar} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-gray-800 flex flex-col shadow-2xl lg:shadow-none border-r border-gray-200 shrink-0 transform transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 lg:p-6 text-2xl font-bold tracking-wider border-b border-gray-200 flex items-center justify-between">
          <Image src="/images/Icons/Jns-Education-Logo.svg" alt="Logo" width={32} height={32} className="w-auto h-8" />
          <button className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer" onClick={handleCloseSidebar}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto">
          <button 
            onClick={handleOverviewClick}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${activeTab === 'overview' ? 'bg-primary text-white shadow-sm' : 'hover:bg-hover-clr text-gray-700'}`}
          >
            Dashboard
          </button>

          <div className="pt-1">
            <button
              onClick={handlePagesClick}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${
                activeTab === 'all-pages' ? 'bg-primary text-white shadow-sm' : 'hover:bg-hover-clr text-gray-700'
              }`}
            >
              <span>Pages</span>
            </button>
          </div>
          
          <button 
            onClick={handleSubmissionsClick} 
            className={`w-full flex items-center px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${activeTab === 'submissions' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'}`}
          >
            Leads
          </button>

          <div className="pt-1">
            <button
              onClick={handleToggleEventsMenu}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${
                ['all-events', 'add-event'].includes(activeTab)
                  ? 'bg-blue-50 text-primary' : 'hover:bg-hover-clr text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Events</span>
              </div>
              <svg className={`w-4 h-4 transition-transform duration-200 ${isEventsMenuOpen || ['all-events', 'add-event'].includes(activeTab) ? 'rotate-180 text-primary' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {(isEventsMenuOpen || ['all-events', 'add-event'].includes(activeTab)) && (
              <div className="pl-4 pr-1 py-1.5 space-y-1">
                <button
                  onClick={handleFetchAllEvents}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'all-events' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  View All Events
                </button>
                <button
                  onClick={handleAddEventClick}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'add-event' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  Add New Event
                </button>
              </div>
            )}
          </div>

          <div className="pt-1">
            <button
              onClick={handleToggleBlogsMenu}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${
                ['all-blogs', 'add-blog', 'blog-categories'].includes(activeTab)
                  ? 'bg-blue-50 text-primary' : 'hover:bg-hover-clr text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Blogs</span>
              </div>
              <svg className={`w-4 h-4 transition-transform duration-200 ${isBlogsMenuOpen || ['all-blogs', 'add-blog', 'blog-categories'].includes(activeTab) ? 'rotate-180 text-primary' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {(isBlogsMenuOpen || ['all-blogs', 'add-blog', 'blog-categories'].includes(activeTab)) && (
              <div className="pl-4 pr-1 py-1.5 space-y-1">
                <button
                  onClick={handleFetchAllBlogs}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'all-blogs' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  All Blogs
                </button>
                <button
                  onClick={handleAddBlogClick}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'add-blog' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  Add New Blog
                </button>
                <button
                  onClick={handleCategoriesClick}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'blog-categories' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  Categories
                </button>
              </div>
            )}
          </div>

          {userRole === 'Super-Admin' && (
            <>
              <button 
                onClick={handleRequestsClick}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${activeTab === 'requests' ? 'bg-primary text-white shadow-sm' : 'hover:bg-hover-clr text-gray-700'}`}
              >
                User Requests
              </button>
              
              <button 
                onClick={handleUsersClick}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${activeTab === 'users' ? 'bg-primary text-white shadow-sm' : 'hover:bg-hover-clr text-gray-700'}`}
              >
                All Users
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition duration-200 text-sm font-medium border border-red-200 cursor-pointer text-center block"
          >
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}

export const Sidebar = React.memo(SidebarComponent);
export default Sidebar;