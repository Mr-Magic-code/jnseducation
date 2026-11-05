'use client';

import React, { useState } from 'react';
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import Link from 'next/link';

const countryCodeMap: Record<string, CountryCode> = {
  '+92': 'PK',
  '+971': 'AE',
  '+966': 'SA',
  '+974': 'QA',
  '+973': 'BH',
  '+965': 'KW',
  '+44': 'GB',
  '+1': 'US',
  '+61': 'AU',
  '+353': 'IE',
  '+60': 'MY',
  '+49': 'DE',
  '+64': 'NZ',
};

interface SupportQueryFormProps {
  formName?: string;
  onSubmitSuccess?: (data: Record<string, unknown>) => void;
  className?: string;
}

export default function SupportQueryForm({
  formName = 'Support Form',
  onSubmitSuccess,
  className = '',
}: SupportQueryFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneCode: '+92',
    phoneNumber: '',
    service: '',
    message: '',
    agreement: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => {
      let finalValue: string | boolean = type === 'checkbox' ? checked : value;

      if (name === 'phoneNumber' && typeof finalValue === 'string') {
        finalValue = finalValue.replace(/\D/g, '');
      }

      const updated = { ...prev, [name]: finalValue };

      if (name === 'phoneNumber' || name === 'phoneCode') {
        const countryIso = countryCodeMap[updated.phoneCode];
        if (updated.phoneNumber) {
          if (!isValidPhoneNumber(updated.phoneNumber, countryIso)) {
            setPhoneError('Invalid phone number for selected country.');
          } else {
            setPhoneError('');
          }
        } else {
          setPhoneError('');
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.service ||
      !formData.agreement
    ) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill out all required fields marked with * and accept terms.',
      });
      return;
    }

    const countryIso = countryCodeMap[formData.phoneCode];
    if (!isValidPhoneNumber(formData.phoneNumber, countryIso)) {
      setPhoneError('Please enter a valid phone number before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        form_type: formName,
        source_url: typeof window !== 'undefined' ? window.location.href : '',
        form_data: {
          ...formData,
          consent: formData.agreement,
          consentAt: new Date().toISOString(),
        },
      };

      const res = await fetch('/backend/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Your query has been submitted successfully. Our team will contact you shortly.',
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(payload);      }

      setFormData({
        fullName: '',
        email: '',
        phoneCode: '+92',
        phoneNumber: '',
        service: '',
        message: '',
        agreement: false,
      });
      setPhoneError('');
    } catch (error: unknown) {
      setSubmitStatus({
        type: 'error',
        message: (error as Error).message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 bg-white ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Full Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label className="block text-sm sm:text-base font-normal text-[#334155] mb-2">
              Full Name <span className="text-[#0071f6] font-semibold">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter Your Full Name"
              className="w-full px-4 py-3 rounded-lg bg-[#f0f4f9] border border-transparent text-[#334155] placeholder-[#94a3b8] text-sm sm:text-base focus:bg-white focus:border-[#0071f6] focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-normal text-[#334155] mb-2">
              Email <span className="text-[#0071f6] font-semibold">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full px-4 py-3 rounded-lg bg-[#f0f4f9] border border-transparent text-[#334155] placeholder-[#94a3b8] text-sm sm:text-base focus:bg-white focus:border-[#0071f6] focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Row 2: Contact Number */}
        <div>
          <label className="block text-sm sm:text-base font-normal text-[#334155] mb-2">
            Contact Number <span className="text-[#0071f6] font-semibold">*</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
            <div className="sm:w-32 shrink-0">
              <select
                name="phoneCode"
                value={formData.phoneCode}
                onChange={handleChange}
                className="w-full h-full min-h-[48px] px-3 py-3 rounded-lg sm:rounded-r-none sm:rounded-l-lg bg-[#0071f6] text-white text-sm sm:text-base font-medium outline-none cursor-pointer hover:bg-[#0060d4] transition-colors"
              >
                <option value="+92">🇵🇰 +92</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+974">🇶🇦 +974</option>
                <option value="+973">🇧🇭 +973</option>
                <option value="+965">🇰🇼 +965</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+353">🇮🇪 +353</option>
                <option value="+60">🇲🇾 +60</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+64">🇳🇿 +64</option>
              </select>
            </div>
            <div className="flex-1">
              <input
                type="tel"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Contact Number"
                className={`w-full px-4 py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg bg-[#f0f4f9] border text-[#334155] placeholder-[#94a3b8] text-sm sm:text-base outline-none transition-all duration-200 ${phoneError
                    ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-transparent focus:bg-white focus:border-[#0071f6] focus:ring-2 focus:ring-blue-100'
                  }`}
              />
            </div>
          </div>
          {phoneError && <p className="text-red-500 text-xs sm:text-sm mt-1.5">{phoneError}</p>}
        </div>

        {/* Row 3: Service */}
        <div>
          <label className="block text-sm sm:text-base font-normal text-[#334155] mb-2">
            Service <span className="text-[#0071f6] font-semibold">*</span>
          </label>
          <div className="relative">
            <select
              name="service"
              required
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-3.5 rounded-lg bg-[#f0f4f9] border border-transparent text-[#334155] text-sm sm:text-base focus:bg-white focus:border-[#0071f6] focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 cursor-pointer appearance-none"
            >
              <option value="">- Select -</option>
              <option value="Study Abroad Counseling">Study Abroad Counseling</option>
              <option value="University Admission Guidance">University Admission Guidance</option>
              <option value="Visa Application Assistance">Visa Application Assistance</option>
              <option value="PTE / Language Preparation">PTE / Language Preparation</option>
              <option value="Scholarship Inquiries">Scholarship Inquiries</option>
              <option value="Complaints / Feedback">Complaints / Feedback</option>
              <option value="Other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Row 4: Textarea Details */}
        <div>
          <textarea
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Details of Compalints / Query / Remarks etc"
            className="w-full px-4 py-3.5 rounded-lg bg-[#f0f4f9] border border-transparent text-[#334155] placeholder-[#94a3b8] text-sm sm:text-base focus:bg-white focus:border-[#0071f6] focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 resize-y"
          />
        </div>

        {/* Row 5: Agreement Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agreement"
            name="agreement"
            required
            checked={formData.agreement}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0071f6] focus:ring-[#0071f6] cursor-pointer"
          />
          <label htmlFor="agreement" className="text-xs sm:text-sm text-[#334155] leading-relaxed cursor-pointer select-none">
            I agree to the <span className="font-bold text-black">JnS Education</span>{' '}
            <Link href="/terms-and-conditions" className="text-[#0071f6] hover:underline">
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="text-[#0071f6] hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Status Alerts */}
        {submitStatus && (
          <div
            className={`p-4 rounded-lg text-sm ${submitStatus.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
              }`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* Row 6: Submit Button */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[200px] px-8 py-3.5 bg-[#0071f6] hover:bg-[#005ecb] active:bg-[#004fa8] text-white font-medium text-base rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer text-center"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Query'}
          </button>
        </div>
      </form>
    </div>
  );
}