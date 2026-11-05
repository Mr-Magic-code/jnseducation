'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { ChevronDown, Search } from 'lucide-react';

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
  '+64': 'NZ'
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
  searchable?: boolean;
}

function CustomDropdown({
  name,
  value,
  onChange,
  options,
  placeholder = '-- Select --',
  searchable = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formattedOptions: DropdownOption[] = options.map(opt => {
    const cleanLabel = typeof opt === 'string' ? opt.trim() : opt.label.trim();
    const cleanValue = typeof opt === 'string' ? opt.trim() : opt.value.trim();
    return { label: cleanLabel, value: cleanValue };
  });

  const selectedOption = formattedOptions.find(opt => opt.value === value);

  const filteredOptions = searchable 
    ? formattedOptions.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : formattedOptions;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-left text-sm flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 cursor-pointer shadow-2xs"
      >
        <span className={selectedOption ? 'text-gray-800 font-medium truncate pr-2' : 'text-gray-400 truncate pr-2'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 space-y-1">
          {searchable && (
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(name, opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
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
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConsultationForm({ 
  formName = "GFC Form",
  onSubmitSuccess,
  labelColor = "text-mustard"
}: {
  title?: string;
  subtitle?: string;
  formName?: string;
  onSubmitSuccess?: (data: Record<string, unknown>) => void;
  className?: string;
  labelColor?: string;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneCode: '+92',
    phoneNumber: '',
    email: '',
    countryOfInterest: '',
    preferredCourseLevel: '',
    preferredIntake: '',
    recentQualification: '',
    countryOfResidence: '',
    nearestOffice: '',
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [submitError, setSubmitError] = useState('');

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
    setSubmitError('');

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.email.trim() ||
      !formData.countryOfInterest ||
      !formData.preferredCourseLevel ||
      !formData.preferredIntake ||
      !formData.recentQualification ||
      !formData.countryOfResidence ||
      !formData.nearestOffice ||
      !formData.consent
    ) {
      setSubmitError('Please fill out all required fields marked with *');
      return;
    }

    const countryIso = countryCodeMap[formData.phoneCode];
    if (!isValidPhoneNumber(formData.phoneNumber, countryIso)) {
      setPhoneError('Please enter a valid phone number before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend ke mutabiq payload structure jismein form_type "GFC Form" jayega
      const payload = {
        form_type: formName,
        source_url: typeof window !== 'undefined' ? window.location.href : '',
        form_data: {
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneCode: formData.phoneCode,
          phoneNumber: formData.phoneNumber,
          countryOfInterest: formData.countryOfInterest,
          preferredCourseLevel: formData.preferredCourseLevel,
          preferredIntake: formData.preferredIntake,
          recentQualification: formData.recentQualification,
          countryOfResidence: formData.countryOfResidence,
          nearestOffice: formData.nearestOffice,
          consent: formData.consent,
          consentAt: new Date().toISOString(),
        },
      };

      // NestJS Backend Endpoint (Port 4000) jo local DB save ke sath CRM forwarding handle karega
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
        firstName: '',
        lastName: '',
        phoneCode: '+92',
        phoneNumber: '',
        email: '',
        countryOfInterest: '',
        preferredCourseLevel: '',
        preferredIntake: '',
        recentQualification: '',
        countryOfResidence: '',
        nearestOffice: '',
        consent: false,
      });
      setPhoneError('');

    } catch (error: unknown) {
      console.error('Error submitting form:', (error as Error).message);
      setSubmitError((error as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 placeholder-gray-400/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 placeholder-gray-400/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className={`block text-sm font-medium ${labelColor} mb-1`}>
          Phone/Mobile <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <select
            name="phoneCode"
            value={formData.phoneCode}
            onChange={handleChange}
            className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="+92">Pakistan +92</option>
            <option value="+971">UAE +971</option>
            <option value="+966">Saudi Arabia +966</option>
            <option value="+974">Qatar +974</option>
            <option value="+973">Bahrain +973</option>
            <option value="+965">Kuwait +965</option>
            <option value="+44">UK +44</option>
            <option value="+1">US/Canada +1</option>
          </select>
          <input
            type="tel"
            name="phoneNumber"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-lg border ${phoneError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} bg-white text-gray-600 placeholder-gray-400/70 focus:ring-2 outline-none transition`}
          />
        </div>
        {phoneError && (
          <p className="text-red-500 text-xs mt-1">{phoneError}</p>
        )}
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-2" role="alert">
          {submitError}
        </div>
      )}

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
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 placeholder-gray-400/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      {/* Destination & Course Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            Your Country of Interest <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            name="countryOfInterest"
            value={formData.countryOfInterest}
            onChange={handleDropdownChange}
            placeholder="-- Select --"
            searchable={true}
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
            Preferred Course Level <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            name="preferredCourseLevel"
            value={formData.preferredCourseLevel}
            onChange={handleDropdownChange}
            placeholder="-- Select Course Level --"
            searchable={true}
            options={[
              'Art Administration & Fine Art',
              'Interior Design',
              'Industrial, Craft and Product Design',
              'Media, Film, Theatre and Drama Studies',
              'Music and Dance',
              'Fashion, Textile and Esthetics',
              'Journalism and Mass Communication',
              'Food and Culinary',
              'Astronomy and Physics',
              'Biology',
              'Biomedical Sciences',
              'Chemistry',
              'Earth, Geology and Environmental Sciences',
              'Biochemistry',
              'Food, Nutrition, Sport and Exercise',
              'Forensic Science',
              'General Sciences',
              'Mathematics',
              'Life and Humanitarian Science',
              'Material Sciences',
              'Aerospace and Aviation Technology',
              'Architecture',
              'Biomedical Engineering',
              'Chemical and Material Engineering',
              'Civil, Stuctural and Construction',
              'Electrical, Renewable and Power',
              'Electronic and Telecommunication',
              'Environmental Engineering',
              'Agriculture',
              'Industrial & Marine Engineering',
              'Automotive, Mechanical, Manufacturing, Metallurgy and Robotics',
              'Computer, Software and Hardware',
              'General Engineering and Technology',
              'Mining and Oil & Gas',
              'Computer Science & Artificial Intelligence',
              'Animation, Multimedia, Graphic & Game Design',
              'Computing, Software, IT & Cyber Security',
              'Business Information Systems',
              'Data Science, Big Data',
              'Accounting, Finance, Acturial & Economics',
              'Entrepreneurship',
              'Hospitality and Tourism',
              'Human Resource and People Management',
              'Public Relations',
              'Business studies, Management and Administration',
              'Marketing, Advertising and Digital Marketing',
              'Project Management, Risk and Strategic Management',
              'Transporation, Supply Chain and Logistics',
              'Law, Politics and Police',
              'Dentistry, Oral Health and Dental Science',
              'Health Public Health and Studies',
              'Health and Safety',
              'Medicine',
              'Nursing and Midwifery',
              'Nutrition and Dietetics',
              'Ophthalmology',
              'Pharmacy and Pharmacology',
              'Veterinary Medicine',
              'Physiotherapy',
              'Psychology and counselling',
              'Radiography',
              'Anthropology',
              'Liberal Arts',
              'Gender Studies',
              'Religion Studies',
              'Languages and Translation',
              'English Studies and TESOL',
              'Sociology and Social Sciences',
              'General Studies',
              'Literature and Philosophy',
              'Teaching, Early Development, Child Care',
              'Education Psychology, Coaching and Special Education',
              'Teacher Training, Pedagogy and Education Management'
            ]}
          />
        </div>
      </div>

      {/* Intake & Recent Qualification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            Preferred Intake to Apply <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            name="preferredIntake"
            value={formData.preferredIntake}
            onChange={handleDropdownChange}
            placeholder="-- Select --"
            options={[
              'Jan 2027',
              'May 2027',
              'Sept 2027',
              'Jan 2028',
              'May 2028',
              'Sept 2028',
              'Jan 2029',
              'May 2029',
              'Sept 2029'
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
            placeholder="-- Select --"
            searchable={true}
            options={[
              'Grade 11',
              'Grade 12',
              'O-Level',
              'AS / A-Level',
              'International baccalaureate',
              'Foundation Year',
              'Undergraduate Diploma',
              '2-Year Undergraduate Degree',
              '3-Year Bachelor\'s Degree',
              '4-Year Bachelor\'s Degree',
              'Postgraduate Certificate',
              'Postgraduate Diploma',
              'Master\'s Degree',
              'Doctorate / PhD',
              '5-Year Bachelor\'s Degree',
              'Pre-sessional English',
              'Diploma Level 7',
              'Diploma Level 5'
            ]}
          />
        </div>
      </div>

      {/* Country of Residence & Nearest Office */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            Country of Residence <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            name="countryOfResidence"
            value={formData.countryOfResidence}
            onChange={handleDropdownChange}
            placeholder="-- Select your Country of Stay --"
            searchable={true}
            options={[
              { label: 'Pakistan', value: 'Pakistan' },
              { label: 'United Arab Emirates', value: 'United Arab Emirates' },
              { label: 'Saudi Arabia', value: 'Saudi Arabia' },
              { label: 'Qatar', value: 'Qatar' },
              { label: 'Bahrain', value: 'Bahrain' },
              { label: 'Kuwait', value: 'Kuwait' },
              { label: 'United Kingdom (UK)', value: 'United Kingdom (UK)' },
              { label: 'United States (US)', value: 'United States (US)' },
              { label: 'Australia', value: 'Australia' },
              { label: 'Canada', value: 'Canada' },
              { label: 'Other Country', value: 'OTHER' }
            ]}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-1`}>
            Nearest JnS Education Office <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            name="nearestOffice"
            value={formData.nearestOffice}
            onChange={handleDropdownChange}
            placeholder="-- Select Nearest Office --"
            searchable={true}
            options={[
              'Doha, Qatar',
              'Salmiya, Kuwait',
              'Seef, Bahrain',
              'Dubai, UAE',
              'Riyadh, Saudi Arabia',
              'Islamabad, Pakistan',
              'Lahore Gulberg, Pakistan',
              'Lahore DHA, Pakistan',
              'Karachi, Pakistan',
              'Multan, Pakistan',
              'Faisalabad, Pakistan'
            ]}
          />
        </div>
      </div>

      {/* Consent Checkbox */}
      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          required
          checked={formData.consent}
          onChange={handleChange}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="consent" className="text-sm font-medium text-black cursor-pointer">
          I consent to have this website save my submitted information so they can respond to my inquiry <span className="text-red-500">*</span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-3 bg-mustard hover:bg-[#d49917] text-black font-bold rounded-lg shadow-sm transition duration-200 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Submitting...' : 'Connect with Us'}
        </button>
      </div>
    </form>
  );
}