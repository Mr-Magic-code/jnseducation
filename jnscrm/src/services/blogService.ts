// src/services/blogService.ts

import type {
  CreateBlogPayload,
  UpdateBlogPayload,
} from '@/types/content';

const API_BASE_URL = '/backend';

export const blogService = {
  // --- CATEGORIES API ---
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/admin/blogs/categories`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      credentials: 'include',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch categories');
    }
    return data.categories || data || [];
  },

  async createCategory(name: string, slug: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blogs/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, slug }),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(id: number, name: string, slug: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blogs/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, slug }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      return await response.json();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blogs/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      return await response.json();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // --- BLOGS API ---
  async getBlogs(page = 1, limit = 10, search = '', status = '') {
    const response = await fetch(
      `${API_BASE_URL}/admin/blogs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`,
      {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include',
        cache: 'no-store',
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch blogs');
    }
    return data;
  },

  async createBlog(blogData: CreateBlogPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(blogData),
      });
      if (!response.ok) throw new Error('Failed to create blog');
      return await response.json();
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  async updateBlog(id: number, blogData: UpdateBlogPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(blogData),
      });
      if (!response.ok) throw new Error('Failed to update blog');
      return await response.json();
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  },

  async trashBlog(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'trashed' }),
      });
      if (!response.ok) throw new Error('Failed to move blog to trash');
      return await response.json();
    } catch (error) {
      console.error('Error trashing blog:', error);
      throw error;
    }
  },

  async recoverBlog(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'draft' }),
      });
      if (!response.ok) throw new Error('Failed to recover blog');
      return await response.json();
    } catch (error) {
      console.error('Error recovering blog:', error);
      throw error;
    }
  },

  async deleteBlog(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to permanently delete blog');
      return await response.json();
    } catch (error) {
      console.error('Error deleting blog permanently:', error);
      throw error;
    }
  },
};