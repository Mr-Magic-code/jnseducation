'use client';

import React from 'react';
import type { Message, PageItem } from '@/types/dashboard';

interface PagesTabProps {
  message: Message;
  totalFilteredPagesCount: number;
  handleScanPages: () => void;
  pageSearchQuery: string;
  setPageSearchQuery: (val: string) => void;
  pagesList: PageItem[];
  handleSavePageToDB: (page: PageItem) => void;
  totalPagesPages: number;
  currentPagePages: number;
  setCurrentPagePages: (page: number | ((prev: number) => number)) => void;
  itemsPerPagePages: number;
  setItemsPerPagePages: (num: number) => void;
  goToPageInputPages: string;
  setGoToPageInputPages: (val: string) => void;
  isPerPageOpenPages: boolean;
  setIsPerPageOpenPages: (isOpen: boolean) => void;
  perPageDropdownRefPages: React.RefObject<HTMLDivElement | null>;
  userRole?: string;
}

export default function PagesTab({
  message,
  totalFilteredPagesCount,
  handleScanPages,
  pageSearchQuery,
  setPageSearchQuery,
  pagesList,
  handleSavePageToDB,
  totalPagesPages,
  currentPagePages,
  setCurrentPagePages,
  itemsPerPagePages,
  setItemsPerPagePages,
  goToPageInputPages,
  setGoToPageInputPages,
  isPerPageOpenPages,
  setIsPerPageOpenPages,
  perPageDropdownRefPages,
}: PagesTabProps) {

  const displayedPages = pagesList;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {message.text && (
        <div className={`p-4 rounded-xl text-sm border transition-all duration-300 shadow-xs ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 relative p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="small-heading text-gray-950 font-bold">Total Scanned Pages ({totalFilteredPagesCount})</h2>
            
            <button
              type="button"
              onClick={handleScanPages}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-primary rounded-xl transition duration-200 cursor-pointer flex items-center justify-center shadow-xs"
              title="Scan Frontend Pages"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={pageSearchQuery}
              onChange={(e) => {
                setPageSearchQuery(e.target.value);
                setCurrentPagePages(1);
              }}
              placeholder="Search pages by name or path..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-primary transition"
            />
            {pageSearchQuery && (
              <button 
                onClick={() => setPageSearchQuery('')} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto relative rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Page Title / Name</th>
                <th className="p-4">URL Path / Slug</th>
                <th className="p-4">Parent Page</th>
                <th className="p-4">Index Status</th>
                <th className="p-4">Status</th>
                <th className="p-4">Publish Date</th>
                <th className="p-4 sticky right-0 bg-gray-50/90 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedPages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400 text-xs font-medium">
                    No pages found in database or matching search. Click the scan icon above to check frontend.
                  </td>
                </tr>
              ) : (
                displayedPages.map((p) => {
                  const isChild = p.parentPage && p.parentPage !== 'None';
                  const pagePath = p.path.startsWith('/') ? p.path : `/${p.path}`;
                  const isLinkable =
                    Boolean(p.path) &&
                    !p.path.includes('[') &&
                    !p.path.includes(']') &&
                    !p.path.includes('(') &&
                    !p.path.includes(')') &&
                    !p.path.startsWith('_');
                  return (
                    <tr key={`${p.parentPage}-${p.path}`} className="hover:bg-[#eef5ff]/60 transition-colors">
                      <td className="p-4 font-semibold text-gray-950 flex items-center gap-2">
                        {isChild && <span className="text-gray-400 ml-4">└──</span>}
                        <span>{p.name}</span>
                      </td>
                      <td className="p-4 font-mono text-xs text-primary font-medium">{p.path}</td>
                      <td className="p-4 text-xs font-medium text-gray-600">{p.parentPage}</td>
                      <td className="p-4">
                        {p.isIndexed ? (
                          <span className="px-2.5 py-1 bg-blue-50 text-primary border border-blue-200/70 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            INDEXED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/70 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                            NOT INDEXED
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status?.toUpperCase() === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' 
                            : 'bg-gray-100 text-gray-500 border border-gray-200/70'
                        }`}>
                          {p.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500 font-medium">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 sticky right-0 bg-white z-10 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)] text-center space-x-2">
                        {!p.isIndexed && (
                          <button 
                            onClick={() => handleSavePageToDB(p)} 
                            className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-emerald-200 inline-flex items-center justify-center shadow-xs" 
                            title="Save to Database (Index with Parent)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        )}
                        {isLinkable ? (
                          <a 
                            href={pagePath} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 bg-blue-50 hover:bg-primary text-primary hover:text-white rounded-lg transition duration-200 cursor-pointer border border-blue-200 inline-flex items-center justify-center shadow-xs" 
                            title="Visit Live Page"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                        ) : (
                          <span className="p-2 bg-gray-50 text-gray-400 rounded-lg border border-gray-200 inline-flex items-center justify-center shadow-xs" title="Dynamic or private route">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-200/60 gap-4 text-xs text-gray-700 relative z-30">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">Total {totalFilteredPagesCount}</span>
            <div className="relative" ref={perPageDropdownRefPages}>
              <button
                type="button"
                onClick={() => setIsPerPageOpenPages(!isPerPageOpenPages)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 flex items-center gap-2 cursor-pointer hover:border-gray-400 shadow-xs transition"
              >
                <span>{itemsPerPagePages} / page</span>
                <svg className={`w-3 h-3 transition-transform ${isPerPageOpenPages ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isPerPageOpenPages && (
                <div className="absolute left-0 bottom-full mb-1 w-36 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 z-50 space-y-1">
                  {[10, 50, 100, 500, 1000, 5000].map((num) => (
                    <div
                      key={num}
                      onClick={() => {
                        setItemsPerPagePages(num);
                        setCurrentPagePages(1);
                        setIsPerPageOpenPages(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${
                        itemsPerPagePages === num ? 'bg-primary text-white shadow-xs' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {num} / page
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              onClick={() => setCurrentPagePages(prev => Math.max(prev - 1, 1))}
              disabled={currentPagePages === 1}
              className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-300 disabled:hover:text-gray-500 cursor-pointer transition bg-white"
            >
              ‹
            </button>

            {Array.from({ length: totalPagesPages }, (_, i) => i + 1).map((pageNum) => {
              if (
                pageNum === 1 ||
                pageNum === totalPagesPages ||
                (pageNum >= currentPagePages - 2 && pageNum <= currentPagePages + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPagePages(pageNum)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold cursor-pointer transition border ${
                      currentPagePages === pageNum
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === currentPagePages - 3 ||
                pageNum === currentPagePages + 3
              ) {
                return <span key={pageNum} className="px-1 text-gray-400 font-bold">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPagePages(prev => Math.min(prev + 1, totalPagesPages))}
              disabled={currentPagePages >= totalPagesPages}
              className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-300 disabled:hover:text-gray-500 cursor-pointer transition bg-white"
            >
              ›
            </button>
          </div>

          <div className="flex items-center gap-2 font-medium text-gray-600">
            <span>Go to</span>
            <input
              type="number"
              min="1"
              max={totalPagesPages}
              value={goToPageInputPages}
              onChange={(e) => setGoToPageInputPages(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const pNum = parseInt(goToPageInputPages, 10);
                  if (!isNaN(pNum) && pNum >= 1 && pNum <= totalPagesPages) {
                    setCurrentPagePages(pNum);
                  }
                }
              }}
              className="w-14 px-2 py-1 bg-white border border-gray-300 rounded-lg text-center outline-none focus:border-primary transition"
            />
          </div>
        </div>

      </div>
    </div>
  );
}