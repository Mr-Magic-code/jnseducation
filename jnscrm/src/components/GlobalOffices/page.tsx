import React from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Global offices | JnS Education',
    description: 'Find your nearest JnS Education office across the Middle East, Pakistan, and UK. Discover our global offices and get in touch with our team.',
};

interface Office {
    city: string;
    country: string;
    flagUrl: string;
    tags: {
        label: string;
        variant: 'blue' | 'teal' | 'red' | 'yellow';
    }[];
    link: string;
}

const officesData: Office[] = [
    {
        city: 'Doha',
        country: 'Qatar',
        flagUrl: '/images/Icons/Qatar-Icon.svg',
        tags: [{ label: 'Study Abroad', variant: 'blue' }],
        link: '/offices/doha-qatar',
    },
    {
        city: 'Salmiya',
        country: 'Kuwait',
        flagUrl: '/images/Icons/Kuwait-Icon.svg',
        tags: [
            { label: 'Study Abroad', variant: 'blue' },
            { label: 'IELTS Center', variant: 'red' },
            { label: 'PTE Test Center', variant: 'teal' },
            { label: 'GMAT', variant: 'yellow' },
        ],
        link: '/offices/salmiya-kuwait',
    },
    {
        city: 'Seef',
        country: 'Bahrain',
        flagUrl: '/images/Icons/Bahrain-Icon.svg',
        tags: [
            { label: 'Study Abroad', variant: 'blue' },
            { label: 'PTE Test Center', variant: 'teal' },
            { label: 'GMAT', variant: 'yellow' },
        ],
        link: '/offices/manama-bahrain',
    },
    {
        city: 'Islamabad',
        country: 'Pakistan',
        flagUrl: '/images/Icons/Pakistan-Icon.svg',
        tags: [
            { label: 'Study Abroad', variant: 'blue' },
            { label: 'PTE Test Center', variant: 'teal' },
        ],
        link: '/offices/islamabad-pakistan',
    },
    {
        city: 'Karachi',
        country: 'Pakistan',
        flagUrl: '/images/Icons/Pakistan-Icon.svg',
        tags: [
            { label: 'Study Abroad', variant: 'blue' },
            { label: 'PTE Test Center', variant: 'teal' },
            { label: 'GMAT', variant: 'yellow' },
        ],
        link: '/offices/karachi-pakistan',
    },
    {
        city: 'Lahore',
        country: 'Gulberg',
        flagUrl: '/images/Icons/Pakistan-Icon.svg',
        tags: [
            { label: 'Study Abroad', variant: 'blue' },
            { label: 'PTE Test Center', variant: 'teal' },
            { label: 'GMAT', variant: 'yellow' },
        ],
        link: '/offices/lahore-pakistan',
    },
    {
        city: 'Lahore',
        country: 'DHA',
        flagUrl: '/images/Icons/Pakistan-Icon.svg',
        tags: [{ label: 'Study Abroad', variant: 'blue' }],
        link: '/offices/lahore-dha-office',
    },
    {
        city: 'Faisalabad',
        country: 'Pakistan',
        flagUrl: '/images/Icons/Pakistan-Icon.svg',
        tags: [{ label: 'Study Abroad', variant: 'blue' }],
        link: '/offices/faisalabad-pakistan',
    },
    {
        city: 'Multan',
        country: 'Pakistan',
        flagUrl: '/images/Icons/Pakistan-Icon.svg',
        tags: [{ label: 'Study Abroad', variant: 'blue' }],
        link: '/offices/multan-pakistan',
    },
    {
        city: 'Dubai',
        country: 'UAE',
        flagUrl: '/images/Icons/UAE-Icon.svg',
        tags: [
            { label: 'Study Abroad', variant: 'blue' },
            { label: 'IELTS Center', variant: 'red' },
            { label: 'PTE Test Center', variant: 'teal' },
            { label: 'GMAT', variant: 'yellow' },
        ],
        link: '/offices/dubai-uae',
    },
    {
        city: 'Riyadh',
        country: 'KSA',
        flagUrl: '/images/Icons/KSA-Icon.svg',
        tags: [
            { label: 'Study Abroad', variant: 'blue' },
            { label: 'IELTS Center', variant: 'red' },
            { label: 'PTE Test Center', variant: 'teal' },
            { label: 'GMAT', variant: 'yellow' },
        ],
        link: '/offices/riyadh-saudia',
    },
    {
        city: 'Surrey',
        country: 'UK',
        flagUrl: '/images/Icons/UK-Icon.svg',
        tags: [{ label: 'Study Abroad', variant: 'blue' }],
        link: '/offices/uk-office',
    },
];


const tagStyles = {
    blue: 'bg-[#dce9f9] text-[#2b7fff]',
    teal: 'bg-[#0080a7] text-white',
    red: 'bg-[#ff5252] text-white',
    yellow: 'bg-[#ffcc00] text-[#1a1a1a]',
};

export default function GlobalOffices() {
    return (
        <main className="min-h-screen bg-white font-sans">
            {/* Offices Section */}
            <section className="py-16 px-4 max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002b49] mb-3">
                        Our Global Offices
                    </h2>
                    <p className="text-gray-500 text-sm sm:text-base">
                        We have offices across the globe. Discover your local JnS office.
                    </p>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {officesData.map((office, idx) => (
                        <div
                            key={idx}
                            className="bg-[#eef2f5] rounded-2xl p-6 flex flex-col justify-between min-h-[200px]"
                        >
                            {/* Title & Tags Container */}
                            <div>
                                {/* Flag & Location Header */}
                                <div className="flex items-center gap-3 mb-5">
                                    <Image
                                        src={office.flagUrl}
                                        alt={`${office.country} Flag`}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                                    />
                                    <h6 className="text-lg font-semibold text-[#1a2b3c]">
                                        {office.city}, {office.country}
                                    </h6>
                                </div>

                                {/* Service Badges */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {office.tags.map((tag, tIdx) => (
                                        <span
                                            key={tIdx}
                                            className={`text-xs font-semibold px-3 py-1 rounded-full ${tagStyles[tag.variant]}`}
                                        >
                                            {tag.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom Arrow Button */}
                            <div className="flex justify-end mt-auto">
                                <a
                                    href={office.link}
                                    className="w-9 h-9 rounded-full bg-[#0088ff] hover:bg-[#0066cc] text-white flex items-center justify-center transition-colors shadow-sm"
                                    aria-label={`View ${office.city} office details`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

