'use client';

import React from 'react';

interface TablePaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export default function TablePagination({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
      <div>
        Showing {start}-{end} of {totalItems}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <label className="flex items-center gap-1.5">
          <span>Rows</span>
          <select
            value={itemsPerPage}
            onChange={(event) => {
              onItemsPerPageChange(Number(event.target.value));
              onPageChange(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 outline-none focus:border-primary"
          >
            {[6, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1 font-medium text-gray-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1 font-medium text-gray-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
