import Image from "next/image";
import Link from "next/link";

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