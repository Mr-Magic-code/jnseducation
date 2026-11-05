'use client';

import React from 'react';
import TablePagination from './TablePagination';
import type { Message, RequestUser } from '@/types/dashboard';

interface RequestsTabProps {
  message: Message;
  filteredRequests: RequestUser[];
  requestSearchQuery: string;
  setRequestSearchQuery: (val: string) => void;
  setCurrentPageReq: (page: number | ((prev: number) => number)) => void;
  currentRequests: RequestUser[];
  currentPageReq: number;
  itemsPerPageReq: number;
  setItemsPerPageReq: (items: number) => void;
  totalRequests: number;
  handleAction: (id: number, action: 'approve' | 'reject') => void;
}

export default function RequestsTab({
  message,
  filteredRequests,
  requestSearchQuery,
  setRequestSearchQuery,
  setCurrentPageReq,
  currentRequests,
  currentPageReq,
  itemsPerPageReq,
  setItemsPerPageReq,
  totalRequests,
  handleAction,
}: RequestsTabProps) {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-[20px]">
      {message.text && (
        <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-700">
          Total Pending Requests: <span className="text-primary">{filteredRequests.length}</span>
        </div>
        <input
          type="text"
          value={requestSearchQuery}
          onChange={(e) => {
            setRequestSearchQuery(e.target.value);
            setCurrentPageReq(1);
          }}
          placeholder="Search requests..."
          className="w-full sm:w-80 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 outline-none focus:bg-white focus:border-primary"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRequests.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">No pending manager requests found.</td>
              </tr>
            ) : (
              currentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#eef5ff]/60 transition">
                  <td className="p-4 font-medium text-gray-800">{req.name}</td>
                  <td className="p-4 text-gray-600">{req.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                      {req.role}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button onClick={() => handleAction(req.id, 'approve')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium cursor-pointer">
                      Approve
                    </button>
                    <button onClick={() => handleAction(req.id, 'reject')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium cursor-pointer">
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPageReq}
          itemsPerPage={itemsPerPageReq}
          totalItems={totalRequests}
          onPageChange={setCurrentPageReq}
          onItemsPerPageChange={setItemsPerPageReq}
        />
      </div>
    </div>
  );
}