'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import Image from 'next/image';

interface EventItem {
  id: number;
  event_name: string;
  day_date: string;
  event_time: string;
  venue: string;
  cover_image: string | null;
  target_page: string;
  status: 'Live' | 'Coming Soon' | 'Past Event';
  created_at: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'Live' | 'Coming Soon' | 'Past Event'>('Live');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvents() {
      try {
        const res = await fetch('/backend/events/public', {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to load events (${res.status}).`);
        }

        const data = (await res.json()) as { events?: EventItem[] };
        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error fetching events:', error);
          setLoadError('Unable to load events right now. Please try again later.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchEvents();

    return () => controller.abort();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const status = (ev.status || '').trim().toLowerCase();
    if (activeSubTab === 'Live') return status === 'live';
    if (activeSubTab === 'Coming Soon') return status === 'coming soon';
    if (activeSubTab === 'Past Event') return status === 'past event';
    return false;
  });

  return (
    <>
    <PageHero title='Events' bgImage='/images/events/events-banner.webp' />
    <main className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Upcoming & Past Events</h1>
          <p className="text-base sm:text-lg text-gray-600">Join our interactive sessions, seminars, and educational webinars.</p>
        </div>

        {/* Interactive Tabs Header */}
        <div className="flex justify-center">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200/80 inline-flex gap-2">
            {(['Live', 'Coming Soon', 'Past Event'] as const).map((tabName) => {
              const isActive = activeSubTab === tabName;
              return (
                <button
                  key={tabName}
                  onClick={() => setActiveSubTab(tabName)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tabName === 'Live' ? 'Live Events' : tabName === 'Coming Soon' ? 'Upcoming Events' : 'Past Events'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Pane */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-400 font-medium">Loading events...</div>
        ) : loadError ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-xl mx-auto">
            <p className="text-red-600 text-sm font-medium">{loadError}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-xl mx-auto">
            <p className="text-gray-500 text-sm font-medium">
              No {activeSubTab === 'Live' ? 'Live' : activeSubTab === 'Coming Soon' ? 'Upcoming' : 'Past'} events found right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((ev) => {
              const status = (ev.status || '').toLowerCase();
              const isComingSoon = status === 'coming soon';
              const isPast = status === 'past event';

              return (
                <div key={ev.id} className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    {/* Cover Image Container */}
                    <div className="relative h-52 w-full bg-gray-200 overflow-hidden">
                      {ev.cover_image ? (
                        <Image
                          src={ev.cover_image}
                          alt={ev.event_name || 'Event Banner'}
                          fill
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                          JnS Event
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                      {/* Status Badge */}
                      <span className={`absolute top-4 left-4 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm z-10 ${
                        isComingSoon ? 'bg-amber-500 text-white' :
                        isPast ? 'bg-gray-800 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {ev.status || 'Live'}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      <h2 className="small-heading text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {ev.event_name}
                      </h2>

                      {isPast ? (
                        <div className="space-y-2.5 text-xs text-gray-600 font-medium pt-1">
                          <div className="flex items-start gap-2.5">
                            <span className="shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </span>
                            <div className="grid grid-cols-[auto_1fr] gap-x-1.5 w-full">
                              <span className="text-gray-500 font-semibold">Date:</span>
                              <strong className="text-gray-900 break-words">{ev.day_date}</strong>
                            </div>
                          </div>
                        </div>
                      ) : isComingSoon ? (
                        <div className="space-y-2.5 text-xs text-gray-500 pt-1">
                          <div className="flex items-start gap-2.5">
                            <span className="shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </span>
                            <div className="grid grid-cols-[auto_1fr] gap-x-1.5 w-full">
                              <span className="text-gray-400 font-semibold">Date:</span>
                              <span className="font-semibold text-amber-600">will announce soon</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                            <div className="grid grid-cols-[auto_1fr] gap-x-1.5 w-full">
                              <span className="text-gray-400 font-semibold">Time:</span>
                              <span className="font-semibold text-amber-600">will announce soon</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </span>
                            <div className="grid grid-cols-[auto_1fr] gap-x-1.5 w-full">
                              <span className="text-gray-400 font-semibold">Venue:</span>
                              <span className="font-semibold text-amber-600">will announce soon</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5 text-xs text-gray-600 font-medium pt-1">
                          <div className="flex items-start gap-2.5">
                            <span className="shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </span>
                            <div className="grid grid-cols-[auto_1fr] gap-x-1.5 w-full">
                              <span className="text-gray-500 font-semibold">Date:</span>
                              <strong className="text-gray-900 break-words">{ev.day_date}</strong>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                            <div className="grid grid-cols-[auto_1fr] gap-x-1.5 w-full">
                              <span className="text-gray-500 font-semibold">Time:</span>
                              <strong className="text-gray-900 break-words">{ev.event_time}</strong>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </span>
                            <div className="grid grid-cols-[auto_1fr] gap-x-1.5 w-full">
                              <span className="text-gray-500 font-semibold">Venue:</span>
                              <strong className="text-gray-900 break-words">{ev.venue}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Link for Live Events */}
                  {!isComingSoon && !isPast && (
                    <div className="p-6 pt-0">
                      <Link href={ev.target_page || '#'} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-blue-700 transition-colors">
                        <span>Register / View Details</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
    </>
  );
}