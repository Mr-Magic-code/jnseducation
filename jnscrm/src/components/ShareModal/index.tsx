'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Share2, X, Check, Copy } from 'lucide-react';

interface ShareModalProps {
  title: string;
  className?: string;
  trigger?: React.ReactNode;
}

export default function ShareModal({ title, className = '', trigger }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleOpen = () => {
    setShareUrl(window.location.href);
    setIsOpen(true);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard && shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(shareUrl || (typeof window !== 'undefined' ? window.location.href : ''));
    const encodedTitle = encodeURIComponent(title);
    let targetUrl = '';

    switch (platform) {
      case 'facebook':
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'whatsapp':
        targetUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${url}`;
        break;
      case 'twitter':
        targetUrl = `https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'instagram':
        handleCopyLink();
        showToast('Link copied! Open Instagram to share.');
        return;
      default:
        break;
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Full screen Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Centered Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 z-[1000000] text-gray-900 border border-gray-100 transform transition-all duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2270c9] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Share Page</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mb-4 py-2 px-3 bg-blue-50 border border-blue-200 text-[#2270c9] text-xs font-medium rounded-xl flex items-center justify-between">
            <span>{toastMessage}</span>
            <Check className="w-3.5 h-3.5 text-[#2270c9]" />
          </div>
        )}

        {/* Social Icons Grid */}
        <div className="grid grid-cols-5 gap-2 my-6">
          
          {/* Facebook */}
          <button 
            onClick={() => shareToSocial('facebook')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            type="button"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-600">Facebook</span>
          </button>

          {/* WhatsApp */}
          <button 
            onClick={() => shareToSocial('whatsapp')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            type="button"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.826 0-3.623-.49-5.195-1.42l-.372-.222-3.863 1.013 1.03-3.764-.244-.388a10.05 10.05 0 0 1-1.543-5.424c0-5.55 4.516-10.067 10.068-10.067 2.69 0 5.218 1.048 7.118 2.948a10.016 10.016 0 0 1 2.947 7.121c0 5.551-4.516 10.068-10.067 10.068M12.051 0C5.398 0 0 5.397 0 12.05c0 2.126.554 4.202 1.608 6.027L0 24l6.109-1.602a11.99 11.99 0 0 0 5.942 1.579h.005c6.652 0 12.05-5.398 12.05-12.05C24.106 5.397 18.704 0 12.051 0"/>
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-600">WhatsApp</span>
          </button>

          {/* Instagram */}
          <button 
            onClick={() => shareToSocial('instagram')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            type="button"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-600">Instagram</span>
          </button>

          {/* LinkedIn */}
          <button 
            onClick={() => shareToSocial('linkedin')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            type="button"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#0A66C2] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6z"/>
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-600">LinkedIn</span>
          </button>

          {/* Twitter / X */}
          <button 
            onClick={() => shareToSocial('twitter')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            type="button"
          >
            <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-600">Twitter (X)</span>
          </button>

        </div>

        {/* Copy Link Section */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 pl-3">
          <input 
            type="text" 
            readOnly 
            value={shareUrl} 
            className="w-full bg-transparent text-xs text-gray-600 outline-none truncate font-mono"
          />
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0 cursor-pointer shadow-sm"
            type="button"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

      </div>
    </div>
  );

  return (
    <>
      {/* Trigger Button */}
      {trigger ? (
        <div onClick={handleOpen} className="inline-block cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button 
          onClick={handleOpen}
          className={`w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 hover:border-white/60 transition-all duration-200 cursor-pointer text-white shadow-sm ${className}`}
          title="Share page"
          type="button"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}

      {/* Render Modal via React Portal directly into document.body */}
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
