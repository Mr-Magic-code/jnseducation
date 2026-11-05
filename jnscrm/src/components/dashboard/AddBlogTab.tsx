// src/components/dashboard/AddBlogTab.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { blogService } from '@/services/blogService';
import type { BlogCategory, BlogItem } from '@/types/dashboard';

interface AddBlogTabProps {
  onBlogCreated: () => void;
  editingBlog?: BlogItem | null;
  authorName: string;
  authorRole: string;
}

function AddBlogTabComponent({
  onBlogCreated,
  editingBlog,
  authorName,
  authorRole,
}: AddBlogTabProps) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      setError('');
      try {
        const data = await blogService.getCategories();
        setCategories(data);

        if (editingBlog) {
          setTitle(editingBlog.title || '');
          setSlug(editingBlog.slug || '');
          setCoverImage(editingBlog.cover_image || '');
          setCategoryId(editingBlog.category_id ? Number(editingBlog.category_id) : null);
          if (editorRef.current) {
            editorRef.current.innerHTML = editingBlog.content || '';
          }
          setIsCustomSlug(true);
        } else {
          setTitle('');
          setSlug('');
          setCoverImage('');
          setCategoryId(null);
          setIsCustomSlug(false);
          if (editorRef.current) editorRef.current.innerHTML = '';
        }
      } catch (err) {
        console.error('Error loading initial blog data:', err);
        setError('Failed to load blog categories.');
      }
    }
    loadData();
  }, [editingBlog]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isCustomSlug && !editingBlog) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [isCustomSlug, editingBlog]);

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomSlug(true);
    setSlug(e.target.value);
  }, []);

  const handleCoverImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCoverImage(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value ? Number(e.target.value) : null);
  }, []);

  const executeCommand = useCallback((command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const handleFormatBlock = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const tag = e.target.value;
    if (tag) {
      executeCommand('formatBlock', tag);
      e.target.value = '';
    }
  }, [executeCommand]);

  const handleLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
      if (editorRef.current) {
        const links = editorRef.current.querySelectorAll('a');
        links.forEach((link) => {
          if (!link.style.color) {
            link.style.color = '#0071F6';
            link.style.textDecoration = 'underline';
          }
        });
      }
    }
  }, [executeCommand]);

  const handleImage = useCallback(() => {
    const url = prompt('Enter Image URL:');
    if (url) executeCommand('insertImage', url);
  }, [executeCommand]);

  const handleForeColor = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    executeCommand('foreColor', e.target.value);
  }, [executeCommand]);

  const handleSave = useCallback(async (status: 'published' | 'draft') => {
    setError('');

    if (!title.trim()) {
      setError('Please enter a blog title.');
      return;
    }

    const content = editorRef.current ? editorRef.current.innerHTML : '';
    if (!content.replace(/<[^>]*>/g, '').trim()) {
      setError('Please add some blog content before saving.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        cover_image: coverImage.trim(),
        content,
        status,
        author_name: authorName || 'Admin',
        author_role: authorRole || 'Admin',
      };

      if (editingBlog && editingBlog.id) {
        await blogService.updateBlog(editingBlog.id, payload);
      } else {
        await blogService.createBlog(payload);
      }
      onBlogCreated();
    } catch (error) {
      console.error('Error saving blog:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to save blog.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    title,
    slug,
    categoryId,
    coverImage,
    editingBlog,
    authorName,
    authorRole,
    onBlogCreated,
  ]);

  const handleCancel = useCallback(() => {
    setTitle('');
    setSlug('');
    setCoverImage('');
    setCategoryId(null);
    if (editorRef.current) editorRef.current.innerHTML = '';
    onBlogCreated();
  }, [onBlogCreated]);

  const handleSaveDraft = useCallback(() => handleSave('draft'), [handleSave]);
  const handleSavePublished = useCallback(() => handleSave('published'), [handleSave]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="small-heading text-gray-700">{editingBlog ? 'Edit Blog' : 'Blog Meta'}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">BLOG TITLE (NAME) *</label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Complete Guide for UK Student Visa in 2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">SLUG (URL) *</label>
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="complete-guide-for-uk-student-visa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">COVER IMAGE DIRECT URL</label>
            <input
              type="text"
              value={coverImage}
              onChange={handleCoverImageChange}
              placeholder="https://example.com/images/uk-visa-banner.webp"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">CATEGORY</label>
            <select
              value={categoryId || ''}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-800"
            >
              <option value="">Select Category (Optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
          Live Target URL: domain.com/blog/{slug || 'your-blog-slug'}
        </div>
      </div>

      {/* Blog Content & Formatting Box */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl shadow-xs">
          <select
            onChange={handleFormatBlock}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none font-medium cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Headings</option>
            <option value="<h1>">Heading 1</option>
            <option value="<h2>">Heading 2</option>
            <option value="<h3>">Heading 3</option>
            <option value="<h4>">Heading 4</option>
            <option value="<h5>">Heading 5</option>
            <option value="<h6>">Heading 6</option>
            <option value="<p>">Paragraph</option>
          </select>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          <button onClick={() => executeCommand('bold')} className="px-3 py-1.5 font-bold border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 cursor-pointer shadow-xs">B</button>
          <button onClick={() => executeCommand('italic')} className="px-3 py-1.5 italic border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 cursor-pointer shadow-xs">I</button>
          <button onClick={() => executeCommand('underline')} className="px-3 py-1.5 underline border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 cursor-pointer shadow-xs">U</button>
          <button onClick={() => executeCommand('strikeThrough')} className="px-3 py-1.5 line-through border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 cursor-pointer shadow-xs">S</button>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          <div className="flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded-lg text-xs shadow-xs">
            <span className="text-gray-500 font-medium">Color</span>
            <input type="color" onChange={handleForeColor} className="w-5 h-5 border-0 rounded cursor-pointer bg-transparent" />
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          <button onClick={() => executeCommand('justifyLeft')} className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 cursor-pointer shadow-xs">Left</button>
          <button onClick={() => executeCommand('justifyCenter')} className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 cursor-pointer shadow-xs">Center</button>
          <button onClick={() => executeCommand('justifyRight')} className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 cursor-pointer shadow-xs">Right</button>
          <button onClick={() => executeCommand('justifyFull')} className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 cursor-pointer shadow-xs">Justify</button>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          <button onClick={() => executeCommand('insertUnorderedList')} className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 font-medium cursor-pointer shadow-xs" title="Bullet List">Bullet List</button>
          <button onClick={() => executeCommand('insertOrderedList')} className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 font-medium cursor-pointer shadow-xs" title="Numbered List">Number List</button>
          
          <button onClick={() => executeCommand('indent')} className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 font-medium cursor-pointer shadow-xs" title="Make Sub-list (Indent)">Sub-list ➔</button>
          <button onClick={() => executeCommand('outdent')} className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 font-medium cursor-pointer shadow-xs" title="Remove Sub-list (Outdent)">⬅ Outdent</button>

          <button onClick={() => executeCommand('formatBlock', '<blockquote>')} className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-gray-700 cursor-pointer shadow-xs">Quote</button>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          <button onClick={handleLink} className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-[#0071F6] font-semibold cursor-pointer shadow-xs">Link</button>
          <button onClick={() => executeCommand('unlink')} className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-red-600 font-medium cursor-pointer shadow-xs">Unlink</button>
          <button onClick={handleImage} className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-xs text-emerald-600 font-medium cursor-pointer shadow-xs">Image</button>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          <button onClick={() => executeCommand('removeFormat')} className="px-3 py-1.5 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-xs text-red-600 font-semibold cursor-pointer shadow-xs">Clear</button>
        </div>

        {/* Fixed Height Editable Content Area with Visible List Bullets & Numbers */}
        <div
          ref={editorRef}
          contentEditable={true}
          className="w-full h-[450px] max-h-[450px] p-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 overflow-y-auto prose max-w-none shadow-inner [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
          style={{ lineHeight: '1.7' }}
        />
      </div>

      <div className="flex justify-end items-center gap-4 pt-4">
        <button
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveDraft}
          disabled={loading}
          className="px-6 py-2 border border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg font-medium text-sm cursor-pointer disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          onClick={handleSavePublished}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Saving...' : (editingBlog ? 'Update & Publish' : 'Publish')}
        </button>
      </div>
    </div>
  );
}

export const AddBlogTab = React.memo(AddBlogTabComponent);
export default AddBlogTab;