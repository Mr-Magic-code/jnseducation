import React from 'react';
import Link from 'next/link';

interface Branch {
    name: string;
    href: string;
    isPrimary?: boolean;
}

const branches: Branch[] = [
    { name: 'JnS Education Qatar', href: '/qatar', isPrimary: true },
    { name: 'JnS Education Kuwait', href: '/kuwait', isPrimary: true },
    { name: 'JnS Education Bahrain', href: '/bahrain', isPrimary: true },
    { name: 'JnS Education Riyadh', href: '/riyadh', isPrimary: true },
    { name: 'JnS Education UAE', href: '/uae', isPrimary: true },
    { name: 'Pakistan Branches', href: '/pakistan', isPrimary: false },
];

export default function GulfBranches() {
    return (
        <section className="bg-[#edf2f6] py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-[#0a192f] text-center mb-12">
                    JnS Education Across the Gulf
                </h2>

                {/* grid-cols-2 for mobile (3 rows x 2 cols), switching to grid-cols-3 on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-12 gap-y-6 sm:gap-y-8">
                    {branches.map((branch, index) => (
                        <div
                            key={index}
                            className="border-b border-gray-500/70 pb-3 text-center"
                        >
                            <Link
                                href={branch.href}
                                className={`text-sm sm:text-base font-medium transition-colors hover:opacity-80 ${branch.isPrimary ? 'text-blue-600' : 'text-gray-900'
                                    }`}
                            >
                                {branch.name}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}