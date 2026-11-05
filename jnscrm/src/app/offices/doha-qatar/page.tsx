'use client'
import PageHero from '@/components/PageHero';
import GFC from '@/components/GeneralFormsComponents/GFC';
import PTEForm from '@/components/GeneralFormsComponents/PTEForm/page';
import JnsMEBranches from '@/components/JnsMEBranches/page';
import Over15YearsOfExcellence from '@/components/HomepageComponents/Over15YearsOfExcellence';
import { useState } from 'react';
import {
    MapPin,
    Phone,
    MessageSquare,
    Mail,
    Clock,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function EducationConsultantQatar() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <main className="min-h-screen bg-gray-50 text-gray-800 font-sans">

            {/* ---------------- HERO SECTION ---------------- */}
            <PageHero
                title="Professional Education Consultant in Qatar"
                bgImage="/images/education-consultant/education-consultants-in-qatar.webp"
            />
            {/* ---------------- BRANCH DETAILS SECTION ---------------- */}
            <section className="py-12 md:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Qatar Branch</h2>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Info Cards */}
                        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">

                            {/* Address Card */}
                            <div className="sm:col-span-2 bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-start gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg text-xl">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h6 className='text-black'>Office location</h6>
                                    <p className="text-gray-600 mt-1">Nordic Tower, 11th Floor, Office 112, Block 428, Street 2802, Seef, Qatar</p>
                                </div>
                            </div>

                            {/* Phone Card */}
                            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg text-xl">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h6 className='text-black'>Phone</h6>
                                    <a href="tel:+97317001812" className="text-gray-600 mt-1 hover:text-blue-600">
                                        +973 17001812
                                    </a>
                                </div>
                            </div>

                            {/* WhatsApp Card */}
                            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg text-xl">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h6 className='text-black'>WhatsApp</h6>
                                    <a href="https://wa.me/97334374900" target="_blank" rel="noopener noreferrer" className="text-gray-600 mt-1 hover:text-green-600">
                                        +973 34374900
                                    </a>
                                </div>
                            </div>

                            {/* Email Card */}
                            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg text-xl">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h6 className='text-black'>Email</h6>
                                    <a href="mailto:admissions.bh@jnsedu.com" className="text-gray-600 mt-1 hover:text-blue-600">
                                        admissions.bh@jnsedu.com
                                    </a>
                                </div>
                            </div>

                            {/* Opening Hours Card */}
                            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-lg text-xl">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h6 className='text-black'>Opening hours</h6>
                                    <p className="text-sm text-gray-600 mt-2">Saturday 10:00 AM - 4:00PM</p>
                                    <p className="text-sm text-gray-600 mt-2">Sunday to Thursday: 10:00 AM - 6:00 PM</p>
                                </div>
                            </div>

                        </div>

                        {/* Embedded Google Map */}
                        <div className="h-full min-h-[300px] bg-gray-200 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <iframe
                                title="JnS Education Qatar Map"
                                src="https://maps.google.com/maps?q=JnS%20Education%20Qatar%20Nordic%20Tower&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>
            {/* ---------------- JnS Office Branches ---------------- */}
            <JnsMEBranches />

            {/* ---------------- MAIN CONTENT & FEATURES ---------------- */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left column: Text Content */}
                        <div className="lg:col-span-2 prose prose-lg max-w-none text-gray-700">
                            {/* best-heading is the CSS class that has CSS properties in global.css file, mb-3 is margin bottom with 3 */}
                            <h1 className="best-heading text-black mb-3">
                                JnS Education: Your Study Abroad Consultant in Qatar & Seef
                            </h1>
                            <p className="font mb-4">
                                There’s a moment many students in Qatar quietly experience but rarely talk about  that feeling of sitting in front of a laptop, trying to choose a country or university, and suddenly realizing how overwhelming the whole thing really is. One page leads to another, deadlines blur together, scholarships feel confusing, and before you know it… you’re more unsure than when you started.
                            </p>
                            <p className="font mb-4">
                                If that sounds familiar, take a breath.You’re not the only one.At JnS Education, we’ve guided thousands of students through the same uncertainty. And over the years, I’ve learned something simple: most students don’t just need information, they need clarity, reassurance, real guidance, and someone who genuinely understands what’s at stake.
                            </p>
                            <p className="font mb-4">
                                That’s what makes us a trusted study abroad consultant in Qatar and especially in areas like Seef, where students are eager to explore international opportunities but unsure how to start
                            </p>

                            <h2 className="best-heading text-black mb-3">
                                Why Students in Qatar Choose JnS Education
                            </h2>
                            <p className="mb-4">
                                When someone walks into our office or messages us online, it’s rarely about “Which university should I apply to?”
                                The real questions sound more like:
                            </p>
                            <p className="mb-4">
                                “Will this decision shape my future the right way?”
                                <br />“What if I make the wrong choice?”
                                <br />“How do I know which country is right for me?”
                            </p>
                            <p className="mb-4">
                                These are big questions  and they deserve answers that go beyond checklists or generic guidance.
                            </p>
                            <p className="mb-4">
                                As one of the top study abroad consultants in Qatar, we take time to understand your personality, goals, strengths, limitations, dreams even the fears you don’t say out loud.
                                And once we understand you, everything becomes easier.
                            </p>
                            <h2 className="best-heading text-black mb-3">
                                We Listen First, Advise Second
                            </h2>
                            <p className="mb-4">
                                You’ll feel the difference from the first conversation. We don’t rush. We don’t overwhelm you with options. We don’t “sell” countries or courses.
                            </p>
                            <p className="mb-4">
                                We simply sit down, listen to your goals, and help you shape a journey that feels right.
                            </p>
                            <p className="mb-4">
                                That’s why so many families consider us the trusted education consultants in Qatar because we offer clarity, not confusion.
                            </p>
                            <h2 className="best-heading text-black mb-3">
                                Guidance From Seef to Any Destination You Dream Of
                            </h2>
                            <p className="mb-4">
                                Whether you’re living in Seef, Manama, or anywhere else in Qatar, you get full support from the moment you reach out to the moment you land abroad. As a dedicated study abroad consultant in Seef, we guide you through:
                            </p>
                            <ul className="list-disc list-inside mb-4">
                                <li>Choosing the right country</li>
                                <li>Shortlisting universities that genuinely match your profile</li>
                                <li>Preparing documents and recommendations</li>
                                <li>Perfecting your applications</li>
                                <li>Exploring scholarships and financial options</li>
                                <li>Visa processing and interview prep</li>
                                <li>Pre-departure help, accommodation advice, and more</li>
                            </ul>
                            <p className="mb-4">
                                But “studying abroad” is just a phrase. The real journey involves choosing the right country, the right city, the right university, and the right course. We help you map every step.
                            </p>
                            <h2 className="best-heading text-black mb-3">
                                Why JnS Education is the Best Study Abroad Consultant in Qatar
                            </h2>
                            <p className="mb-4">
                                With over 20 years of international student support, JnS Education Qatar offers:
                            </p>
                            <ul className="list-disc list-inside mb-4">
                                <li>UK Applications UCAS assistance, SOP reviews, CAS, and visa help</li>
                                <li>Canada Guidance SDS, GIC, application filing, and follow-up</li>
                                <li>USA & Australia Support I-20, SEVIS, DS-160, and visa interview coaching</li>
                                <li>Support for Europe & GCC Study in Ireland, Germany, UAE, and Turkey</li>
                                <li>Exploring scholarships and financial options</li>
                                <li>Profile Enhancement SOP, CV, guidance</li>
                                <li>Help with Top-Up & Foundation Routes – For ADP, O-level & A-level students</li>
                            </ul>
                            <p className="mb-4">
                                Speak to an Expert JnS Counsellor now & find the best-fit destination for your ambitions from our Seef, Qatar office.
                            </p>
                            <h2 className="best-heading text-black mb-3">
                                What Makes JnS Education Stand Out in Qatar?
                            </h2>

                            <h6 className="text-black mb-3">
                                1. Real Experience You Can Trust
                            </h6>
                            <p className="mb-4">
                                Students come to us because they want guidance from people who actually know how global admissions work.
                                We’ve spent years understanding the patterns of universities in the UK, USA, Canada, Australia, and beyond.
                            </p>
                            <p className="mb-4">
                                That experience is what places us among the best education consultants in Seef and Qatar overall.
                            </p>
                            <h6 className="text-black mb-3">
                                2. Honest, Straightforward Advice
                            </h6>
                            <p className="mb-4">
                                No sugarcoating. No misleading promises.
                            </p>
                            <p className="mb-4">
                                Just clear, honest advice based on what will truly help you.
                            </p>
                            <p className="mb-4">
                                Parents appreciate that. Students appreciate that even more.
                            </p>
                            <h6 className="text-black mb-3">
                                3. Quality Guidance That Still Fits Your Budget
                            </h6>
                            <p className="mb-4">
                                If you’re looking for an affordable education consultant in Qatar without compromising on expertise, you’ll feel right at home with JnS Education.
                                We believe good guidance shouldn’t be out of reach for any student.
                            </p>
                        </div>

                        {/* Right column: PTE Form */}
                        <div className="lg:col-span-1 lg:sticky lg:top-24">
                            <PTEForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------- FAQs SECTION ---------------- */}
            <section className="bg-primary text-white py-16 px-4 md:px-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className="best-heading mb-10 text-white">
                        Frequently Asked Questions (FAQs) – Studying in Qatar
                    </h2>

                    <div className="space-y-0">
                        {faqData.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div key={index} className="border-b border-white/30 py-5">
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : index)}
                                        className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer focus:outline-hidden"
                                    >
                                        <span
                                            className={`text-lg sm:text-xl font-bold transition-colors ${isOpen ? 'text-[#ffcc00]' : 'text-white group-hover:text-blue-100'
                                                }`}
                                        >
                                            {faq.question}
                                        </span>
                                        <span className="text-white text-xl flex-shrink-0">
                                            {isOpen ? <ChevronUp className="w-6 h-6 text-[#ffcc00]" /> : <ChevronDown className="w-6 h-6" />}
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <div className="mt-4 text-white/90 text-base sm:text-lg leading-relaxed max-w-4xl animate-in fade-in duration-200">
                                            <p>{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ---------------- FAQs SECTION  ENDs ---------------- */}
            <Over15YearsOfExcellence />
            <GFC />
        </main>
    );
}
const faqData = [
    {
        question: "1. Why JnS Education, Qatar? Why should I choose it to assist me in studying overseas?",
        answer: "Students address us with one sole purpose, and that is because we really do listen. When we see a student, we treat them as though they have another dream, story and a problem. There are no existing templates. No haste suggestions. We sit with you, and we listen to what you would have to have in the future, and we provide you with the same attention that we would desire to have in our family. That is why a lot of students have trust in JnS Education: the tips are real, the experience is real, and the entire process is easier and not as stressful."
    },
    {
        question: "2. Do study abroad consultations in Seef occur with you as well?",
        answer: " Yes, we do.  Students are able to visit our Seef office and discuss their plans in a convenient atmosphere.  Our team in Seef is never too busy to assist you, be it regarding programmes, or you are in doubt about the documents, or even you need to go through things. They will do it in a non-hurried manner, patiently and without coercion."
    },
    {
        question: "3. Who will accept my applications with JnS Education?",
        answer: "There is a plethora of contacts with universities all over the world.  We can assist you in making the right choices on the destination of your dreams which may be the UK, the US, Canada, Australia, Europe, Malaysia, Turkey or even in another country.  It is not merely about where you wish to go but also where you will prosper."
    },
    {
        question: "4. Is the cost of the consultation reasonable?",
        answer: "Yes, and we are quite open about it.  It has always occurred to us that good advice is not difficult to find.  Our prices are reasonable, simple to interpret and do not have a bunch of those irritating hidden charges that most students are concerned about.  That is all, you get what you pay."
    },
    {
        question: "5. Do you mind assisting me with the college choice?",
        answer: "Of course.  We are very serious with our decision of the university.  We do not simply present you with some list. We examine your educational background, your finances, your character and your vision of the future. Then we suggest the colleges which are well-matched to you, not only the famous ones."
    },
    {
        question: "6. Do you assist students to get scholarships?",
        answer: "Yes, for sure.  Many students do not even know how many scholarships they can receive.  We assist you to locate scholarships on the foundation of merit, place, or even on a particular course.  It is not merely about saving money, it is also about discovering new opportunities."
    }
];