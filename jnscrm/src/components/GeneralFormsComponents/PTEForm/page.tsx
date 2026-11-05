'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

const countryCodeMap: Record<string, CountryCode> = {
    '+92': 'PK',
    '+973': 'BH',
    '+974': 'QA',
    '+966': 'SA',
    '+965': 'KW',
    '+971': 'AE',
    '+91': 'IN',
    '+968': 'OM',
    '+44': 'GB',
    '+1': 'US',
    '+61': 'AU',
    '+963': 'SY',
};

const countryFlags: Record<string, string> = {
    '+92': '🇵🇰',
    '+973': '🇧🇭',
    '+974': '🇶🇦',
    '+966': '🇸🇦',
    '+965': '🇰🇼',
    '+971': '🇦🇪',
    '+91': '🇮🇳',
    '+968': '🇴🇲',
    '+44': '🇬🇧',
    '+1': '🇺🇸',
    '+61': '🇦🇺',
    '+963': '🇸🇾',
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
        <div className="relative w-full text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[#f0f4f8] text-left text-sm flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 cursor-pointer shadow-2xs text-gray-700"
            >
                <span className={selectedOption && selectedOption.value ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                    {selectedOption && selectedOption.value ? selectedOption.label : placeholder}
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

export default function PTEForm({
    formName = "PTE Form",
    onSubmitSuccess,
    className = "",
}: {
    formName?: string;
    onSubmitSuccess?: (data: Record<string, unknown>) => void;
    className?: string;
}) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneCode: '+971',
        phoneNumber: '',
        service: '',
        office: 'Other',
        specification: '',
        consent: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            let finalValue = value;
            if (name === 'phoneNumber' && typeof finalValue === 'string') {
                finalValue = finalValue.replace(/\D/g, '');
            }
            const newData = { ...prev, [name]: finalValue };

            if (name === 'phoneNumber' || name === 'phoneCode') {
                const phoneCodeKey = newData.phoneCode;
                const countryIso = countryCodeMap[phoneCodeKey];
                if (newData.phoneNumber && countryIso) {
                    const isValid = isValidPhoneNumber(newData.phoneNumber, countryIso);
                    if (isValid) {
                        setPhoneError('');
                    } else {
                        setPhoneError('Invalid phone number for selected country.');
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
        setSubmitError('');

        if (!formData.fullName.trim() || !formData.email.trim() || !formData.phoneNumber.trim() || !formData.service || !formData.consent) {
            setSubmitError('Please fill out all required fields and accept the consent notice.');
            return;
        }

        const countryIso = countryCodeMap[formData.phoneCode];
        if (countryIso && !isValidPhoneNumber(formData.phoneNumber, countryIso)) {
            setPhoneError('Please enter a valid phone number before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            // GFC Form ki tarah same structured payload jo backend handle karega
            const payload = {
                form_type: formName,
                source_url: typeof window !== 'undefined' ? window.location.href : '',
                form_data: {
                    fullName: formData.fullName,
                    firstName: formData.fullName.split(' ')[0] || formData.fullName,
                    lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
                    email: formData.email,
                    phoneCode: formData.phoneCode,
                    phoneNumber: formData.phoneNumber,
                    preferredCourseLevel: formData.service,
                    countryOfResidence: formData.office,
                    recentQualification: formData.specification,
                    consent: formData.consent,
                    consentAt: new Date().toISOString(),
                }
            };

            // Backend endpoint (ensure karein port wahi ho jo aapka backend use kar raha hai, jaise 4000 ya 3000)
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

            setFormData({
                fullName: '',
                email: '',
                phoneCode: '+971',
                phoneNumber: '',
                service: '',
                office: 'Other',
                specification: '',
                consent: false,
            });
            setPhoneError('');

        } catch (error: unknown) {
            console.error('Error submitting form:', (error as Error).message);
            setSubmitError((error as Error).message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`bg-white rounded-2xl shadow-xl border-t-4 border-amber-500 border-x border-b border-amber-100 p-6 md:p-8 max-w-md mx-auto ${className}`}>
            <div className="flex justify-center mb-6">
                <Image
                    src="/images/Icons/Jns-Education-Logo.svg"
                    alt="JnS Education Logo"
                    width={64}
                    height={64}
                    className="h-16 w-auto"
                />
            </div>

            <p className="text-center text-gray-800 font-semibold mb-6 px-2 text-sm leading-relaxed">
                <span className="text-red-600 font-bold">Register now</span> to take PTE Mock test in a
                real exam setting and experience an official PTE test environment!
            </p>

            {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4" role="alert">
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Candidate Full Name"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[#f0f4f8] text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            name="phoneCode"
                            value={formData.phoneCode}
                            onChange={handleChange}
                            className="h-full px-3 py-3 rounded-lg border border-gray-200 bg-blue-600 text-white font-medium text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none flex items-center justify-center gap-1 min-w-[70px] text-center"
                            style={{ backgroundImage: 'none' }}
                        >
                            {Object.keys(countryCodeMap).map((code) => (
                                <option key={code} value={code} className="bg-white text-gray-800">
                                    {countryFlags[code]} {code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="tel"
                        name="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Contact Number"
                        className={`w-full px-4 py-3 rounded-lg border ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'} bg-[#f0f4f8] text-gray-800 placeholder-gray-400 focus:ring-2 outline-none transition text-sm`}
                    />
                </div>
                {phoneError && (
                    <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}

                <div>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[#f0f4f8] text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                    />
                </div>

                <div>
                    <CustomDropdown
                        name="service"
                        value={formData.service}
                        onChange={handleDropdownChange}
                        placeholder="- Select Service -"
                        options={[
                            'Register for Mock Test',
                            'PTE/IELTS Test Preparation',
                        ]}
                    />
                </div>

                <div>
                    <CustomDropdown
                        name="office"
                        value={formData.office}
                        onChange={handleDropdownChange}
                        placeholder="- Select Office -"
                        options={[
                            'Study Abroad',
                            'Immigration',
                        ]}
                    />
                </div>

                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="pteConsent"
                        name="consent"
                        required
                        checked={formData.consent}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="pteConsent" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
                        I consent to have this website save my submitted information so the team can respond to my inquiry.
                    </label>
                </div>

                <div className="text-center pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 text-sm cursor-pointer"
                    >
                        {isSubmitting ? 'Registering...' : 'Register Now'}
                    </button>
                </div>
            </form>
        </div>
    );
}