'use client';

import React, { useMemo, memo } from 'react';
import type {
  AppTab,
  EventStatus,
  Message,
  PageItem,
} from '@/types/dashboard';

interface AddEventTabProps {
  message: Message;
  handleSaveEvent: (e: React.FormEvent) => void;
  editingEventId: number | null;
  eventName: string;
  setEventName: (val: string) => void;
  eventDayDate: string;
  setEventDayDate: (val: string) => void;
  eventTime: string;
  setEventTime: (val: string) => void;
  eventVenue: string;
  setEventVenue: (val: string) => void;
  eventCoverImage: string;
  setEventCoverImage: (val: string) => void;
  eventTargetPage: string;
  setEventTargetPage: (val: string) => void;
  eventStatus: EventStatus;
  setEventStatus: (status: EventStatus) => void;
  isTargetPageDropdownOpen: boolean;
  setIsTargetPageDropdownOpen: (isOpen: boolean) => void;
  targetPageSearchQuery: string;
  setTargetPageSearchQuery: (val: string) => void;
  targetPageDropdownRef: React.RefObject<HTMLDivElement | null>;
  filteredTargetPages: PageItem[];
  fetchData: (tab: AppTab) => void;
}

const AddEventTab = memo(function AddEventTab({
  message,
  handleSaveEvent,
  editingEventId,
  eventName,
  setEventName,
  eventDayDate,
  setEventDayDate,
  eventTime,
  setEventTime,
  eventVenue,
  setEventVenue,
  eventCoverImage,
  setEventCoverImage,
  eventTargetPage,
  setEventTargetPage,
  eventStatus,
  setEventStatus,
  isTargetPageDropdownOpen,
  setIsTargetPageDropdownOpen,
  targetPageSearchQuery,
  setTargetPageSearchQuery,
  targetPageDropdownRef,
  filteredTargetPages,
  fetchData,
}: AddEventTabProps) {

  // Smart & Robust filtering for events and their child/sub-pages
  const eventFilteredPages = useMemo(() => {
    if (!Array.isArray(filteredTargetPages)) return [];
    
    const query = targetPageSearchQuery.toLowerCase().trim();

    // First filter strictly for events and child pages
    const matchedEvents = filteredTargetPages.filter((p) => {
      const pathLower = (p.path || '').toLowerCase();
      const nameLower = (p.name || '').toLowerCase();
      const parentLower = (p.parentPage || '').toLowerCase();

      return (
        pathLower === 'events' || 
        pathLower.startsWith('events/') || 
        pathLower.startsWith('/events/') ||
        pathLower.includes('event') ||
        nameLower.includes('event') || 
        parentLower === 'events' ||
        parentLower.includes('event')
      );
    });

    // Fallback: Agar strictly koi event page match na ho (misal ke tor par agar DB mein path format alag ho), 
    // toh saare pages le lenge taake dropdown kabhi khali na ho aur user ko options mil sakein.
    const baseList = matchedEvents.length > 0 ? matchedEvents : filteredTargetPages;

    // Apply search query filter if user is typing in the search box
    if (!query) return baseList;

    return baseList.filter((p) => {
      const pathLower = (p.path || '').toLowerCase();
      const nameLower = (p.name || '').toLowerCase();
      return nameLower.includes(query) || pathLower.includes(query);
    });
  }, [filteredTargetPages, targetPageSearchQuery]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {message.text && (
        <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {editingEventId ? 'Edit Event Details' : 'Create New Event'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Fill in the details below to publish or update an event.</p>
        </div>

        <form onSubmit={handleSaveEvent} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Event Name *</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. UK Education Fair 2026"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Day & Date *</label>
              <input
                type="text"
                value={eventDayDate}
                onChange={(e) => setEventDayDate(e.target.value)}
                placeholder="e.g. Friday, 19th June 2026"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Time *</label>
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="e.g. 02:00 PM - 05:00 PM"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Venue *</label>
              <input
                type="text"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                placeholder="e.g. Pearl Continental Hotel, Lahore"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cover Image (URL or Path)</label>
              <input
                type="text"
                value={eventCoverImage}
                onChange={(e) => setEventCoverImage(e.target.value)}
                placeholder="/images/events/banner.jpg or http..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary transition"
              />
            </div>

            {/* Target Page Dropdown with optimized responsive design */}
            <div className="relative" ref={targetPageDropdownRef}>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Target Page *</label>
              <button
                type="button"
                onClick={() => setIsTargetPageDropdownOpen(!isTargetPageDropdownOpen)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-xs flex items-center justify-between text-sm font-medium text-gray-900 hover:border-gray-300 focus:outline-none transition cursor-pointer"
              >
                <span className="truncate">
                  {eventTargetPage ? `/${eventTargetPage}` : 'Select Target Page'}
                </span>
                <svg className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${isTargetPageDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isTargetPageDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                  <div className="relative p-1">
                    <input
                      type="text"
                      value={targetPageSearchQuery}
                      onChange={(e) => setTargetPageSearchQuery(e.target.value)}
                      placeholder="Search event pages..."
                      className="w-full px-3 py-1.5 pl-8 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 outline-none focus:bg-white focus:border-primary"
                    />
                    <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  
                  <div className="max-h-[190px] overflow-y-auto space-y-1">
                    {eventFilteredPages.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-400">No event sub-pages found.</div>
                    ) : (
                      eventFilteredPages.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setEventTargetPage(p.path);
                            setIsTargetPageDropdownOpen(false);
                            setTargetPageSearchQuery('');
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                            eventTargetPage === p.path ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                          }`}
                        >
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[10px] font-mono text-gray-400">/{p.path}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Event Status *</label>
              <select
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value as EventStatus)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-primary transition cursor-pointer"
              >
                <option value="Live">Live</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Past Event">Past Event</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => fetchData('all-events')}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
            >
              {editingEventId ? 'Update Event' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default AddEventTab;