'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

export interface BreadcrumbProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
}

const segmentMap: Record<string, string> = {
  'middleeast': 'Middle East',
  'pakistan': 'Pakistan',
  'contact-us': 'Contact Us',
  'about-us': 'About Us',
  'get-free-consultation': 'Get Free Consultation',
  'pte-test-registration': 'PTE Test Registration',
  'agent-registration': 'Agent Registration',
  'events': 'Events',
  'blogs': 'Blogs',
};

function formatSegment(segment: string): string {
  if (segmentMap[segment.toLowerCase()]) {
    return segmentMap[segment.toLowerCase()];
  }
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Breadcrumb({ breadcrumbs, title = '' }: BreadcrumbProps) {
  const pathname = usePathname();

  // Generate items automatically if breadcrumbs are not explicitly passed
  let items: BreadcrumbItem[] = [];

  if (breadcrumbs && breadcrumbs.length > 0) {
    items = breadcrumbs;
  } else {
    items.push({ name: 'Home', href: '/' });
    
    if (pathname && pathname !== '/') {
      const pathSegments = pathname.split('/').filter(Boolean);
      let currentHref = '';

      pathSegments.forEach((segment, index) => {
        currentHref += `/${segment}`;
        const isLast = index === pathSegments.length - 1;
        
        items.push({
          name: isLast && title ? title : formatSegment(segment),
          href: isLast ? undefined : currentHref,
        });
      });
    }
  }

  return (
    <div className="w-full bg-gray-50 border-b border-gray-100 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-3 text-xs sm:text-sm text-blue-600 font-medium truncate flex items-center flex-wrap gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && <span className="mx-2 text-gray-400">|</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span className={isLast ? "text-gray-500 font-normal" : ""}>
                  {item.name}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
