'use client';

import React, { useState } from 'react';
import { authService } from '@/services/auth.service';

export default function SuperAdminSignup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState(''); 
  
  // UI States
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reusable function to check valid domains
  const isValidEmailDomain = (email: string) => {
    const validDomains = ['@gmail.com', '@jnsedu.com', '@jnsedu.co.uk'];
    return validDomains.some(domain => email.toLowerCase().endsWith(domain));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    
    if (val && !isValidEmailDomain(val)) {
      setEmailError('Email must end with @gmail.com, @jnsedu.com, or @jnsedu.co.uk');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    // Client-side validations
    if (!fullName.trim()) {
      setFormError('Full Name is required');
      return;
    }
    if (!isValidEmailDomain(email)) {
      setEmailError('Please use a valid company or Gmail address.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }
    if (!secretKey.trim()) {
      setFormError('Secret Key is required');
      return;
    }

    setIsLoading(true);

    try {
      // Centralized service call to backend '/register-super-admin'
      await authService.registerSuperAdmin({
        full_name: fullName,
        email,
        password,
        secretKey,
      });

      setSuccessMsg('Super Admin account created successfully! Redirecting to login...');
      setFullName('');
      setEmail('');
      setPassword('');
      setSecretKey('');
      
      setTimeout(() => {
        window.location.replace('/protection/login');
      }, 2000);

    } catch (error: unknown) {
      setFormError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-[#fbfbfb] font-sans p-[20px] min-h-screen items-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="w-full max-w-[340px] mx-auto">
          
          {/* Heading */}
          <h1 className="text-3xl mb-2 font-medium tracking-wide text-primary">
            Super Admin
          </h1>
          <p className="text-gray-500 mb-8 text-sm">Create your highly secure admin account</p>

          {/* Form Level Error Message */}
          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
              {formError}
            </div>
          )}

          {/* Form Start */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-[14px] font-medium text-[#4b5563] mb-1.5">
                Full Name
              </label>
              <input 
                id="fullName"
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0071f6] focus:border-[#0071f6] text-gray-800 placeholder-gray-300 text-sm"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-[14px] font-medium text-[#4b5563] mb-1.5">
                Email Address
              </label>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={handleEmailChange}
                placeholder="admin@jnsedu.com"
                className={`w-full px-3 py-2 bg-white border ${emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#0071f6] focus:border-[#0071f6]'} rounded focus:outline-none focus:ring-1 text-gray-800 placeholder-gray-300 text-sm`}
                required
              />
              {emailError && <p className="text-red-500 text-xs mt-1 leading-tight">{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[14px] font-medium text-[#4b5563] mb-1.5">
                Password
              </label>
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0071f6] focus:border-[#0071f6] text-gray-800 placeholder-gray-300 text-sm"
                required
              />
            </div>

            {/* Secret Key */}
            <div>
              <label htmlFor="secretKey" className="block text-[14px] font-medium text-[#4b5563] mb-1.5 flex items-center justify-between">
                <span>Secret Master Key</span>
                <span className="text-[10px] text-gray-400 font-normal uppercase tracking-wider">Required</span>
              </label>
              <input 
                id="secretKey"
                type="password" 
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter authorized key"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0071f6] focus:border-[#0071f6] text-gray-800 placeholder-gray-300 text-sm tracking-wider"
                required
              />
              <p className="text-gray-400 text-[11px] mt-1">This key is required to register as Super Admin.</p>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full px-8 py-2.5 bg-primary text-white rounded hover:bg-[#005ecb] transition-colors text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying & Creating...
                  </>
                ) : (
                  'Create Super Admin'
                )}
              </button>
            </div>
            
            {/* Success Message */}
            {successMsg && (
              <div className="p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200 mt-4 text-center">
                {successMsg}
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}