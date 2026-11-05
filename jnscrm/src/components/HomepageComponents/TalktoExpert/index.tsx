'use client';
import Image from 'next/image';
import GFCForm from '@/components/HomepageComponents/GFCForm';
export default function TalkToExpert() {
  return (
    <section className="bg-gray-50 border-t border-b border-gray-100 py-[50px] w-full">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 w-full">
      
                {/* Left Column: Image */}
                <div className="w-full lg:w-1/2 flex justify-center">
                  <Image
                    src="/images/talk-to-an-expert.webp"
                    alt="Talk to an Expert"
                    width={600}
                    height={600}
                    className="max-w-full h-auto object-contain"
                  />
                </div>
      
                {/* Right Column: Consultation Form */}
                <div className="w-full lg:w-1/2">
                  <h2 className="text-black mb-[30px]">
                    Talk to an <span className="text-mustard">Expert</span>
                  </h2>
                  <GFCForm />
                </div>
      
              </div>
            </div>
    </section>
  );
}
