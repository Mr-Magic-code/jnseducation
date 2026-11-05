import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="relative w-full pt-8 pb-16 lg:pt-12 lg:pb-24 lg:h-[60vh] overflow-hidden bg-transparent flex items-center justify-center"
    >
      {/* Hero background image — high priority for LCP */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/pages-banner/hero-banner.webp"
        alt="JnS-Education-Hero-Image"
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover object-right sm:object-center"
      />
      <div className="absolute inset-0 bg-slate-200/50 sm:bg-slate-200/30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-transparent">

        {/* 1. Main Hero Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center justify-center">

          {/* Left Column - Text Content & CTAs */}
          <div className="lg:col-span-6 space-y-6 z-10 text-center lg:text-left">
            <h1 className="text-[42px] leading-[44px] font-bold text-slate-900 tracking-tight text-center sm:text-[60px] sm:leading-[72px] sm:text-left lg:whitespace-nowrap">
              Home of Study Abroad
            </h1>

            <p className="text-lg sm:text-xl font-bold text-slate-800">
              Leading Education Consultant &amp; IELTS, PTE Test Centers
            </p>

            <p className="text-base sm:text-lg text-slate-600 font-normal max-w-xl mx-auto lg:mx-0">
              Open the Door to Your Study Abroad Dreams with JnS Education
            </p>

            {/* Action Button */}
            <div className="pt-2 flex justify-center lg:justify-start">
              <Link
                href="/middleeast/get-free-consultation"
                className="w-full sm:w-auto bg-[#0071f6] text-white font-semibold text-base px-7 py-3.5 rounded-xl transition-all shadow-md hover:bg-[#D4E3F4] hover:text-[#0071f6] text-center"
              >
                Get Free Consultation
              </Link>
            </div>
          </div>

          {/* Right Column - Decorative accent */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="absolute -z-10 w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-blue-600/10 blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

      </div>
    </section>
  );
}