import Link from "next/link";
import { GraduationCap, ClipboardCheck, BookOpen, ArrowRight } from "lucide-react";

const featureCards = [
  {
    title: "Study Abroad",
    description:
      "Comprehensive counseling, university applications, and student visa guidance for top global destinations.",
    href: "/study-destinations",
    icon: GraduationCap,
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    title: "Test Centers",
    description:
      "Official test centre for Pearson PTE and IELTS. Book your exam seat and view required score benchmarks.",
    href: "/test-centers",
    icon: ClipboardCheck,
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
  },
  {
    title: "Learn English",
    description:
      "Enhance your English language skills through our specialized preparation courses for university admissions.",
    href: "/test-centers/english-prep",
    icon: BookOpen,
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
];

export default function SecondSection() {
  return (
    <section className="relative w-full bg-[#f8fafc] pt-8 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. Feature Cards Section Below Hero */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Colored Icon Badge */}
                  <div
                    className={`w-14 h-14 rounded-full ${card.bgColor} ${card.textColor} flex items-center justify-center mb-6 transition-transform group-hover:scale-105`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h4>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                <Link
                  href={card.href}
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>Explore Options</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}