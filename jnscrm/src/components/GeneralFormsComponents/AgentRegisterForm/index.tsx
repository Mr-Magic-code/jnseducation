'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { ChevronDown, Info } from 'lucide-react';

const countryCodeMap: Record<string, CountryCode> = {
  '+92': 'PK',
  '+971': 'AE',
  '+966': 'SA',
  '+974': 'QA',
  '+973': 'BH',
  '+965': 'KW',
  '+91': 'IN',
  '+968': 'OM',
  '+44': 'GB',
  '+1': 'US',
  '+61': 'AU',
  '+961': 'LB',
};

const countryFlags: Record<string, string> = {
  '+92': '🇵🇰',
  '+971': '🇦🇪',
  '+966': '🇸🇦',
  '+974': '🇶🇦',
  '+973': '🇧🇭',
  '+965': '🇰🇼',
  '+91': '🇮🇳',
  '+968': '🇴🇲',
  '+44': '🇬🇧',
  '+1': '🇺🇸',
  '+61': '🇦🇺',
  '+961': '🇱🇧',
};

export default function AgentRegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ceoName: '',
    companyName: '',
    ceoEmail: '',
    phoneCode: '+92',
    phoneNumber: '',
    officeAddress: '',
    city: '',
    country: '',
    involvedInDisputes: '',
    yearsAsAgent: '',
    hasSubAgencies: '',
    partnerships: '',
    expectedStudents: '',
    feeDetails: '',
    refereeName: '',
    refereeAddress: '',
    refereeOrg: '',
    refereeTel: '',
    referredBy: '',
    agreedToDeclaration: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const disputeDropdownRef = useRef<HTMLDivElement>(null);
  const declarationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        activeDropdown &&
        !countryDropdownRef.current?.contains(event.target as Node) &&
        !disputeDropdownRef.current?.contains(event.target as Node) &&
        !declarationDropdownRef.current?.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let finalValue = value;
      if (name === 'phoneNumber') {
        finalValue = value.replace(/\D/g, '');
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

  const handleSelectDropdown = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setActiveDropdown(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Field validations
    const requiredFields = [
      'ceoName',
      'companyName',
      'ceoEmail',
      'phoneNumber',
      'officeAddress',
      'city',
      'country',
      'involvedInDisputes',
      'yearsAsAgent',
      'hasSubAgencies',
      'partnerships',
      'feeDetails',
      'refereeName',
      'refereeAddress',
      'refereeOrg',
      'refereeTel',
      'referredBy',
      'agreedToDeclaration',
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        setSubmitError('Please fill out all required fields marked with *');
        return;
      }
    }

    const countryIso = countryCodeMap[formData.phoneCode];
    if (!isValidPhoneNumber(formData.phoneNumber, countryIso)) {
      setPhoneError('Please enter a valid phone number before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/backend/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'Agent Registration',
          source_url:
            typeof window !== 'undefined' ? window.location.href : '',
          form_data: {
            ...formData,
            consent: formData.agreedToDeclaration === 'Yes',
            consentAt: new Date().toISOString(),
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      router.push('/thank-you');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(
        (error as Error).message || 'Network error. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = [
    'Australia',
    'Bahrain',
    'Canada',
    'Germany',
    'India',
    'Kuwait',
    'Lebanon',
    'Malaysia',
    'New Zealand',
    'Oman',
    'Pakistan',
    'Qatar',
    'Saudi Arabia',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex-1">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12 space-y-10"
        >
          {/* 1. Company Profile */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b border-gray-100 pb-3">
              Company Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Name of CEO / Director <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ceoName"
                  required
                  value={formData.ceoName}
                  onChange={handleChange}
                  placeholder="Name of CEO/Director"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  CEO / Director&apos;s Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="ceoEmail"
                  required
                  value={formData.ceoEmail}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Contact # <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="phoneCode"
                    value={formData.phoneCode}
                    onChange={handleChange}
                    className="px-3 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    {Object.keys(countryFlags).map((code) => (
                      <option key={code} value={code}>
                        {countryFlags[code]} {code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Contact #"
                    className={`w-full px-4 py-3 rounded-xl border ${phoneError
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      } bg-white text-gray-800 placeholder-gray-400 focus:ring-2 outline-none transition shadow-2xs text-sm`}
                  />
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Office Address <span className="text-red-500">*</span>
                </label>
                <span title="Please provide your full corporate office address">
                  <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                </span>
              </div>
              <input
                type="text"
                name="officeAddress"
                required
                value={formData.officeAddress}
                onChange={handleChange}
                placeholder="Complete Office Address"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Your City"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
                />
              </div>

              <div className="relative" ref={countryDropdownRef}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'country' ? null : 'country')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-left text-sm flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition cursor-pointer shadow-2xs"
                >
                  <span className={formData.country ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                    {formData.country || 'Select Country'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {activeDropdown === 'country' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 max-h-60 overflow-y-auto">
                    {countries.map((c) => (
                      <div
                        key={c}
                        onClick={() => handleSelectDropdown('country', c)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors ${formData.country === c
                          ? 'bg-[#eef5ff] text-[#0071f6]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-[#0071f6]'
                          }`}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative" ref={disputeDropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Has the company or any individual within the company ever been involved in past, pending, threatened or potential litigation, arbitration, administrative actions or other disputes? <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'dispute' ? null : 'dispute')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-left text-sm flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition cursor-pointer shadow-2xs"
              >
                <span className={formData.involvedInDisputes ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                  {formData.involvedInDisputes || '- Select -'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {activeDropdown === 'dispute' && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5">
                  {['Yes', 'No'].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => handleSelectDropdown('involvedInDisputes', opt)}
                      className={`px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors ${formData.involvedInDisputes === opt
                        ? 'bg-[#eef5ff] text-[#0071f6]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#0071f6]'
                        }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Years as an Education Agent <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="yearsAsAgent"
                required
                value={formData.yearsAsAgent}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Do you have any sub-agencies? If so, please include agency name(s). <span className="text-red-500">*</span>
              </label>
              <textarea
                name="hasSubAgencies"
                value={formData.hasSubAgencies}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Partnerships with Other Agencies / Portals? <span className="text-red-500">*</span>
              </label>
              <textarea
                name="partnerships"
                value={formData.partnerships}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm resize-none"
              />
            </div>
          </div>

          {/* 2. Performance */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b border-gray-100 pb-3">
              Performance
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                How many Students will you register with us for this year?
              </label>
              <input
                type="text"
                name="expectedStudents"
                value={formData.expectedStudents}
                onChange={handleChange}
                placeholder="e.g. 50"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
              />
            </div>
          </div>

          {/* 3. Service Fee and Charges */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b border-gray-100 pb-3">
              Service Fee and Charges
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Please provide details of your consultancy and visa filing Charges <span className="text-red-500">*</span>
              </label>
              <textarea
                name="feeDetails"
                required
                value={formData.feeDetails}
                onChange={handleChange}
                rows={3}
                placeholder="Consultancy and visa filing Charges details"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm resize-none"
              />
            </div>
          </div>

          {/* 4. Business Referee */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b border-gray-100 pb-3">
              Business Referee
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Business Referee Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="refereeName"
                  required
                  value={formData.refereeName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Business Referee Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="refereeAddress"
                  required
                  value={formData.refereeAddress}
                  onChange={handleChange}
                  placeholder="Address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="refereeOrg"
                  required
                  value={formData.refereeOrg}
                  onChange={handleChange}
                  placeholder="Organization"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Telephone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="refereeTel"
                  required
                  value={formData.refereeTel}
                  onChange={handleChange}
                  placeholder="Telephone Number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Who referred you to JnS Education? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="referredBy"
                required
                value={formData.referredBy}
                onChange={handleChange}
                placeholder="Please specify the name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-2xs text-sm"
              />
            </div>
          </div>

          {/* 5. Declaration */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b border-gray-100 pb-3">
              Declaration
            </h3>

            <div className="relative" ref={declarationDropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 leading-relaxed">
                I agree to regularly monitor policies and changes to the policies as reported on the UK Border Agency, and I have read the British Council Guide to Good Practice for Agents and agree to adhere to the relevant standards. <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'declaration' ? null : 'declaration')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-left text-sm flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition cursor-pointer shadow-2xs"
              >
                <span className={formData.agreedToDeclaration ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                  {formData.agreedToDeclaration || '- Select -'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {activeDropdown === 'declaration' && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5">
                  {['Yes'].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => handleSelectDropdown('agreedToDeclaration', opt)}
                      className={`px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors ${formData.agreedToDeclaration === opt
                        ? 'bg-[#eef5ff] text-[#0071f6]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#0071f6]'
                        }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              By submitting this form you agree to our{' '}
              <Link href="/terms-and-conditions" className="text-[#0071f6] hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-[#0071f6] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            {submitError && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                role="alert"
              >
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-[#0071f6] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 text-sm cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
