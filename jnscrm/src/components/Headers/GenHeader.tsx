'use client';

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from 'lucide-react';
const navigation = [
  {
    title: "Study Levels",
    href: "/study-levels",
    items: [
      { name: "Foundation", href: "/study-levels/foundation" },
      { name: "Undergraduate", href: "/study-levels/undergraduate" },
      { name: "Postgraduate", href: "/study-levels/postgraduate" },
      { name: "Pre Master", href: "/study-levels/pre-master" },
    ],
  },
  {
    title: "Study Destinations",
    href: "/study-destinations",
    items: [
      { name: "United Kingdom", href: "/study-destinations/uk" },
      { name: "United States", href: "/study-destinations/usa" },
      { name: "Canada", href: "/study-destinations/canada" },
      { name: "Dubai (UAE)", href: "/study-destinations/dubai" },
      { name: "New Zealand", href: "/study-destinations/new-zealand" },
      { name: "Malaysia", href: "/study-destinations/malaysia" },
    ],
  },
  {
    title: "Test Centers",
    href: "/test-centers",
    items: [
      { name: "IELTS Test Center", href: "/test-centers/ielts" },
      { name: "PTE Academic Center", href: "/test-centers/pte" },
      { name: "English Preparation", href: "/test-centers/english-prep" },
    ],
  },
  {
    title: "How do I apply?",
    href: "/how-to-apply",
    items: [
      { name: "Application Steps", href: "/how-to-apply/steps" },
      { name: "Eligibility Criteria", href: "/how-to-apply/eligibility" },
      { name: "Student Visa Support", href: "/how-to-apply/visa" },
    ],
  },
  {
    title: "Resource Hub",
    href: "/resource-hub",
    items: [
      { name: "Articles & News", href: "/blog" },
      { name: "Upcoming Events", href: "/events" },
      { name: "FAQs", href: "/faqs" },
    ],
  },
];

const topNavLinks = [
  { name: "About", href: "/about-us" },
  { name: "Events", href: "/events" },
  { name: "Articles", href: "/blog" },
  { name: "Institution", href: "/institution" },
  { name: "Offices", href: "/offices" },
  { name: "Login", href: "/protection/login" },
];

export default function GenHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);

  const toggleMobileDropdown = (title: string) => {
    setActiveMobileDropdown(activeMobileDropdown === title ? null : title);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
      {/* 1. Top Utility Navigation Bar (Desktop Only) */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-100 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <div className="text-black font-medium">
            Welcome to JnS Education
          </div>

          <div className="flex items-center space-x-6">
            {topNavLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-black hover:text-primary transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Header / Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex flex-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/Icons/Jns-Education-Logo.svg" alt="JnS Education" className="h-12 w-auto" />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navigation.map((nav) => (
            <div key={nav.title} className="relative group py-6">
              <Link
                href={nav.href}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-black transition-colors"
              >
                {nav.title}
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary transition-transform group-hover:rotate-180 duration-200" />
              </Link>

              {/* Hover Dropdown Menu */}
              <div className="absolute left-0 top-full hidden group-hover:block w-56 pt-1">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 space-y-1">
                  {nav.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-hover-clr hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/protection/admin"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-xs"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-100 focus:outline-hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3">
          {/* Main Accordion Links */}
          <div className="space-y-1">
            {navigation.map((nav) => (
              <div key={nav.title} className="border-b border-gray-50 pb-1">
                <button
                  onClick={() => toggleMobileDropdown(nav.title)}
                  className="w-full flex items-center justify-between py-2.5 text-base font-semibold text-gray-800 hover:text-blue-600"
                >
                  <span>{nav.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${activeMobileDropdown === nav.title ? "rotate-180 text-primary" : "text-gray-400"
                      }`}
                  />
                </button>

                {/* Submenu Accordion Panel */}
                {activeMobileDropdown === nav.title && (
                  <div className="pl-4 pb-2 space-y-1 bg-gray-50 rounded-lg my-1 py-2">
                    {nav.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Top Utility Links on Mobile */}
          <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs font-medium text-gray-600">
            {topNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Sign Up CTA */}
          <div className="pt-3">
            <Link
              href="/protection/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg text-sm transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}