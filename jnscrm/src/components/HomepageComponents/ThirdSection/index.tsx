import Link from "next/link";
import { UserCheck, GraduationCap, CalendarDays, Headphones } from "lucide-react";

const admissionSteps = [
  {
    title: "Check your Eligibility before applying",
    description: "Find out which country or university you are eligible to apply",
    icon: UserCheck,
    iconBg: "bg-amber-400/20",
    iconColor: "text-amber-500",
  },
  {
    title: "University Application Support",
    description: "Get qualified counselor advice on where to apply and how to apply for UG and PG programs",
    icon: GraduationCap,
    iconBg: "bg-teal-400/20",
    iconColor: "text-teal-500",
  },
  {
    title: "University Events and Exhibitions",
    description: "Discover the best universities and their entry requirements at JnS Study Abroad Events",
    icon: CalendarDays,
    iconBg: "bg-blue-400/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Book a free Counselling session",
    description: "Get access to a team of experienced study abroad counselors",
    icon: Headphones,
    iconBg: "bg-orange-400/20",
    iconColor: "text-orange-500",
  },
];

export default function AdmissionSection() {
  return (
    <section
      className="relative w-full py-16 lg:py-24 overflow-hidden bg-[#EDF2F5]"
    >
      {/* Section background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="images/pages-banner/section-bg.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Background set on section */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 lg:mb-16">
          <h2 className="text-[26px] leading-[34px] sm:text-[46px] sm:leading-[56px] font-semibold text-slate-900 tracking-tight">
            We help students get admitted into <br className="hidden sm:inline" />
            <span className="text-primary">Top Universities & Colleges</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-medium">
            We handle the entire admission process, from counseling to admission to visa
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {admissionSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="bg-white/90 backdrop-blur-xs rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  {/* Icon Badge */}
                  <div className={`w-12 h-12 rounded-full ${step.iconBg} ${step.iconColor} flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Card Title */}
                  <h6 className="text-black small-heading mb-3 leading-snug">
                    {step.title}
                  </h6>

                  {/* Card Description */}
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/middleeast/get-free-consultation"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Book a Free Consultation
          </Link>
        </div>

      </div>
    </section>
  );
}