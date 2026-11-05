// src/app/protection/dashboard/page.tsx
'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { authService } from '@/services/auth.service';

// Modular Components Import
import Sidebar from '@/components/dashboard/Sidebar';
import PaneHeader from '@/components/dashboard/PaneHeader';
import OverviewTab from '@/components/dashboard/OverviewTab';
import PagesTab from '@/components/dashboard/PagesTab';
import LeadsTab from '@/components/dashboard/LeadsTab';
import EventsTab from '@/components/dashboard/EventsTab';
import AddEventTab from '@/components/dashboard/AddEventTab';
import RequestsTab from '@/components/dashboard/RequestsTab';
import UsersTab from '@/components/dashboard/UsersTab';
import AllBlogsTab from '@/components/dashboard/AllBlogsTab';
import AddBlogTab from '@/components/dashboard/AddBlogTab';
import BlogCategoriesTab from '@/components/dashboard/BlogCategoriesTab';
import { blogService } from '@/services/blogService';
import { downloadCsv, downloadJson } from '@/lib/csv';
import type {
  AppTab,
  BlogItem,
  EventItem,
  EventStatus,
  HoveredUrl,
  PageItem,
  RawSubmission,
  RequestUser,
  Submission,
  SubmissionFormData,
} from '@/types/dashboard';

const API_BASE_URL = '/backend';

function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function handleApiResponse(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem('user');
    window.location.replace('/protection/login');
    throw new Error('Unauthorized session');
  }
  return res;
}

function processSubmissions(rawList: RawSubmission[]): Submission[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item) => {
    let pData: SubmissionFormData = {};
    try {
      pData =
        typeof item.form_data === 'string'
          ? (JSON.parse(item.form_data) as SubmissionFormData)
          : item.form_data || {};
    } catch {
      pData = {};
    }
    return {
      ...item,
      region: item.region || '',
      source_url: item.source_url || '',
      status: item.status || 'Unread',
      parsed_data: pData,
    };
  });
}

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('Loading...');
  const [userEmail, setUserEmail] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isBlogsMenuOpen, setIsBlogsMenuOpen] = useState<boolean>(false);
  const [isEventsMenuOpen, setIsEventsMenuOpen] = useState<boolean>(false);

  const [requests, setRequests] = useState<RequestUser[]>([]);
  const [allUsers, setAllUsers] = useState<RequestUser[]>([]);
  const [approvedUsersCount, setApprovedUsersCount] = useState<number>(0);
  const [totalBlogsCount, setTotalBlogsCount] = useState<number>(0);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0);
  const [totalUnreadSubmissions, setTotalUnreadSubmissions] = useState<number>(0);
  const [totalPagesSub, setTotalPagesSub] = useState<number>(1);
  const [currentPageSub, setCurrentPageSub] = useState<number>(1);
  const [itemsPerPageSub, setItemsPerPageSub] = useState<number>(10);
  const [goToPageInputSub, setGoToPageInputSub] = useState<string>('1');
  const [isPerPageOpenSub, setIsPerPageOpenSub] = useState<boolean>(false);
  const perPageDropdownRefSub = useRef<HTMLDivElement>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const bulkDropdownRef = useRef<HTMLDivElement>(null);

  const handleSelectOne = useCallback((id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const isAllCurrentPageSelected = submissions.length > 0 && submissions.every(sub => selectedIds.includes(sub.id));

  const handleSelectAllCurrentPage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = submissions.map(sub => sub.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...allIds])));
    } else {
      const currentPageIds = submissions.map(sub => sub.id);
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  }, [submissions]);

  const handleSoftDeleteSubmission = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Trashed' }),
      });
      await handleApiResponse(res);
      if (!res.ok) throw new Error('Failed to trash lead');
      setMessage({ text: 'Lead moved to trash successfully!', type: 'success' });
      await fetchLeads();
    } catch (err) {
      if ((err as Error).message !== 'Unauthorized session') {
        console.error('Error trashing lead:', err);
        setMessage({ text: 'Failed to move lead to trash.', type: 'error' });
      }
    }
  };

  const handleRecoverSubmission = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Read' }),
      });
      await handleApiResponse(res);
      if (!res.ok) throw new Error('Failed to recover lead');
      setMessage({ text: 'Lead recovered successfully!', type: 'success' });
      await fetchLeads();
    } catch (err) {
      if ((err as Error).message !== 'Unauthorized session') {
        console.error('Error recovering lead:', err);
        setMessage({ text: 'Failed to recover lead.', type: 'error' });
      }
    }
  };

  const handlePermanentDeleteSubmission = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/leads/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      await handleApiResponse(res);
      if (!res.ok) throw new Error('Failed to delete lead');
      setMessage({ text: 'Lead permanently deleted!', type: 'success' });
      await fetchLeads();
    } catch (err) {
      if ((err as Error).message !== 'Unauthorized session') {
        console.error('Error deleting lead:', err);
        setMessage({ text: 'Failed to delete lead.', type: 'error' });
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} leads?`)) {
        return;
      }
    }

    let targetStatus: 'Read' | 'Unread' | 'Trashed' = 'Read';
    if (action === 'unread') targetStatus = 'Unread';
    else if (action === 'trashed') targetStatus = 'Trashed';
    else if (action === 'recover') targetStatus = 'Read';

    const processingIds = [...selectedIds];
    setSelectedIds([]);
    setIsBulkOpen(false);

    try {
      const responses = await Promise.all(
        processingIds.map((id) =>
          action === 'delete'
            ? fetch(`${API_BASE_URL}/leads/${id}`, {
                method: 'DELETE',
                credentials: 'include',
              })
            : fetch(`${API_BASE_URL}/leads/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: targetStatus }),
              })
        )
      );

      for (const response of responses) {
        await handleApiResponse(response);
        if (!response.ok) throw new Error('Bulk action failed');
      }

      setMessage({
        text:
          action === 'delete'
            ? 'Selected leads permanently deleted!'
            : `Selected leads successfully marked as ${targetStatus}!`,
        type: 'success',
      });
      await fetchLeads();
    } catch (err) {
      if ((err as Error).message !== 'Unauthorized session') {
        console.error('Error executing bulk action:', err);
        setMessage({ text: 'Bulk action failed. Please try again.', type: 'error' });
        await fetchLeads();
      }
    }
  };

  const [pagesList, setPagesList] = useState<PageItem[]>([]);
  const [pageSearchQuery, setPageSearchQuery] = useState<string>('');
  const [totalPagesPages, setTotalPagesPages] = useState<number>(1);
  const [totalFilteredPagesCount, setTotalFilteredPagesCount] = useState<number>(0);
  const [currentPagePages, setCurrentPagePages] = useState<number>(1);
  const [itemsPerPagePages, setItemsPerPagePages] = useState<number>(10);
  const [goToPageInputPages, setGoToPageInputPages] = useState<string>('1');
  const [isPerPageOpenPages, setIsPerPageOpenPages] = useState<boolean>(false);
  const perPageDropdownRefPages = useRef<HTMLDivElement>(null);

  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [eventSearchQuery, setEventSearchQuery] = useState<string>('');
  const [eventTableTab, setEventTableTab] = useState<'All' | EventStatus>('All');

  const [eventName, setEventName] = useState('');
  const [eventDayDate, setEventDayDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventCoverImage, setEventCoverImage] = useState('');
  const [eventTargetPage, setEventTargetPage] = useState('');
  const [eventStatus, setEventStatus] = useState<EventStatus>('Live');
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  
  const [isTargetPageDropdownOpen, setIsTargetPageDropdownOpen] = useState(false);
  const [targetPageSearchQuery, setTargetPageSearchQuery] = useState('');
  const targetPageDropdownRef = useRef<HTMLDivElement>(null);

  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [selectedBlogForEdit, setSelectedBlogForEdit] = useState<BlogItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [hoveredUrl, setHoveredUrl] = useState<HoveredUrl | null>(null);

  const [currentPageReq, setCurrentPageReq] = useState(1);
  const [itemsPerPageReq, setItemsPerPageReq] = useState(6);

  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const [itemsPerPageUsers, setItemsPerPageUsers] = useState(6);

  const [selectedFormType, setSelectedFormType] = useState<string>('All Forms');
  const [isFormSelectorOpen, setIsFormSelectorOpen] = useState(false);
  const [formSearchQuery, setFormSearchQuery] = useState('');
  const formSelectorRef = useRef<HTMLDivElement>(null);

  const [formTypesList, setFormTypesList] = useState<string[]>([]);
  const [leadFilter, setLeadFilter] = useState<string>('All Type');
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400); 
    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  const [dateFilter, setDateFilter] = useState<string>('All');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const dateFilterDropdownRef = useRef<HTMLDivElement>(null);

  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [requestSearchQuery, setRequestSearchQuery] = useState<string>('');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = useMemo(() => [
    { label: 'All Type', value: 'All Type' },
    { label: 'Read', value: 'read' },
    { label: 'Unread', value: 'unread' },
    { label: 'Trashed', value: 'trashed' },
  ], []);

  const fetchOverviewData = useCallback(async (role: string) => {
    const loadLeads = async () => {
      try {
        const [allRes, unreadRes] = await Promise.all([
          fetch(`${API_BASE_URL}/leads?page=1&limit=1`, {
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch(`${API_BASE_URL}/leads?page=1&limit=5&status=Unread`, {
            credentials: 'include',
            cache: 'no-store',
          }),
        ]);

        await handleApiResponse(allRes);
        await handleApiResponse(unreadRes);

        if (allRes.ok) {
          const allData = await allRes.json();
          setTotalSubmissions(Number(allData.total) || 0);
        }

        if (unreadRes.ok) {
          const unreadData = await unreadRes.json();
          const unreadRows = Array.isArray(unreadData)
            ? unreadData
            : unreadData.data || [];
          setSubmissions(processSubmissions(unreadRows));
          setTotalUnreadSubmissions(Number(unreadData.total) || 0);
        }
      } catch (error) {
        if ((error as Error).message !== 'Unauthorized session') {
          console.error('Error loading overview leads:', error);
        }
      }
    };

    const loadPages = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/pages?page=1&limit=5`,
          { credentials: 'include', cache: 'no-store' }
        );
        await handleApiResponse(res);
        if (res.ok) {
          const data = await res.json();
          setPagesList(Array.isArray(data.pages) ? data.pages : []);
          setTotalFilteredPagesCount(Number(data.total) || 0);
          setTotalPagesPages(Number(data.totalPages) || 1);
        }
      } catch (error) {
        if ((error as Error).message !== 'Unauthorized session') {
          console.error('Error loading overview pages:', error);
        }
      }
    };

    const loadBlogs = async () => {
      try {
        const data = await blogService.getBlogs(1, 5);
        setBlogs(data.blogs || []);
        setTotalBlogsCount(Number(data.total) || 0);
      } catch (error) {
        console.error('Error loading overview blogs:', error);
      }
    };

    const loadUsers = async () => {
      if (role !== 'Super-Admin') {
        setAllUsers([]);
        setApprovedUsersCount(0);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/users`, {
          credentials: 'include',
          cache: 'no-store',
        });
        await handleApiResponse(res);
        if (res.ok) {
          const data = await res.json();
          const formattedUsers = (data.users || []).map((user: RequestUser & { full_name?: string }) => ({
            ...user,
            name: user.full_name || user.name || 'N/A',
          }));
          setAllUsers(formattedUsers);
          setApprovedUsersCount(formattedUsers.length);
        }
      } catch (error) {
        if ((error as Error).message !== 'Unauthorized session') {
          console.error('Error loading overview users:', error);
        }
      }
    };

    const loadRequests = async () => {
      if (role !== 'Super-Admin') {
        setRequests([]);
        return;
      }

      try {
        const data = await authService.getPendingRequests();
        const formattedRequests = (
          Array.isArray(data) ? data : data.requests || []
        ).map((request: RequestUser & { full_name?: string }) => ({
          ...request,
          name: request.full_name || request.name || 'N/A',
        }));
        setRequests(formattedRequests);
      } catch (error) {
        if ((error as Error).message !== 'Unauthorized session') {
          console.error('Error loading overview requests:', error);
        }
      }
    };

    await Promise.allSettled([
      loadLeads(),
      loadPages(),
      loadBlogs(),
      loadUsers(),
      loadRequests(),
    ]);
  }, [
    setTotalSubmissions,
    setSubmissions,
    setTotalUnreadSubmissions,
    setPagesList,
    setTotalFilteredPagesCount,
    setTotalPagesPages,
    setBlogs,
    setTotalBlogsCount,
    setAllUsers,
    setApprovedUsersCount,
    setRequests,
  ]);

  const fetchFormTypes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/leads/form-types`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFormTypesList(Array.isArray(data) ? data : (data.formTypes || []));
      }
    } catch (e) {
      console.error("Error fetching form types:", e);
    }
  }, []);

  const buildLeadsQuery = useCallback((page: number, limit: number, cacheBust = true) => {
    const queryParams = new URLSearchParams();

    if (selectedFormType !== 'All Forms') queryParams.append('formType', selectedFormType);
    if (leadFilter !== 'All Type') queryParams.append('status', leadFilter);
    if (debouncedSearchQuery.trim()) queryParams.append('search', debouncedSearchQuery.trim());

    if (dateFilter !== 'All') {
      queryParams.append('dateFilter', dateFilter);
      if (dateFilter === 'Custom' && customStartDate && customEndDate) {
        queryParams.append('startDate', customStartDate);
        queryParams.append('endDate', customEndDate);
      }
    }

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (cacheBust) queryParams.append('_t', Date.now().toString());

    return queryParams.toString();
  }, [selectedFormType, leadFilter, debouncedSearchQuery, dateFilter, customStartDate, customEndDate]);

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const leadsRes = await fetch(
        `${API_BASE_URL}/leads?${buildLeadsQuery(currentPageSub, itemsPerPageSub)}`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          credentials: 'include',
          cache: 'no-store',
        }
      );
      await handleApiResponse(leadsRes);
      if (!leadsRes.ok) throw new Error('Failed to load leads');

      const lData = await leadsRes.json();
      const rawList = Array.isArray(lData) ? lData : (lData.data || []);
      const processed = processSubmissions(rawList);

      setSubmissions(processed);
      setTotalSubmissions(Number(lData.total) || 0);
      setTotalPagesSub(Number(lData.totalPages) || 1);
    } catch (e) {
      if ((e as Error).message !== 'Unauthorized session') {
        console.error('Error fetching server-side leads:', e);
        setMessage({ text: 'Failed to load leads. Please try again.', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [buildLeadsQuery, currentPageSub, itemsPerPageSub]);

  const dynamicFormKeys = useMemo(() => {
    if (selectedFormType === 'All Forms') return [];
    const keysSet = new Set<string>();
    submissions.forEach((sub) => {
      if (sub.form_type === selectedFormType && sub.parsed_data) {
        Object.keys(sub.parsed_data).forEach((k) => keysSet.add(k));
      }
    });
    return Array.from(keysSet);
  }, [submissions, selectedFormType]);

  const getPageNameFromUrl = useCallback((url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname === '/' ? 'Home / Root' : parsed.pathname;
    } catch {
      return url || 'N/A';
    }
  }, []);

  const getFormattedExportFilename = useCallback((formType: string, extension: string = 'csv') => {
    const cleanFormName = (formType && formType !== 'All Forms') ? formType.replace(/[^a-zA-Z0-9]/g, '-') : 'All-Leads';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    const day = String(now.getDate()).padStart(2, '0');
    return `${cleanFormName}-${year}-${month}-${day}.${extension}`;
  }, []);

  const fetchAllFilteredLeads = useCallback(async (): Promise<Submission[]> => {
    const firstRes = await fetch(
      `${API_BASE_URL}/leads?${buildLeadsQuery(1, 200, false)}`,
      { credentials: 'include', cache: 'no-store' }
    );
    await handleApiResponse(firstRes);
    if (!firstRes.ok) throw new Error('Failed to export leads');

    const firstData = await firstRes.json();
    const totalPages = Math.max(Number(firstData.totalPages) || 1, 1);
    const allLeads = processSubmissions(
      Array.isArray(firstData) ? firstData : firstData.data || []
    );

    if (totalPages > 1) {
      const responses = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          fetch(
            `${API_BASE_URL}/leads?${buildLeadsQuery(index + 2, 200, false)}`,
            { credentials: 'include', cache: 'no-store' }
          )
        )
      );

      for (const response of responses) {
        await handleApiResponse(response);
        if (!response.ok) throw new Error('Failed to export leads');
        const data = await response.json();
        allLeads.push(...processSubmissions(data.data || []));
      }
    }

    return allLeads;
  }, [buildLeadsQuery]);

  const exportFilteredCSV = useCallback(async () => {
    try {
      const allLeads = await fetchAllFilteredLeads();
      if (allLeads.length === 0) {
        setMessage({ text: 'No submissions available to export.', type: 'error' });
        return;
      }

      const dynamicKeys = Array.from(
        new Set(
          allLeads.flatMap((lead) => Object.keys(lead.parsed_data || {}))
        )
      );
      const headers = [
        ...dynamicKeys,
        'Source URL',
        'Submission Date',
        'Form Type',
        'ID',
        'Status',
      ];
      const rows = allLeads.map((lead) => {
        const data = lead.parsed_data || {};
        return [
          ...dynamicKeys.map((key) => data[key]),
          lead.source_url,
          lead.created_at,
          lead.form_type,
          lead.id,
          lead.status,
        ];
      });

      downloadCsv(
        getFormattedExportFilename(selectedFormType, 'csv'),
        headers,
        rows
      );
      setMessage({
        text: `Exported ${allLeads.length} lead(s) to CSV.`,
        type: 'success',
      });
      setIsExportOpen(false);
    } catch (error) {
      if ((error as Error).message !== 'Unauthorized session') {
        setMessage({ text: 'Failed to export leads.', type: 'error' });
      }
    }
  }, [fetchAllFilteredLeads, getFormattedExportFilename, selectedFormType]);

  const exportFilteredExcel = () => {
    void exportFilteredCSV();
    setIsExportOpen(false);
  };

  const exportFilteredJSON = useCallback(async () => {
    try {
      const allLeads = await fetchAllFilteredLeads();
      if (allLeads.length === 0) {
        setMessage({ text: 'No submissions available to export.', type: 'error' });
        return;
      }

      downloadJson(
        getFormattedExportFilename(selectedFormType, 'json'),
        allLeads
      );
      setMessage({
        text: `Exported ${allLeads.length} lead(s) to JSON.`,
        type: 'success',
      });
      setIsExportOpen(false);
    } catch (error) {
      if ((error as Error).message !== 'Unauthorized session') {
        setMessage({ text: 'Failed to export leads.', type: 'error' });
      }
    }
  }, [fetchAllFilteredLeads, getFormattedExportFilename, selectedFormType]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchLeads();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchFormTypes();
    }
  }, [activeTab, currentPageSub, itemsPerPageSub, selectedFormType, leadFilter, debouncedSearchQuery, dateFilter, customStartDate, customEndDate, fetchLeads, fetchFormTypes]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds([]);
  }, [currentPageSub, itemsPerPageSub, selectedFormType, leadFilter, debouncedSearchQuery, dateFilter, customStartDate, customEndDate]);

  const filteredFormSelectorOptions = useMemo(() => {
    const allOptions = [{ name: 'All Forms', unreadCount: 0 }, ...formTypesList.map(ft => ({ name: ft, unreadCount: 0 }))];
    if (!formSearchQuery.trim()) return allOptions;
    return allOptions.filter(opt => opt.name.toLowerCase().includes(formSearchQuery.toLowerCase().trim()));
  }, [formTypesList, formSearchQuery]);

  const fetchPagesList = useCallback(async (page = currentPagePages, itemsLimit = itemsPerPagePages, search = pageSearchQuery, filter = '') => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', filter === 'events' ? '10000' : itemsLimit.toString());
      if (search.trim()) queryParams.append('search', search.trim());
      if (filter) queryParams.append('filter', filter);

      const res = await fetch(`${API_BASE_URL}/admin/pages?${queryParams.toString()}`, { 
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include',
        cache: 'no-store'
      });
      await handleApiResponse(res);
      if (res.ok) {
        const data = await res.json();
        const rawPages = Array.isArray(data.pages) ? data.pages : (Array.isArray(data) ? data : []);
        setPagesList(rawPages);
        setTotalPagesPages(data.totalPages || 1);
        setTotalFilteredPagesCount(data.total !== undefined ? data.total : rawPages.length);
      }
    } catch (e) {
      console.error('Error fetching pages:', e);
      setPagesList([]);
    }
  }, [currentPagePages, itemsPerPagePages, pageSearchQuery, setPagesList, setTotalPagesPages, setTotalFilteredPagesCount]);

  useEffect(() => {
    if (activeTab === 'all-pages') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPagesList(currentPagePages, itemsPerPagePages, pageSearchQuery);
    }
  }, [activeTab, currentPagePages, itemsPerPagePages, pageSearchQuery, fetchPagesList]);

  const fetchEventsList = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/events`, { credentials: 'include' });
      await handleApiResponse(res);
      if (res.ok) {
        const data = await res.json();
        setEventsList(data.events || []);
      }
    } catch (e) {
      console.error('Error fetching events:', e);
    }
  }, [setEventsList]);

  const hasFetchedInitialRef = useRef(false);

  useEffect(() => {
    if (hasFetchedInitialRef.current) return;
    hasFetchedInitialRef.current = true;

    async function fetchInitialData() {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include',
          cache: 'no-store',
        });
        await handleApiResponse(res);
        if (!res.ok) throw new Error('Failed to load session');

        const data = await res.json();
        const user = data.user;
        if (!user) throw new Error('Invalid session');

        const role = user.role || '';
        setUserRole(role);
        setUserName(user.full_name || user.name || 'Unknown User');
        setUserEmail(user.email || '');
        await fetchOverviewData(role);
      } catch (error) {
        if ((error as Error).message !== 'Unauthorized session') {
          console.error('Error loading initial data:', error);
          setMessage({
            text: 'Unable to load your account. Please sign in again.',
            type: 'error',
          });
        }
      }
    }
    fetchInitialData();
  }, [fetchOverviewData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) setIsFilterOpen(false);
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) setIsExportOpen(false);
      if (dateFilterDropdownRef.current && !dateFilterDropdownRef.current.contains(event.target as Node)) setIsDateFilterOpen(false);
      if (bulkDropdownRef.current && !bulkDropdownRef.current.contains(event.target as Node)) setIsBulkOpen(false);
      if (perPageDropdownRefSub.current && !perPageDropdownRefSub.current.contains(event.target as Node)) setIsPerPageOpenSub(false);
      if (perPageDropdownRefPages.current && !perPageDropdownRefPages.current.contains(event.target as Node)) setIsPerPageOpenPages(false);
      if (formSelectorRef.current && !formSelectorRef.current.contains(event.target as Node)) setIsFormSelectorOpen(false);
      if (targetPageDropdownRef.current && !targetPageDropdownRef.current.contains(event.target as Node)) setIsTargetPageDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = useCallback(async (tab: AppTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    setMessage({ text: '', type: '' });
    
    if (tab === 'overview') {
      await fetchOverviewData(userRole);
    } else if (tab === 'submissions') {
      setCurrentPageSub(1);
      await Promise.all([fetchLeads(), fetchFormTypes()]);
    } else if (tab === 'all-pages') {
      setCurrentPagePages(1);
      await fetchPagesList(1, itemsPerPagePages);
    } else if (tab === 'all-events') {
      await fetchEventsList();
    } else if (tab === 'add-event') {
      await fetchPagesList(1, itemsPerPagePages, '', 'events');
    } else if (tab === 'all-blogs' || tab === 'add-blog') {
      try {
        const blogsData = await blogService.getBlogs(1, 10);
        setBlogs(blogsData.blogs || []);
        setTotalBlogsCount(blogsData.total || 0);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    } else if (tab === 'requests' && userRole === 'Super-Admin') {
      try {
        const data = await authService.getPendingRequests();
        const formattedRequests = (Array.isArray(data) ? data : (data.requests || [])).map((req: RequestUser & { full_name?: string }) => ({
          ...req,
          name: req.full_name || req.name || 'N/A'
        }));
        setRequests(formattedRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    } else if (tab === 'users' && userRole === 'Super-Admin') {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/users`, {
          credentials: 'include',
          cache: 'no-store',
        });
        await handleApiResponse(res);
        if (!res.ok) throw new Error('Failed to load users');
        const data = await res.json();
        const formattedUsers = (data.users || []).map((u: RequestUser & { full_name?: string }) => ({
          ...u,
          name: u.full_name || u.name || 'N/A',
        }));
        setAllUsers(formattedUsers);
        setApprovedUsersCount(formattedUsers.length);
      } catch (error) {
        if ((error as Error).message !== 'Unauthorized session') {
          console.error('Error fetching users:', error);
          setMessage({ text: 'Failed to load users.', type: 'error' });
        }
      }
    }
  }, [fetchLeads, fetchFormTypes, fetchPagesList, fetchEventsList, fetchOverviewData, userRole, itemsPerPagePages]);

  const handleScanPages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/pages/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mode: 'sync', removeMissing: false }),
      });
      await handleApiResponse(res);
      if (res.ok) {
        setMessage({ text: 'GitHub repository synchronized with database!', type: 'success' });
        fetchPagesList(currentPagePages, itemsPerPagePages, pageSearchQuery);
      }
    } catch (e) {
      console.error('Error scanning pages:', e);
      setMessage({ text: 'Failed to synchronize with GitHub.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePageToDB = async (page: PageItem) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pages/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify([{ name: page.name, path: page.path }])
      });
      await handleApiResponse(res);
      if (res.ok) {
        setPagesList(prev => prev.map(p => p.path === page.path ? { ...p, isIndexed: true, status: 'PUBLISHED', created_at: new Date().toISOString() } : p));
        setMessage({ text: `Page "${page.name}" and its hierarchy saved to database successfully!`, type: 'success' });
        fetchPagesList(currentPagePages, itemsPerPagePages, pageSearchQuery);
      }
    } catch (err) {
      console.error("Error saving page to DB:", err);
      setMessage({ text: 'Failed to save page to database.', type: 'error' });
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (
      !eventName.trim() ||
      !eventDayDate.trim() ||
      !eventTime.trim() ||
      !eventVenue.trim() ||
      !eventTargetPage.trim()
    ) {
      setMessage({
        text: 'Please fill in Event Name, Day & Date, Time, Venue, and Target Page.',
        type: 'error',
      });
      return;
    }

    try {
      const payload = {
        event_name: eventName.trim(),
        day_date: eventDayDate.trim(),
        event_time: eventTime.trim(),
        venue: eventVenue.trim(),
        cover_image: eventCoverImage.trim() || null,
        target_page: eventTargetPage.trim(),
        status: eventStatus,
        ...(editingEventId ? { id: editingEventId } : {}),
      };

      const res = await fetch(`${API_BASE_URL}/admin/events`, {
        method: editingEventId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      await handleApiResponse(res);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to save event');

      setMessage({ text: editingEventId ? 'Event updated successfully!' : 'Event created successfully!', type: 'success' });
      
      setEditingEventId(null);
      setEventName('');
      setEventDayDate('');
      setEventTime('');
      setEventVenue('');
      setEventCoverImage('');
      setEventTargetPage('');
      setEventStatus('Live');

      await fetchEventsList();
      setActiveTab('all-events');
    } catch (error: unknown) {
      const err = getErrorMessage(error);
      if (err !== 'Unauthorized session') {
        setMessage({ text: err, type: 'error' });
      }
    }
  };

  const handleEditEventClick = async (ev: EventItem) => {
    setEditingEventId(ev.id);
    setEventName(ev.event_name);
    setEventDayDate(ev.day_date);
    setEventTime(ev.event_time);
    setEventVenue(ev.venue);
    setEventCoverImage(ev.cover_image || '');
    setEventTargetPage(ev.target_page);
    setEventStatus(ev.status);
    setActiveTab('add-event');
    await fetchPagesList(1, 200, '', 'events');
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/events?id=${id}`, { method: 'DELETE', credentials: 'include' });
      await handleApiResponse(res);
      if (!res.ok) throw new Error('Failed to delete event');
      setMessage({ text: 'Event deleted successfully!', type: 'success' });
      setEventsList(prev => prev.filter(e => e.id !== id));
    } catch (error: unknown) {
      setMessage({ text: getErrorMessage(error), type: 'error' });
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch(`${API_BASE_URL}/auth/requests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, action }),
      });
      await handleApiResponse(res);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      setMessage({ 
        text: action === 'approve' ? 'Manager approved successfully!' : 'Request rejected and removed.', 
        type: 'success' 
      });

      const refreshed = await authService.getPendingRequests();
      const formattedRequests = (
        Array.isArray(refreshed) ? refreshed : refreshed.requests || []
      ).map((request: RequestUser & { full_name?: string }) => ({
        ...request,
        name: request.full_name || request.name || 'N/A',
      }));
      setRequests(formattedRequests);
    } catch (error: unknown) {
      const err = getErrorMessage(error);
      if (err !== 'Unauthorized session') {
        setMessage({ text: err, type: 'error' });
      }
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are You sure to Delete this User Permanently")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/delete-user?id=${id}`, { method: 'DELETE', credentials: 'include' });
      await handleApiResponse(res);
      if (!res.ok) throw new Error('Failed to delete user');
      setMessage({ text: 'User deleted successfully from database!', type: 'success' });
      setAllUsers(prev => {
        const updated = prev.filter(u => u.id !== id);
        setApprovedUsersCount(updated.length);
        return updated;
      });
    } catch (error: unknown) {
      setMessage({ text: getErrorMessage(error), type: 'error' });
    }
  };

  const handleLogout = async () => {
    await authService.logout();
  };

  const handleSetEditingBlogId = (id: number | null) => {
    setEditingBlogId(id);
    if (!id) setSelectedBlogForEdit(null);
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (!userSearchQuery.trim()) return true;
      const query = userSearchQuery.toLowerCase().trim();
      return (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query) || (u.role || '').toLowerCase().includes(query);
    });
  }, [allUsers, userSearchQuery]);

  const totalPagesUsers = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPageUsers));
  const safeCurrentPageUsers = Math.min(currentPageUsers, totalPagesUsers);
  const currentUsers = useMemo(() => filteredUsers.slice((safeCurrentPageUsers - 1) * itemsPerPageUsers, safeCurrentPageUsers * itemsPerPageUsers), [filteredUsers, safeCurrentPageUsers, itemsPerPageUsers]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (!requestSearchQuery.trim()) return true;
      const query = requestSearchQuery.toLowerCase().trim();
      return (req.name || '').toLowerCase().includes(query) || (req.email || '').toLowerCase().includes(query) || (req.role || '').toLowerCase().includes(query);
    });
  }, [requests, requestSearchQuery]);

  const totalPagesReq = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPageReq));
  const safeCurrentPageReq = Math.min(currentPageReq, totalPagesReq);
  const currentRequests = useMemo(() => filteredRequests.slice((safeCurrentPageReq - 1) * itemsPerPageReq, safeCurrentPageReq * itemsPerPageReq), [filteredRequests, safeCurrentPageReq, itemsPerPageReq]);

  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      const status = (ev.status || '').trim();
      let matchesTab = true;
      if (eventTableTab === 'Live') matchesTab = status === 'Live';
      else if (eventTableTab === 'Coming Soon') matchesTab = status === 'Coming Soon';
      else if (eventTableTab === 'Past Event') matchesTab = status === 'Past Event';

      const q = eventSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || (ev.event_name || '').toLowerCase().includes(q) || (ev.venue || '').toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [eventsList, eventTableTab, eventSearchQuery]);

  return (
    <div className="flex bg-gray-50 font-sans">
      
      {/* Sidebar Component */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        fetchData={fetchData}
        userRole={userRole}
        isEventsMenuOpen={isEventsMenuOpen}
        setIsEventsMenuOpen={setIsEventsMenuOpen}
        isBlogsMenuOpen={isBlogsMenuOpen}
        setIsBlogsMenuOpen={setIsBlogsMenuOpen}
        setEditingEventId={setEditingEventId}
        setEventName={setEventName}
        setEventDayDate={setEventDayDate}
        setEventTime={setEventTime}
        setEventVenue={setEventVenue}
        setEventCoverImage={setEventCoverImage}
        setEventTargetPage={setEventTargetPage}
        setEventStatus={setEventStatus}
        setEditingBlogId={handleSetEditingBlogId}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Pane Header Component */}
        <PaneHeader
          setIsSidebarOpen={setIsSidebarOpen}
          activeTab={activeTab}
          editingBlogId={editingBlogId}
          editingEventId={editingEventId}
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
        />

        {/* Content Pane */}
        <div className="p-4 sm:p-5 lg:p-[20px] flex-1">
          
          {activeTab === 'overview' && (
            <OverviewTab
              userName={userName}
              totalSubmissions={totalSubmissions}
              submissions={submissions}
              unreadLeadsCount={totalUnreadSubmissions}
              allUsers={allUsers}
              approvedUsersCount={approvedUsersCount}
              requests={requests}
              blogs={blogs}
              totalBlogsCount={totalBlogsCount}
              totalFilteredPagesCount={totalFilteredPagesCount}
              pagesList={pagesList}
              userRole={userRole}
              fetchData={fetchData}
              setEditingBlogId={handleSetEditingBlogId}
            />
          )}

          {activeTab === 'all-pages' && (
            <PagesTab
              message={message}
              totalFilteredPagesCount={totalFilteredPagesCount}
              handleScanPages={handleScanPages}
              pageSearchQuery={pageSearchQuery}
              setPageSearchQuery={setPageSearchQuery}
              pagesList={pagesList}
              handleSavePageToDB={handleSavePageToDB}
              totalPagesPages={totalPagesPages}
              currentPagePages={currentPagePages}
              setCurrentPagePages={setCurrentPagePages}
              itemsPerPagePages={itemsPerPagePages}
              setItemsPerPagePages={setItemsPerPagePages}
              goToPageInputPages={goToPageInputPages}
              setGoToPageInputPages={setGoToPageInputPages}
              isPerPageOpenPages={isPerPageOpenPages}
              setIsPerPageOpenPages={setIsPerPageOpenPages}
              perPageDropdownRefPages={perPageDropdownRefPages}
              userRole={userRole}
            />
          )}

          {activeTab === 'submissions' && (
            <LeadsTab
              isLoading={isLoading}
              submissions={submissions}
              selectedFormType={selectedFormType}
              isFormSelectorOpen={isFormSelectorOpen}
              setIsFormSelectorOpen={setIsFormSelectorOpen}
              formSearchQuery={formSearchQuery}
              setFormSearchQuery={setFormSearchQuery}
              filteredFormSelectorOptions={filteredFormSelectorOptions}
              setSelectedFormType={setSelectedFormType}
              setCurrentPageSub={setCurrentPageSub}
              leadFilter={leadFilter}
              setLeadFilter={setLeadFilter}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterOptions={filterOptions}
              selectedIds={selectedIds}
              isBulkOpen={isBulkOpen}
              setIsBulkOpen={setIsBulkOpen}
              handleBulkAction={handleBulkAction}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              customStartDate={customStartDate}
              setCustomStartDate={setCustomStartDate}
              customEndDate={customEndDate}
              setCustomEndDate={setCustomEndDate}
              isDateFilterOpen={isDateFilterOpen}
              setIsDateFilterOpen={setIsDateFilterOpen}
              dateFilterDropdownRef={dateFilterDropdownRef}
              formSelectorRef={formSelectorRef}
              filterDropdownRef={filterDropdownRef}
              bulkDropdownRef={bulkDropdownRef}
              exportDropdownRef={exportDropdownRef}
              isExportOpen={isExportOpen}
              setIsExportOpen={setIsExportOpen}
              exportFilteredCSV={exportFilteredCSV}
              exportFilteredExcel={exportFilteredExcel}
              exportFilteredJSON={exportFilteredJSON}
              isAllCurrentPageSelected={isAllCurrentPageSelected}
              handleSelectAllCurrentPage={handleSelectAllCurrentPage}
              handleSelectOne={handleSelectOne}
              dynamicFormKeys={dynamicFormKeys}
              handleSoftDeleteSubmission={handleSoftDeleteSubmission}
              handleRecoverSubmission={handleRecoverSubmission}
              handlePermanentDeleteSubmission={handlePermanentDeleteSubmission}
              totalSubmissions={totalSubmissions}
              totalPagesSub={totalPagesSub}
              currentPageSub={currentPageSub}
              itemsPerPageSub={itemsPerPageSub}
              setItemsPerPageSub={setItemsPerPageSub}
              goToPageInputSub={goToPageInputSub}
              setGoToPageInputSub={setGoToPageInputSub}
              isPerPageOpenSub={isPerPageOpenSub}
              setIsPerPageOpenSub={setIsPerPageOpenSub}
              perPageDropdownRefSub={perPageDropdownRefSub}
              hoveredUrl={hoveredUrl}
              setHoveredUrl={setHoveredUrl}
              getPageNameFromUrl={getPageNameFromUrl}
            />
          )}

          {activeTab === 'all-blogs' && (
            <AllBlogsTab 
              onEditBlog={(blog) => {
                setEditingBlogId(blog.id);
                setSelectedBlogForEdit(blog);
                setActiveTab('add-blog');
              }} 
            />
          )}

          {activeTab === 'add-blog' && (
            <AddBlogTab 
              editingBlog={selectedBlogForEdit}
              authorName={userName}
              authorRole={userRole}
              onBlogCreated={() => {
                handleSetEditingBlogId(null);
                fetchData('all-blogs');
              }} 
            />
          )}

          {activeTab === 'blog-categories' && <BlogCategoriesTab />}

          {activeTab === 'all-events' && (
            <EventsTab
              message={message}
              eventTableTab={eventTableTab}
              setEventTableTab={setEventTableTab}
              eventSearchQuery={eventSearchQuery}
              setEventSearchQuery={setEventSearchQuery}
              filteredEvents={filteredEvents}
              handleEditEventClick={handleEditEventClick}
              handleDeleteEvent={handleDeleteEvent}
              fetchData={fetchData}
              setEditingEventId={setEditingEventId}
              setEventName={setEventName}
              setEventDayDate={setEventDayDate}
              setEventTime={setEventTime}
              setEventVenue={setEventVenue}
              setEventCoverImage={setEventCoverImage}
              setEventTargetPage={setEventTargetPage}
              setEventStatus={setEventStatus}
            />
          )}

          {activeTab === 'add-event' && (
            <AddEventTab
              message={message}
              handleSaveEvent={handleSaveEvent}
              editingEventId={editingEventId}
              eventName={eventName}
              setEventName={setEventName}
              eventDayDate={eventDayDate}
              setEventDayDate={setEventDayDate}
              eventTime={eventTime}
              setEventTime={setEventTime}
              eventVenue={eventVenue}
              setEventVenue={setEventVenue}
              eventCoverImage={eventCoverImage}
              setEventCoverImage={setEventCoverImage}
              eventTargetPage={eventTargetPage}
              setEventTargetPage={setEventTargetPage}
              eventStatus={eventStatus}
              setEventStatus={setEventStatus}
              isTargetPageDropdownOpen={isTargetPageDropdownOpen}
              setIsTargetPageDropdownOpen={setIsTargetPageDropdownOpen}
              targetPageSearchQuery={targetPageSearchQuery}
              setTargetPageSearchQuery={setTargetPageSearchQuery}
              targetPageDropdownRef={targetPageDropdownRef}
              filteredTargetPages={pagesList}
              fetchData={fetchData}
            />
          )}

          {activeTab === 'requests' && (
            <RequestsTab
              message={message}
              filteredRequests={filteredRequests}
              requestSearchQuery={requestSearchQuery}
              setRequestSearchQuery={setRequestSearchQuery}
              currentRequests={currentRequests}
              currentPageReq={safeCurrentPageReq}
              setCurrentPageReq={setCurrentPageReq}
              itemsPerPageReq={itemsPerPageReq}
              setItemsPerPageReq={setItemsPerPageReq}
              totalRequests={filteredRequests.length}
              handleAction={handleAction}
            />
          )}

          {activeTab === 'users' && (
            <UsersTab
              message={message}
              filteredUsers={filteredUsers}
              userSearchQuery={userSearchQuery}
              setUserSearchQuery={setUserSearchQuery}
              currentUsers={currentUsers}
              currentPageUsers={safeCurrentPageUsers}
              setCurrentPageUsers={setCurrentPageUsers}
              itemsPerPageUsers={itemsPerPageUsers}
              setItemsPerPageUsers={setItemsPerPageUsers}
              totalUsers={filteredUsers.length}
              userRole={userRole}
              handleDeleteUser={handleDeleteUser}
            />
          )}

        </div>
      </main>
    </div>
  );
}