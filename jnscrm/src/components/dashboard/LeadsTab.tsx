'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { downloadCsv } from '@/lib/csv';
import type {
  FormOption,
  HoveredUrl,
  Submission,
} from '@/types/dashboard';

interface LeadsTabProps {
  isLoading: boolean;
  submissions: Submission[];
  selectedFormType: string;
  isFormSelectorOpen: boolean;
  setIsFormSelectorOpen: (isOpen: boolean) => void;
  formSearchQuery: string;
  setFormSearchQuery: (val: string) => void;
  filteredFormSelectorOptions: FormOption[];
  setSelectedFormType: (type: string) => void;
  setCurrentPageSub: (page: number | ((prev: number) => number)) => void;
  leadFilter: string;
  setLeadFilter: (filter: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  filterOptions: { label: string; value: string }[];
  selectedIds: number[];
  isBulkOpen: boolean;
  setIsBulkOpen: (isOpen: boolean) => void;
  handleBulkAction: (action: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
  isDateFilterOpen: boolean;
  setIsDateFilterOpen: (isOpen: boolean) => void;
  dateFilterDropdownRef: React.RefObject<HTMLDivElement | null>;
  formSelectorRef: React.RefObject<HTMLDivElement | null>;
  filterDropdownRef: React.RefObject<HTMLDivElement | null>;
  bulkDropdownRef: React.RefObject<HTMLDivElement | null>;
  exportDropdownRef: React.RefObject<HTMLDivElement | null>;
  isExportOpen: boolean;
  setIsExportOpen: (isOpen: boolean) => void;
  exportFilteredCSV: () => void;
  exportFilteredExcel: () => void;
  exportFilteredJSON: () => void;
  isAllCurrentPageSelected: boolean;
  handleSelectAllCurrentPage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectOne: (id: number) => void;
  dynamicFormKeys: string[];
  handleSoftDeleteSubmission: (id: number) => void;
  handleRecoverSubmission: (id: number) => void;
  handlePermanentDeleteSubmission: (id: number) => void;
  totalSubmissions: number;
  totalPagesSub: number;
  currentPageSub: number;
  itemsPerPageSub: number;
  setItemsPerPageSub: (num: number) => void;
  goToPageInputSub: string;
  setGoToPageInputSub: (val: string) => void;
  isPerPageOpenSub: boolean;
  setIsPerPageOpenSub: (isOpen: boolean) => void;
  perPageDropdownRefSub: React.RefObject<HTMLDivElement | null>;
  hoveredUrl: HoveredUrl | null;
  setHoveredUrl: (val: HoveredUrl | null) => void;
  getPageNameFromUrl: (url: string) => string;
}

export default function LeadsTab({
  isLoading,
  submissions,
  selectedFormType,
  isFormSelectorOpen,
  setIsFormSelectorOpen,
  formSearchQuery,
  setFormSearchQuery,
  filteredFormSelectorOptions,
  setSelectedFormType,
  setCurrentPageSub,
  leadFilter,
  setLeadFilter,
  isFilterOpen,
  setIsFilterOpen,
  filterOptions,
  selectedIds,
  isBulkOpen,
  setIsBulkOpen,
  handleBulkAction,
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  isDateFilterOpen,
  setIsDateFilterOpen,
  dateFilterDropdownRef,
  formSelectorRef,
  filterDropdownRef,
  bulkDropdownRef,
  exportDropdownRef,
  isExportOpen,
  setIsExportOpen,
  exportFilteredCSV,
  exportFilteredExcel,
  exportFilteredJSON,
  isAllCurrentPageSelected,
  handleSelectAllCurrentPage,
  handleSelectOne,
  dynamicFormKeys,
  handleSoftDeleteSubmission,
  handleRecoverSubmission,
  handlePermanentDeleteSubmission,
  totalSubmissions,
  totalPagesSub,
  currentPageSub,
  itemsPerPageSub,
  setItemsPerPageSub,
  goToPageInputSub,
  setGoToPageInputSub,
  isPerPageOpenSub,
  setIsPerPageOpenSub,
  perPageDropdownRefSub,
  hoveredUrl,
  setHoveredUrl,
  getPageNameFromUrl,
}: LeadsTabProps) {
  const [selectedLead, setSelectedLead] = useState<Submission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔥 ENTERPRISE MEMOIZATION: Instantly check if only Trashed leads are selected
  // Yeh array map aur filter calculation ko tab tak rokega jab tak selectedIds change na hon.
  const isOnlyTrashedSelected = useMemo(() => {
    if (selectedIds.length === 0) return false;
    const selectedLeadsObj = submissions.filter(sub => selectedIds.includes(sub.id));
    return selectedLeadsObj.length > 0 && selectedLeadsObj.every(sub => (sub.status || '').toLowerCase() === 'trashed');
  }, [submissions, selectedIds]);

  const openViewModal = useCallback((sub: Submission) => {
    setSelectedLead(sub);
    setIsModalOpen(true);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const exportSingleCSV = useCallback((sub: Submission) => {
    if (!sub) return;
    const parsed = sub.parsed_data || {};
    const formKeys = Object.keys(parsed);
    const headers = [...formKeys, 'Source URL', 'Submission Date', 'Form Type', 'ID', 'Status'];
    const values = [
      ...formKeys.map((key) => parsed[key]),
      sub.source_url,
      sub.created_at,
      sub.form_type,
      sub.id,
      sub.status,
    ];

    downloadCsv(`lead_entry_${sub.id}.csv`, headers, [values]);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-[20px]">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm sticky top-[73px] sm:top-[120px] z-20">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto">
          
          {/* Form Selector Dropdown */}
          <div className="relative w-full sm:w-auto" ref={formSelectorRef}>
            <button
              type="button"
              onClick={() => setIsFormSelectorOpen(!isFormSelectorOpen)}
              className="w-full sm:min-w-[210px] px-4 py-2.5 bg-[#f8faff] border border-primary/30 rounded-xl shadow-sm flex items-center justify-between text-sm font-semibold text-primary hover:bg-[#eef5ff] focus:outline-none transition cursor-pointer"
            >
              <span className="truncate mr-2">{selectedFormType}</span>
              <svg className={`w-4 h-4 text-primary shrink-0 transition-transform duration-200 ${isFormSelectorOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isFormSelectorOpen && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1.5">
                <div className="relative p-1">
                  <input
                    type="text"
                    value={formSearchQuery}
                    onChange={(e) => setFormSearchQuery(e.target.value)}
                    placeholder="Search forms..."
                    className="w-full px-3 py-1.5 pl-8 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 outline-none focus:bg-white focus:border-primary"
                  />
                  <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {filteredFormSelectorOptions.map((form) => (
                    <div
                      key={form.name}
                      onClick={() => { 
                        setSelectedFormType(form.name); 
                        setCurrentPageSub(1); 
                        setIsFormSelectorOpen(false); 
                        setFormSearchQuery(''); 
                      }}
                      className={`px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors flex items-center justify-between ${selectedFormType === form.name ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
                    >
                      <span className="truncate">{form.name}</span>
                      {(form.unreadCount ?? 0) > 0 && <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-full">{form.unreadCount}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter Status Dropdown */}
          <div className="relative w-full sm:w-auto" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full sm:min-w-[170px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between text-sm font-medium text-gray-800 hover:border-gray-300 focus:outline-none transition cursor-pointer"
            >
              <span>{filterOptions.find(opt => opt.value === leadFilter)?.label || leadFilter}</span>
              <svg className={`w-4 h-4 text-gray-400 ml-2 transition-transform duration-200 ${isFilterOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                {filterOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => { setLeadFilter(opt.value); setCurrentPageSub(1); setIsFilterOpen(false); }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${leadFilter === opt.value ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bulk Actions Dropdown - INTELLIGENT RENDERING */}
          {selectedIds.length > 0 && (
            <div className="relative w-full sm:w-auto" ref={bulkDropdownRef}>
              <button
                type="button"
                onClick={() => setIsBulkOpen(!isBulkOpen)}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl shadow-sm flex items-center justify-between sm:justify-center gap-2 text-sm font-semibold text-primary hover:bg-blue-100 transition cursor-pointer"
              >
                <span>Bulk Actions ({selectedIds.length})</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isBulkOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isBulkOpen && (
                <div className="absolute left-0 top-full mt-2 w-full sm:w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                  {isOnlyTrashedSelected ? (
                    <>
                      <div onClick={() => handleBulkAction('recover')} className="px-4 py-2.5 rounded-xl text-sm font-medium text-emerald-600 hover:bg-gray-50 cursor-pointer">Recover</div>
                      <div onClick={() => handleBulkAction('delete')} className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer">Permanently Deleted</div>
                    </>
                  ) : (
                    <>
                      <div onClick={() => handleBulkAction('read')} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer">Marked as Read</div>
                      <div onClick={() => handleBulkAction('unread')} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer">Marked as Unread</div>
                      <div onClick={() => handleBulkAction('trashed')} className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer">Marked as Trashed</div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-60 lg:w-48 xl:w-60">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageSub(1); }}
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            )}
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative w-full sm:w-auto" ref={dateFilterDropdownRef}>
            <button 
              type="button" 
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)} 
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm flex items-center justify-between sm:justify-center gap-2 text-sm font-semibold text-gray-800 hover:border-gray-400 focus:outline-none transition cursor-pointer"
            >
              <span>{dateFilter === 'Custom' && customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` : `Date Filter: ${dateFilter}`}</span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDateFilterOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isDateFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 space-y-2">
                {['All', 'Today', 'Yesterday', 'Last Week', 'Last Month'].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="radio" 
                      name="dateFilterRadio" 
                      checked={dateFilter === opt} 
                      onChange={() => { setDateFilter(opt); setCurrentPageSub(1); setIsDateFilterOpen(false); }} 
                      className="text-primary focus:ring-blue-500 cursor-pointer"
                    />
                    <span>{opt}</span>
                  </label>
                ))}

                <div className="border-t border-gray-100 pt-2 mt-1">
                  <label className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer mb-2">
                    <input 
                      type="radio" 
                      name="dateFilterRadio" 
                      checked={dateFilter === 'Custom'} 
                      onChange={() => { setDateFilter('Custom'); }} 
                      className="text-primary focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Custom Date Range</span>
                  </label>

                  {dateFilter === 'Custom' && (
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-2 text-xs">
                      <p className="font-semibold text-gray-600">Select a Timeframe</p>
                      <div className="flex items-center gap-1">
                        <input 
                          type="date" 
                          value={customStartDate} 
                          onChange={(e) => setCustomStartDate(e.target.value)} 
                          className="w-full p-1.5 bg-white border border-gray-300 rounded-lg outline-none text-[11px] text-black" 
                        />
                        <span className="text-gray-400">-</span>
                        <input 
                          type="date" 
                          value={customEndDate} 
                          onChange={(e) => setCustomEndDate(e.target.value)} 
                          className="w-full p-1.5 bg-white border border-gray-300 rounded-lg outline-none text-[11px] text-black" 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { setCurrentPageSub(1); setIsDateFilterOpen(false); }} 
                        className="w-full py-1.5 bg-primary text-white rounded-lg font-bold text-xs shadow-xs hover:bg-blue-700 transition cursor-pointer"
                      >
                        Apply Filter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative w-full sm:w-auto" ref={exportDropdownRef}>
            <button type="button" onClick={() => setIsExportOpen(!isExportOpen)} className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm flex items-center justify-between sm:justify-center gap-2 text-sm font-semibold text-gray-800 hover:border-gray-400 focus:outline-none transition cursor-pointer">
              <span>Export</span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExportOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isExportOpen && (
              <div className="absolute right-0 top-full mt-2 w-full sm:w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                <div onClick={exportFilteredCSV} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer">Export as CSV</div>
                <div onClick={exportFilteredExcel} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer">Export as Excel (CSV)</div>
                <div onClick={exportFilteredJSON} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer">Export as JSON File</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading && submissions.length === 0 ? ( // Only show loading text if there's no data currently visible
        <p className="text-gray-500 p-5 text-center w-full animate-pulse">Syncing leads database...</p>
      ) : submissions.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 shadow-sm">
          No submissions found matching criteria.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 relative">
            <div className="overflow-x-auto relative">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="p-4 w-10 text-center">
                      <input type="checkbox" checked={isAllCurrentPageSelected} onChange={handleSelectAllCurrentPage} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-blue-500 cursor-pointer" />
                    </th>
                    {selectedFormType !== 'All Forms' && dynamicFormKeys.length > 0 ? (
                      dynamicFormKeys.map((key) => (
                        <th key={key} className="p-4">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}</th>
                      ))
                    ) : (
                      <>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone</th>
                      </>
                    )}
                    <th className="p-4">Status</th>
                    <th className="p-4">Form Name</th>
                    <th className="p-4">Source URL</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4">Submission Time</th>
                    <th className="p-4 sticky right-0 bg-primary shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)] text-center text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {submissions.map((sub) => {
                    const parsedData = sub.parsed_data || {};
                    const dateObj = new Date(sub.created_at);
                    const pageName = getPageNameFromUrl(sub.source_url) || sub.source_url || 'N/A';

                    return (
                      <tr key={sub.id} className="hover:bg-[#eef5ff]/60 transition">
                        <td className="p-4 text-center">
                          <input type="checkbox" checked={selectedIds.includes(sub.id)} onChange={() => handleSelectOne(sub.id)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-blue-500 cursor-pointer" />
                        </td>
                        {selectedFormType !== 'All Forms' && dynamicFormKeys.length > 0 ? (
                          dynamicFormKeys.map((key, index) => (
                            <td key={key} className={`p-4 ${index === 0 ? ((sub.status || '').toLowerCase() === 'unread' ? 'text-primary font-semibold' : 'text-gray-900 font-medium') : 'text-gray-600'}`}>
                              {String(parsedData[key] || 'N/A')}
                            </td>
                          ))
                        ) : (
                          <>
                            <td className={`p-4 font-medium ${(sub.status || '').toLowerCase() === 'unread' ? 'text-primary' : 'text-gray-900'}`}>
                              {parsedData.fullName || parsedData.name || parsedData.ceoName || (parsedData.firstName ? `${parsedData.firstName} ${parsedData.lastName || ''}`.trim() : 'N/A')}
                            </td>
                            <td className="p-4 text-gray-600">{parsedData.email || parsedData.ceoEmail || 'N/A'}</td>
                            <td className="p-4 text-gray-600">{parsedData.phoneNumber ? `${parsedData.phoneCode || ''} ${parsedData.phoneNumber}` : (parsedData.refereeTel || 'N/A')}</td>
                          </>
                        )}
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${(sub.status || '').toLowerCase() === 'unread' ? 'bg-blue-50 text-primary border border-blue-200' : (sub.status || '').toLowerCase() === 'read' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-800">{sub.form_type}</td>
                        <td className="p-4">
                          <span 
                            className="text-primary font-medium cursor-pointer underline hover:text-blue-700"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredUrl({
                                url: sub.source_url || 'N/A',
                                x: rect.left,
                                y: rect.top - 40
                              });
                            }}
                            onMouseLeave={() => setHoveredUrl(null)}
                          >
                            {pageName}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 text-xs">{!isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : 'N/A'}</td>
                        <td className="p-4 text-gray-500 text-xs font-mono">{!isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}</td>
                        <td className="p-4 sticky right-0 bg-white z-10 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)] text-center space-x-2">
                          {(sub.status || '').toLowerCase() === 'trashed' ? (
                            <>
                              <button onClick={() => handleRecoverSubmission(sub.id)} className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition cursor-pointer shadow-sm" title="Recover Lead">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                              </button>
                              <button onClick={() => handlePermanentDeleteSubmission(sub.id)} className="p-2 bg-red-50 hover:bg-red-600 text-white rounded-lg transition cursor-pointer shadow-sm" title="Permanently Delete">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => openViewModal(sub)} className="p-2 bg-primary hover:bg-blue-700 text-white rounded-lg transition cursor-pointer shadow-sm" title="View Lead Details">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                              <button onClick={() => handleSoftDeleteSubmission(sub.id)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition cursor-pointer shadow-sm" title="Move to Trash">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Enterprise Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border-t border-gray-200 gap-4 text-sm text-gray-700 relative">
              <div className="flex items-center gap-3">
                <span>Total {totalSubmissions}</span>
                <div className="relative" ref={perPageDropdownRefSub}>
                  <button
                    type="button"
                    onClick={() => setIsPerPageOpenSub(!isPerPageOpenSub)}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-2 cursor-pointer hover:border-gray-400"
                  >
                    <span>{itemsPerPageSub} / page</span>
                    <svg className={`w-3 h-3 transition-transform ${isPerPageOpenSub ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {isPerPageOpenSub && (
                    <div className="absolute left-0 top-full mt-1 w-36 bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 z-50 space-y-1">
                      {[10, 50, 100, 500, 1000, 5000].map((num) => (
                        <div
                          key={num}
                          onClick={() => {
                            setItemsPerPageSub(num);
                            setCurrentPageSub(1);
                            setIsPerPageOpenSub(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${itemsPerPageSub === num ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`}
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
                  onClick={() => setCurrentPageSub(prev => Math.max(prev - 1, 1))}
                  disabled={currentPageSub === 1}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-300 disabled:hover:text-gray-500 cursor-pointer transition"
                >
                  ‹
                </button>

                {Array.from({ length: totalPagesSub }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    pageNum === 1 ||
                    pageNum === totalPagesSub ||
                    (pageNum >= currentPageSub - 2 && pageNum <= currentPageSub + 2)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPageSub(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition border ${
                          currentPageSub === pageNum
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPageSub - 3 ||
                    pageNum === currentPageSub + 3
                  ) {
                    return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPageSub(prev => Math.min(prev + 1, totalPagesSub))}
                  disabled={currentPageSub >= totalPagesSub}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-300 disabled:hover:text-gray-500 cursor-pointer transition"
                >
                  ›
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Go to</span>
                <input
                  type="number"
                  min="1"
                  max={totalPagesSub}
                  value={goToPageInputSub}
                  onChange={(e) => setGoToPageInputSub(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const pNum = parseInt(goToPageInputSub, 10);
                      if (!isNaN(pNum) && pNum >= 1 && pNum <= totalPagesSub) {
                        setCurrentPageSub(pNum);
                      }
                    }
                  }}
                  className="w-14 px-2 py-1.5 border border-gray-300 rounded-lg text-center outline-none focus:border-primary"
                />
              </div>
            </div>

            {hoveredUrl && (
              <div 
                className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl pointer-events-none transition-all duration-150 font-mono whitespace-nowrap"
                style={{ left: hoveredUrl.x, top: hoveredUrl.y }}
              >
                {hoveredUrl.url}
              </div>
            )}
          </div>
        </>
      )}

      {/* Form Entry Details Modal */}
      {isModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="best-heading text-black">Form Entry Details</h2>
                <p className="text-sm text-gray-500">{selectedLead.form_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-xs transition cursor-pointer shadow-xs"
                >
                  Print
                </button>
                <button 
                  onClick={() => exportSingleCSV(selectedLead)}
                  className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition cursor-pointer shadow-xs"
                >
                  Export CSV
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-xs transition cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4 pr-2">
                {Object.entries(selectedLead.parsed_data || {}).map(([key, val]) => (
                  <div key={key} className="border-b border-gray-100 pb-3">
                    <span className="font-semibold text-gray-400 block text-[11px] uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className="text-gray-800 font-medium text-sm mt-0.5 block break-words">
                      {String(val || 'N/A')}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h6 className="small-heading text-black">Submission Info</h6>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold uppercase block">ID</span>
                      <span className="font-bold text-gray-800">#{selectedLead.id}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold uppercase block">Status</span>
                      <span className="font-bold text-primary uppercase">{selectedLead.status}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold uppercase block">Source URL</span>
                      <a href={selectedLead.source_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline break-all">
                        {selectedLead.source_url || 'N/A'}
                      </a>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold uppercase block">Created At</span>
                      <span className="text-xs text-gray-600">{new Date(selectedLead.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}