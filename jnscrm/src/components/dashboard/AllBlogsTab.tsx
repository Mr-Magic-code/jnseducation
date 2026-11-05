// src/components/dashboard/AllBlogsTab.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { blogService } from '@/services/blogService';
import Image from 'next/image';
import type { BlogItem } from '@/types/dashboard';

interface AllBlogsTabProps {
  onEditBlog?: (blog: BlogItem) => void;
}

function AllBlogsTabComponent({ onEditBlog }: AllBlogsTabProps) {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await blogService.getBlogs(
        page,
        10,
        search,
        statusFilter === 'All' ? '' : statusFilter.toLowerCase()
      );
      setBlogs(data.blogs || []);
      setTotalPages(data.totalPages || 1);
      setTotalBlogs(data.total || 0);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setBlogs([]);
      setTotalBlogs(0);
      setTotalPages(1);
      setError(
        err instanceof Error ? err.message : 'Failed to load blogs.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBlogs();
  }, [fetchBlogs]);

  const handleTrash = async (id: number) => {
    try {
      await blogService.trashBlog(id);
      await fetchBlogs();
    } catch (err) {
      console.error('Error moving blog to trash:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to move blog to trash.'
      );
    }
  };

  const handleRecover = async (id: number) => {
    try {
      await blogService.recoverBlog(id);
      await fetchBlogs();
    } catch (err) {
      console.error('Error recovering blog:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to recover blog.'
      );
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      await blogService.deleteBlog(id);
      await fetchBlogs();
    } catch (err) {
      console.error('Error permanently deleting blog:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to delete blog permanently.'
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters and Search Bar Box */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['All', 'Published', 'Draft', 'Trashed'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="w-full md:w-80">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search blogs by title, slug, category..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase bg-gray-50">
                <th className="py-3 px-4">Cover</th>
                <th className="py-3 px-4">Title & Slug</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Last Edit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Published Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Loading blogs...
                  </td>
                </tr>
              ) : blogs.length > 0 ? (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {blog.cover_image ? (
                        <Image
                          src={blog.cover_image}
                          alt={blog.title}
                          width={48}
                          height={32}
                          className="w-12 h-8 object-cover rounded border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                          No Img
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-gray-900 truncate">{blog.title}</div>
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        /blog/{blog.slug} ↗
                      </a>
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {blog.category_name || 'Uncategorized'}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      <div>{blog.author_name}</div>
                      <div className="text-xs text-gray-400">{blog.author_role}</div>
                    </td>

                    <td className="py-3 px-4 text-gray-600 text-xs">
                      <div>{blog.last_edited_by || blog.author_name || 'N/A'}</div>
                      <div className="text-gray-400">
                        {blog.updated_at ? new Date(blog.updated_at).toLocaleString() : 'N/A'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                          blog.status === 'published'
                            ? 'bg-green-50 text-green-600'
                            : blog.status === 'draft'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View Blog"
                          className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-blue-200 inline-flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>

                        <button
                          onClick={() => {
                            if (onEditBlog) {
                              onEditBlog(blog);
                            } else {
                              console.warn('onEditBlog handler is not provided');
                            }
                          }}
                          title="Edit Blog"
                          className="p-2 bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-amber-200 inline-flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {blog.status === 'trashed' ? (
                          <>
                            <button
                              onClick={() => handleRecover(blog.id)}
                              title="Recover Blog to Draft"
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg text-xs font-bold transition duration-200 cursor-pointer border border-emerald-200 inline-flex items-center justify-center"
                            >
                              Recover
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(blog.id)}
                              title="Delete Permanently"
                              className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-red-200 inline-flex items-center justify-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleTrash(blog.id)}
                            title="Move to Trash"
                            className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-red-200 inline-flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No blogs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">Total {totalBlogs} Blogs</div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm bg-white disabled:opacity-50 cursor-pointer"
            >
              {'<'}
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded text-sm bg-white disabled:opacity-50 cursor-pointer"
            >
              {'>'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const AllBlogsTab = React.memo(AllBlogsTabComponent);
export default AllBlogsTab;