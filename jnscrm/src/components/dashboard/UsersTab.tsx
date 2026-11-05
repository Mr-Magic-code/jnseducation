'use client';

import React from 'react';
import TablePagination from './TablePagination';
import type { Message, RequestUser } from '@/types/dashboard';

interface UsersTabProps {
  message: Message;
  filteredUsers: RequestUser[];
  userSearchQuery: string;
  setUserSearchQuery: (val: string) => void;
  setCurrentPageUsers: (page: number | ((prev: number) => number)) => void;
  currentUsers: RequestUser[];
  currentPageUsers: number;
  itemsPerPageUsers: number;
  setItemsPerPageUsers: (items: number) => void;
  totalUsers: number;
  userRole: string;
  handleDeleteUser: (id: number) => void;
}

export default function UsersTab({
  message,
  filteredUsers,
  userSearchQuery,
  setUserSearchQuery,
  setCurrentPageUsers,
  currentUsers,
  currentPageUsers,
  itemsPerPageUsers,
  setItemsPerPageUsers,
  totalUsers,
  userRole,
  handleDeleteUser,
}: UsersTabProps) {
  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-[20px]">
      {message.text && (
        <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="text-sm font-semibold text-gray-700">
          Total Approved Users: <span className="text-primary">{filteredUsers.length}</span>
        </div>
        <input
          type="text"
          value={userSearchQuery}
          onChange={(e) => {
            setUserSearchQuery(e.target.value);
            setCurrentPageUsers(1);
          }}
          placeholder="Search users..."
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
              <th className="p-4 text-left">Requested at</th>
              {userRole === 'Super-Admin' && <th className="p-4 text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentUsers.map((u) => (
              <tr key={u.id} className="hover:bg-blue-50/40 transition">
                <td className="p-4 font-medium text-gray-900">{u.name}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-blue-50 text-primary border border-blue-200 rounded-full text-xs font-medium">
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-gray-600">
                  {u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A'}
                </td>
                {userRole === 'Super-Admin' && (
                  <td className="p-4 text-center">
                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition border border-red-200 cursor-pointer" title="Delete User">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPageUsers}
          itemsPerPage={itemsPerPageUsers}
          totalItems={totalUsers}
          onPageChange={setCurrentPageUsers}
          onItemsPerPageChange={setItemsPerPageUsers}
        />
      </div>
    </div>
  );
}