import Link from "next/link";
import Image from "next/image";

const destinations = [
  {
    id: 1,
    image: '/images/study-destinations/uk-study-destination.webp',
    land: '/get-free-consultation'
  },
  {
    id: 2,
    image: '/images/study-destinations/usa-study-destination.webp',
    land: '/study-in-usa' // Hamesha koi na koi link zaroor dein ya '#' laga dein
  },
  {
    id: 3,
    image: '/images/study-destinations/canada-study-destination.webp',
    land: '/study-in-canada'
  },
  {
    id: 4,
    image: '/images/study-destinations/dubai-study-destination.webp',
    land: '/study-in-dubai'
  },
  {
    id: 5,
    image: '/images/study-destinations/new-zealand-study-destination.webp',
    land: '/study-in-new-zealand'
  },
  {
    id: 6,
    image: '/images/study-destinations/malaysia-study-destination.webp',
    land: '/study-in-malaysia'
  },
];

export default function StudyDestinations() {
  return (
    <section className="w-full py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="text-[30px] leading-[40px] sm:text-[46px] sm:leading-[56px] font-semibold text-slate-900 tracking-tight">
            Study Destinations
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Explore top universities and programs for your study abroad journey. Get expert advice on admissions, compliance, and student visas process.
          </p>
        </div>

        {/* 6 Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {destinations.map((dest) => (
            <div 
              key={dest.id} 
              className="relative aspect-[5/4] sm:aspect-[3/4] lg:aspect-[5/5] rounded-2xl overflow-hidden group cursor-pointer"
            >
              {/* Capital 'L' wala Link use karna hai aur href mein dest.land pass karna hai */}
              <Link href={dest.land || '#'}>
                <Image 
                  src={dest.image} 
                  alt="Study Destination" 
                  fill
                  className="w-full h-full object-contain transition-transform rounded-2xl duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </Link>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}