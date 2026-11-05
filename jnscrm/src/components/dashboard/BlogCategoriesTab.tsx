// src/components/CategoriesTab.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { blogService } from '@/services/blogService';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Fetch categories optimized with useCallback
  const fetchCategories = useCallback(async () => {
    try {
      const data = await blogService.getCategories();
      setCategories(Array.isArray(data) ? data : (data.categories || []));
    } catch (error) {
      console.error('Failed to fetch categories', error);
      setError('Failed to load categories.');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  // Auto-slug generator logic
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isCustomSlug && !editingId) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomSlug(true);
    setSlug(e.target.value);
  };

  // Handle Create or Update Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setError('');
    setLoading(true);
    try {
      if (editingId) {
        await blogService.updateCategory(editingId, name.trim(), slug.trim());
      } else {
        await blogService.createCategory(name.trim(), slug.trim());
      }

      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error('Failed to save category', error);
      setError(
        error instanceof Error ? error.message : 'Failed to save category.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setIsCustomSlug(false);
    setEditingId(null);
  };

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setIsCustomSlug(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category permanently?')) return;

    setError('');
    try {
      await blogService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Failed to delete category', error);
      setError(
        error instanceof Error ? error.message : 'Failed to delete category.'
      );
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (cat) =>
      (cat.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create / Edit Category Box */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="small-heading text-gray-700 mb-5">
          {editingId ? 'Edit Category' : 'Create New Category'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">CATEGORY NAME *</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Visa Guidance"
              className="placeholder-gray-400 text-[14px] text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">SLUG *</label>
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="visa-guidance"
              className="placeholder-gray-400 text-[14px] text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : editingId ? 'Update Category' : 'Add Category'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories List Box */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="small-heading text-gray-700">
            Categories List ({filteredCategories.length})
          </h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="placeholder-gray-400 w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase bg-gray-50">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{cat.name}</td>
                    <td className="py-3 px-4 text-gray-500">{cat.slug}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(cat)}
                        className="px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded hover:bg-blue-50 cursor-pointer transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(cat.id)}
                        className="px-3 py-1 text-xs border border-red-500 text-red-500 rounded hover:bg-red-50 cursor-pointer transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-400">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}