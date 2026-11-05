'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/services/auth.service';
export default function AdminSignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState(''); // Secret Key State
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim() || !email.trim() || !password.trim() || !secretKey.trim()) {
      setErrorMessage('Please fill in all the fields including the Secret Key.');
      return;
    }

    setIsLoading(true);

    try {
      // Centralized service call without branch_office
      await authService.registerManager({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        secretKey: secretKey.trim(),
      });

      setSuccessMessage('Registration successful! Your request has been sent to the Super Admin for approval.');
      setFullName('');
      setEmail('');
      setPassword('');
      setSecretKey('');

      setTimeout(() => {
        window.location.replace('/protection/login');
      }, 2000);

    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row bg-white md:min-h-screen">
      
      {/* Left Side: SVG Illustration Banner */}
      <div className="hidden md:flex w-full md:w-[54%] lg:w-[40%] bg-[#0071f6] items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-[620px] flex items-center justify-center text-center flex-col">
          <Image
            src="/images/left_img_login.svg"
            alt="Manager Registration Banner"
            width={600}
            height={400}
            className="mb-8"
          />
          <h2 className="text-white text-3xl font-semibold mb-2">Manager Portal</h2>
          <p className="text-white/80 text-sm">Register to access your dashboard and manage leads.</p>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="w-full md:w-[46%] lg:w-[30%] bg-white flex flex-col justify-between items-center py-10 px-6 pb-[50px] md:justify-center">
        
        {/* Form Container */}
        <div className="w-full max-w-[340px] flex flex-col items-center">
          <div className="w-full">
            <h1 className="best-heading text-[#0071f6] mb-5">
              Manager Registration
            </h1>

            {errorMessage && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-2.5 bg-green-50 border border-green-200 text-green-700 text-xs rounded">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] text-gray-700 font-normal mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ali Khan"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 text-sm focus:outline-none focus:border-[#0071f6] transition"
                />
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 font-normal mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@domain.com"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 text-sm focus:outline-none focus:border-[#0071f6] transition"
                />
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 font-normal mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter manager secret key"
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-2.5 bg-[#0071f6] hover:bg-[#0071f6] active:bg-[#00447a] text-white text-sm font-medium rounded shadow-sm transition duration-150 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? 'Submitting...' : 'Request Access'}
                </button>
              </div>
            </form>

            <div className="mt-6 space-y-1 text-[13px] text-gray-600 text-center">
              <p>
                Already have an account?{' '}
                <Link href="/protection/login" className="text-[#0071f6] hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}