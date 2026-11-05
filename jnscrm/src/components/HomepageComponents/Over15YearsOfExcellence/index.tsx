
import Image from 'next/image';

const partners = [
  { name: 'University of Liverpool', url: 'images/partner-universities-logos/University-of-Liverpool.webp' },
  { name: 'University of Sussex', url: 'images/partner-universities-logos/University-of-Sussex.webp' },
  { name: 'University of Waikato', url: 'images/partner-universities-logos/University-of-Waikato.webp' },
  { name: 'University of Windsor', url: 'images/partner-universities-logos/University-of-Windsor.webp' },
  { name: 'University of Wollongong', url: 'images/partner-universities-logos/University-of-Wollongong.webp' },
  { name: 'Western Sydney University', url: 'images/partner-universities-logos/Western-Sydney-University.webp' },
  { name: 'Asia Pacific University', url: 'images/partner-universities-logos/Asia-Pacific-University.webp' },
  { name: 'Bond University', url: 'images/partner-universities-logos/Bond-University.webp' },
  { name: 'Brunel University London', url: 'images/partner-universities-logos/Brunel-University-London.webp' },
  { name: 'Manchester Metropolitan University', url: 'images/partner-universities-logos/Manchester-Metropolitan-University.webp' },
  { name: 'Swinburne University', url: 'images/partner-universities-logos/Swinburne-University.webp' },
  { name: 'University of Birmingham', url: 'images/partner-universities-logos/University-of-Birmingham.webp' },
];

export default function YearsOfExcellence() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 text-center text-gray-600">
      <div className="max-w-7xl mx-auto">

        {/* Main Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0b1a30] mb-6">
          Over 15 Years of Excellence
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

        {/* Center Logo */}
        <div className="my-8 flex justify-center">
          <div className="relative w-44 h-16">
            <Image
              src="/images/Icons/jns-education-logo.svg"
              alt="JnS Education Logo"
              width={160}
              height={60}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Divider Heading */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm sm:text-base font-semibold text-gray-700">
              We&apos;re proud to work with our preferred partners
            </span>
          </div>
        </div>

        {/* Infinite Carousel Slider */}
        <div className="overflow-hidden relative w-full py-6 group">
          <div className="flex w-max animate-infinite-scroll group-hover:[animation-play-state:paused]">
            {/* Render partners list twice to create a seamless infinite loop */}
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="w-[calc(100vw/2)] sm:w-[calc(100vw/6)] max-w-[160px] flex items-center justify-center px-4 flex-shrink-0"
              >
                <div className="relative w-full h-12">
                <Image
                  src={partner.url}
                  alt={partner.name}
                  fill
                  className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition duration-300"
                  sizes="64px"
                />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
