'use client';

import React from 'react';
import Image from 'next/image';
import type {
  AppTab,
  EventItem,
  EventStatus,
  Message,
} from '@/types/dashboard';

interface EventsTabProps {
  message: Message;
  eventTableTab: 'All' | EventStatus;
  setEventTableTab: (tab: 'All' | EventStatus) => void;
  eventSearchQuery: string;
  setEventSearchQuery: (val: string) => void;
  filteredEvents: EventItem[];
  handleEditEventClick: (ev: EventItem) => void;
  handleDeleteEvent: (id: number) => void;
  fetchData: (tab: AppTab) => void;
  setEditingEventId: (id: number | null) => void;
  setEventName: (val: string) => void;
  setEventDayDate: (val: string) => void;
  setEventTime: (val: string) => void;
  setEventVenue: (val: string) => void;
  setEventCoverImage: (val: string) => void;
  setEventTargetPage: (val: string) => void;
  setEventStatus: (status: EventStatus) => void;
}

export default function EventsTab({
  message,
  eventTableTab,
  setEventTableTab,
  eventSearchQuery,
  setEventSearchQuery,
  filteredEvents,
  handleEditEventClick,
  handleDeleteEvent,
  fetchData,
  setEditingEventId,
  setEventName,
  setEventDayDate,
  setEventTime,
  setEventVenue,
  setEventCoverImage,
  setEventTargetPage,
  setEventStatus,
}: EventsTabProps) {
  return (
    <div className="space-y-6 w-full">
      {message.text && (
        <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm w-full">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {(['All', 'Live', 'Coming Soon', 'Past Event'] as const).map((tabName) => (
            <button
              key={tabName}
              onClick={() => setEventTableTab(tabName)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                eventTableTab === tabName ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tabName}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              value={eventSearchQuery}
              onChange={(e) => setEventSearchQuery(e.target.value)}
              placeholder="Search events by name or venue..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-primary"
            />
          </div>

          <button
            onClick={() => {
              setEditingEventId(null);
              setEventName('');
              setEventDayDate('');
              setEventTime('');
              setEventVenue('');
              setEventCoverImage('');
              setEventTargetPage('');
              setEventStatus('Live');
              fetchData('add-event');
            }}
            className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow transition cursor-pointer shrink-0"
          >
            + Add Event
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto relative w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Cover</th>
                <th className="p-4">Event Name</th>
                <th className="p-4">Day & Date</th>
                <th className="p-4">Time</th>
                <th className="p-4">Venue</th>
                <th className="p-4">Target Page</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400">No events found. Click &quot;+ Add Event&quot; to create one!</td></tr>
              ) : (
                filteredEvents.map((ev) => {
                  const rawTarget = ev.target_page || '';
                  let targetUrl = '#';

                  if (rawTarget) {
                    if (rawTarget.startsWith('/') && !rawTarget.startsWith('//')) {
                      targetUrl = rawTarget;
                    } else if (
                      rawTarget.startsWith('http://') ||
                      rawTarget.startsWith('https://')
                    ) {
                      try {
                        const url = new URL(rawTarget);
                        if (url.origin === window.location.origin) {
                          targetUrl = rawTarget;
                        }
                      } catch {
                        targetUrl = '#';
                      }
                    }
                  }

                  return (
                    <tr key={ev.id} className="hover:bg-[#eef5ff]/60 transition">
                      <td className="p-4">
                        {ev.cover_image ? (
                          <Image src={ev.cover_image} alt={ev.event_name} width={56} height={40} className="w-14 h-10 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-semibold">No Image</div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">{ev.event_name}</td>
                      <td className="p-4 text-xs font-medium text-gray-700">{ev.day_date}</td>
                      <td className="p-4 text-xs text-gray-600 font-mono">{ev.event_time || 'N/A'}</td>
                      <td className="p-4 text-xs text-gray-600">{ev.venue || 'N/A'}</td>
                      <td className="p-4 text-xs font-mono text-primary">
                        {ev.target_page ? `/${ev.target_page.replace(/^\/+/, '')}` : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          ev.status === 'Live' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          ev.status === 'Coming Soon' ? 'bg-blue-50 text-primary border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        {/* View Event Button (Eye Icon) */}
                        <a 
                          href={targetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-blue-200 inline-flex items-center justify-center" 
                          title="View Event Page"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>

                        {/* Edit Event Button */}
                        <button onClick={() => handleEditEventClick(ev)} className="p-2 bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-amber-200 inline-flex items-center justify-center" title="Edit Event">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>

                        {/* Delete Event Button */}
                        <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-red-200 inline-flex items-center justify-center" title="Delete Event">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}