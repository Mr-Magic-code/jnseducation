'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/services/auth.service';
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Centralized auth service ke zariye login request
      await authService.login({ email: username, password });
      window.location.replace('/protection/dashboard');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row bg-white md:min-h-screen font-sans">
      
      {/* Left Side: SVG Illustration Banner */}
      <div className="hidden md:flex w-full md:w-[54%] lg:w-[40%] bg-[#0071f6] items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-[620px] flex items-center justify-center">
          <Image
            src="/images/left_img_login.svg"
            alt="Get Ready to manage leads and students Smarter, Better, Faster"
            width={600}
            height={400}
          />
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-[46%] lg:w-[30%] bg-white flex flex-col justify-between items-center py-10 px-6 pb-[50px] md:justify-center">
        
        <div className="hidden md:block" />

        {/* Form Container */}
        <div className="w-full max-w-[340px] flex flex-col items-center">
          <div className="w-full">
            <h1 className="text-[24px] font-normal text-[#0071f6] mb-5">
              Hello Again
            </h1>

            {errorMessage && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] text-gray-700 font-normal mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="mohsin.jamil@jns.com"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 text-sm focus:outline-none focus:border-[#0071f6] transition"
                />
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 font-normal mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 text-sm focus:outline-none focus:border-[#0071f6] transition"
                />
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#0071f6] hover:bg-[#0071f6] active:bg-[#00447a] text-white text-sm font-medium rounded shadow-sm transition duration-150 disabled:opacity-60 cursor-pointer flex justify-center items-center"
                >
                  {isLoading ? 'Logging in...' : 'Login Now'}
                </button>
              </div>
            </form>

            {/* Links Section */}
            <div className="mt-6 space-y-1 text-[13px] text-gray-600">
              <p>
                Don&apos;t have an account?{' '}
                <Link href="/protection/admin" className="text-[#0071f6] hover:underline font-medium">
                  Register here
                </Link>
              </p>
              <p>
                Super Admin?{' '}
                <Link href="/protection/flash-admin" className="text-[#0071f6] hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Policy Links */}
        <div className="flex items-center gap-6 text-[12px] text-gray-500 mt-8">
          <Link href="/privacy-policy" className="hover:text-gray-800 hover:underline transition">
            Privacy &amp; Cookies Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-gray-800 hover:underline transition">
            Terms &amp; Conditions
          </Link>
        </div>

      </div>
    </div>
  );
}