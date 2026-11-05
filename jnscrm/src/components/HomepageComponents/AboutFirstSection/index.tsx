export default function AboutFirstSection() {
    return (
        <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 text-center text-gray-600">
            <div className="max-w-7xl mx-auto">

                {/* Main Heading */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0b1a30] mb-6">
                    About Us
                </h2>

                {/* Descriptive Paragraphs */}
                <div className="max-w-4xl mx-auto space-y-4 text-base sm:text-lg text-gray-600 mb-10 leading-relaxed">
                    <p>
                        JnS Education has been a trusted name in the study abroad industry, helping thousands of students from Kuwait, Dubai, Qatar, Bahrain, Saudi Arabia, and Pakistan achieve their study abroad dreams. Partnered with over 170 top universities worldwide, providing personalized guidance and support to students throughout the entire application and admission process.
                    </p>
                    <p>
                        Our dedication goes beyond just university placements. We are also an official test center for IELTS, Pearson PTE and GMAT, delivering reliable testing services to students preparing for their international education journey. At JnS Education, we are committed to helping students unlock their potential and secure a brighter future by placing them into world-class universities.
                    </p>
                </div>

            </div>
        </section>
    );
}
