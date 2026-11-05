import Image from "next/image";
import Link from "next/link";
// Custom SVG Icons
function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}
const aboutLinks = [
  { name: "About JnS", href: "/about-us" },
  { name: "Careers", href: "/careers" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Site Map", href: "/sitemap" },
  { name: "Complaints", href: "/jns-support" },
];

const exploreLinks = [
  { name: "Partner Institutions", href: "/partner-institutions" },
  { name: "Test Centers", href: "/test-centers" },
  { name: "FAQs", href: "/faqs" },
  { name: "Events", href: "/events" },
  { name: "Recruitment Partners", href: "/recruitment-partners" },
];

const officeColumn1 = [
  { name: "Dubai, UAE", href: "/offices/dubai-uae" },
  { name: "Riyadh, KSA", href: "/offices/riyadh-saudia" },
  { name: "Doha, Qatar", href: "/offices/doha-qatar" },
  { name: "Seef, Bahrain", href: "/offices/manama-bahrain" },
  { name: "Salmiya, Kuwait", href: "/offices/salmiya-kuwait" },
];

const officeColumn2 = [
  { name: "Multan, Pakistan", href: "/offices/multan-pakistan" },
  { name: "Islamabad, Pakistan", href: "/offices/islamabad-pakistan" },
  { name: "Faisalabad, Pakistan", href: "/offices/faislabad-pakistan" },
  { name: "Lahore , Pakistan", href: "/offices/lahore-pakistan" },
  { name: "Karachi, Pakistan", href: "/offices/karachi-pakistan" },
];

export default function Footer() {
  return (
    <footer suppressHydrationWarning className="w-full bg-[#f4f7f9] text-slate-800 pt-12 pb-6 px-4 sm:px-6 lg:px-8 border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto space-y-10 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-12">

        {/* 1. Brand Logo & Contact (Centered on Mobile, Left-aligned on Desktop) */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-span-3 space-y-3">
          <Link href="/" className="inline-block">
            <Image
              src="/images/Icons/Jns-Education-Logo.svg"
              alt="JnS Education Logo"
              width={180}
              height={60}
              priority
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* Slogan with decorative yellow underline curve */}
          <div className="relative inline-block">
            <p className="text-base font-medium text-slate-900 tracking-tight">
              Home of Study Abroad
            </p>
          </div>

          <div className="pt-2">
            <a
              href="mailto:support@jnsedu.com"
              className="text-[14px] leading-[28px] font-medium text-black hover:text-black transition-colors"
            >
              Email: support@jnsedu.com
            </a>
            <div className="flex items-center gap-2 pt-2">
              <Link
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-[#0071f6] text-white flex items-center justify-center hover:bg-[#005ecb] transition-colors"
              >
                <FacebookIcon className="w-5 h-5 fill-current" />
              </Link>
              <Link
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-[#0071f6] text-white flex items-center justify-center hover:bg-[#005ecb] transition-colors"
              >
                <InstagramIcon className="w-5 h-5" />
              </Link>

              <Link
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-[#0071f6] text-white flex items-center justify-center hover:bg-[#005ecb] transition-colors"
              >
                <LinkedinIcon className="w-5 h-5 fill-current" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Navigation Section (2 Columns side-by-side on Mobile) */}
        <div className="grid grid-cols-2 gap-8 lg:col-span-4">
          {/* About Column */}
          <div className="space-y-3">
            <h6 className="small-heading">About</h6>
            <ul className="space-y-2.5 text-sm font-medium text-slate-700">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[14px] leading-[28px] font-medium text-black hover:text-black transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Column */}
          <div className="space-y-3">
            <h6 className="small-heading">Explore</h6>
            <ul className="space-y-2.5 text-sm font-medium text-slate-700">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[14px] leading-[28px] font-medium text-black hover:text-black transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. Connect with our Offices Section (Heading with 2 columns below) */}
        <div className="space-y-3 lg:col-span-5">
          <h6 className="small-heading">Connect with our Offices</h6>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm font-medium text-slate-700">
            <ul className="space-y-2.5">
              {officeColumn1.map((office) => (
                <li key={office.name}>
                  <Link href={office.href} className="text-[14px] leading-[28px] font-medium text-black hover:text-black transition-colors">
                    {office.name}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="space-y-2.5">
              {officeColumn2.map((office) => (
                <li key={office.name}>
                  <Link href={office.href} className="text-[14px] leading-[28px] font-medium text-black hover:text-black transition-colors">
                    {office.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
        © 2009 - {new Date().getFullYear()} JnS Education. All rights reserved.
      </div>

    </footer>
  );
}