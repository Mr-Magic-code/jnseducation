import Link from "next/link";
import Image from "next/image";

const studyPrograms = [
  { name: "Foundation", href: "/study-levels/foundation" },
  { name: "Undergraduate", href: "/study-levels/undergraduate" },
  { name: "Postgraduate", href: "/study-levels/postgraduate" },
  { name: "Diploma", href: "/study-levels/diploma" },
  { name: "Pre Master", href: "/study-levels/pre-master" },
  { name: "English Language Courses", href: "/study-levels/english-language" },
];

export default function StudyJourneySection() {
  return (
    <section className="relative w-full bg-primary text-white py-14 lg:py-20 overflow-hidden">

      {/* Decorative Circular Graphic Elements in Background */}
      <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 pointer-events-none opacity-20 md:block">
        <Image 
          src="/images/icons/jns-logoshape-white.svg" 
          alt="JnS Education ICON" 
          width={600}
          height={600}
          className="w-[600px] h-[600px] object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Left Column: Heading and Program Pills */}
          <div className="space-y-6 max-w-3xl text-center lg:text-left">
            <h2 className=" text-3xl sm:text-[37px] lg:text-[37px] font-semibold tracking-tight leading-[50px]">
              Begin your study abroad journey <br className="hidden sm:inline" />
              with <span className="text-[#ffcc00]">JNS Education</span>
            </h2>

            {/* Pill Buttons Container */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {studyPrograms.map((program) => (
                <Link
                  key={program.name}
                  href={program.href}
                  className="px-5 py-2.5 rounded-full border border-white/60 bg-white/10 hover:bg-white hover:text-[#0071f6] text-sm font-semibold transition-all duration-200 backdrop-blur-xs"
                >
                  {program.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: CTA Button */}
          <div className="shrink-0">
            <Link
              href="/get-free-consultation"
              className="inline-block bg-white text-slate-900 hover:bg-slate-100 font-bold text-base px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Free Consultation
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}