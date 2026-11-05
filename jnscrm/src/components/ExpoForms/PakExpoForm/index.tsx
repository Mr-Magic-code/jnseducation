'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { ChevronDown } from 'lucide-react';

const countryCodeMap: Record<string, CountryCode> = {
  '+92': 'PK',
};

interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: (string | DropdownOption)[];
  placeholder?: string;
}

function CustomDropdown({
  name,
  value,
  onChange,
  options,
  placeholder = '- Select -'
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formattedOptions: DropdownOption[] = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = formattedOptions.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-left text-sm flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 cursor-pointer shadow-2xs"
      >
        <span className={selectedOption ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 space-y-1 max-h-60 overflow-y-auto">
          {formattedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(name, opt.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#eef5ff] text-[#0071f6]'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#0071f6]'
                }`}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PakExpoForm({
  formName = "Pak Expo Form",
  onSubmitSuccess,
  className = "",
  labelColor = "text-black",
  eventDatesOptions = [
    'JnS Education Office - 18th January 2027 - Lahore Gulberg',
    'JnS Education Office - 19th January 2027 - Lahore PECHS',
    'JnS Education Office - 20th January 2027 - Karachi PECHS',
    'JnS Education Office - 21st January 2027 - Islamabad',
    'JnS Education Office - 22nd January 2027 - Multan',
    'JnS Education Office - 23rd January 2027 - Faisalabad'
  ]
}: {
  formName?: string;
  onSubmitSuccess?: (data: Record<string, unknown>) => void;
  className?: string;
  labelColor?: string;
  eventDatesOptions?: string[];
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneCode: '+92',
    phoneNumber: '',
    eventDate: '',
    countryOfInterest: '',
    recentQualification: '',
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => {
      let finalValue = type === 'checkbox' ? checked : value;

      if (name === 'phoneNumber' && typeof finalValue === 'string') {
        finalValue = finalValue.replace(/\D/g, '');
      }

      const newData = { ...prev, [name]: finalValue };

      if (name === 'phoneNumber' || name === 'phoneCode') {
        const countryIso = countryCodeMap[newData.phoneCode];
        if (newData.phoneNumber) {
          if (!isValidPhoneNumber(newData.phoneNumber, countryIso)) {
            setPhoneError('Invalid phone number for selected country.');
          } else {
            setPhoneError('');
          }
        } else {
          setPhoneError('');
        }
      }

      return newData;
    });
  };

  const handleDropdownChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.eventDate ||
      !formData.countryOfInterest ||
      !formData.recentQualification ||
      !formData.consent
    ) {
      alert('Please fill out all required fields marked with *');
      return;
    }

    const countryIso = countryCodeMap[formData.phoneCode];
    if (!isValidPhoneNumber(formData.phoneNumber, countryIso)) {
      setPhoneError('Please enter a valid phone number before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend ke mutabiq Payload structure
      const payload = {
        form_type: formName, // DB mein 'Pak Expo Form' save hoga
        source_url: typeof window !== 'undefined' ? window.location.href : '',
        form_data: {
          fullName: formData.fullName,
          firstName: formData.fullName.split(' ')[0] || formData.fullName,
          lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phoneCode: formData.phoneCode,
          phoneNumber: formData.phoneNumber,
          preferredIntake: formData.eventDate,
          countryOfInterest: formData.countryOfInterest,
          recentQualification: formData.recentQualification,
          consent: formData.consent,
          consentAt: new Date().toISOString(),
        },
      };

      // NestJS Backend API Endpoint (Port 4000)
      const res = await fetch('/backend/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit form');
      }

      const result = await res.json();

      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      } else {
        router.push('/thank-you');
      }

    } catch (error: unknown) {
      console.error('Error submitting form:', (error as Error).message);
      alert('An error occurred while saving your data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8 max-w-3xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 placeholder-gray-400/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 placeholder-gray-400/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Phone / Mobile */}
        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            Phone/Mobile <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              name="phoneCode"
              value={formData.phoneCode}
              onChange={handleChange}
              className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="+92">🇵🇰 +92</option>
            </select>
            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Primary Contact"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                phoneError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } bg-white text-gray-700 placeholder-gray-400/70 focus:ring-2 outline-none transition`}
            />
          </div>
          {phoneError && (
            <p className="text-red-500 text-xs mt-1">{phoneError}</p>
          )}
        </div>

        {/* Events Dates */}
        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            Events Dates – Please select the event you wish to attend! (Free Entry!) <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            name="eventDate"
            value={formData.eventDate}
            onChange={handleDropdownChange}
            placeholder="- Select Date -"
            options={eventDatesOptions}
          />
        </div>

        {/* Country of Interest & Recent Qualification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-1`}>
              Country of Interest <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              name="countryOfInterest"
              value={formData.countryOfInterest}
              onChange={handleDropdownChange}
              placeholder="- Select -"
              options={[
                'Dubai',
                'Ireland',
                'Australia',
                'Canada',
                'Malaysia',
                'Germany',
                'Saudi Arabia',
                'New Zealand',
                'United States',
                'United Kingdom',
                'OTHER'
              ]}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-1`}>
              Recent Qualification <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              name="recentQualification"
              value={formData.recentQualification}
              onChange={handleDropdownChange}
              placeholder="- Select Your Recent Qualification -"
              options={[
                'English Language',
                'School',
                'Undergraduate',
                'Postgraduate',
                'Doctoral',
                'Vocational',
                'University Preparation'
              ]}
            />
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="pakExpoConsent"
            name="consent"
            required
            checked={formData.consent}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="pakExpoConsent" className="text-sm font-medium text-black cursor-pointer">
            I consent to have this website save my submitted information so they can respond to my inquiry <span className="text-red-500">*</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-3 bg-[#0071f6] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Registering...' : 'Get Free Register'}
          </button>
        </div>
      </form>
    </div>
  );
}