'use client';
import Breadcrumb from '../Breadcrumb';
import ShareModal from '../ShareModal';
interface PageHeroProps {
  title: string;
  bgImage: string;
  largeRightText?: string;
  smallRightText?: string;
}

export default function PageHero({
  title,
  bgImage,
}: PageHeroProps) {
  return (
    <>
      <section
        className="relative bg-cover bg-center bg-no-repeat py-12 md:py-16 text-white font-sans overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0), rgba(15, 23, 42, 0)), url(${bgImage})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[160px]">

            {/* Left Column: Blurred Content Card */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-6 md:p-8 rounded-2xl text-left max-w-lg shadow-xl">
              <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-white tracking-tight">
                {title}
              </p>
              {/* Share Button Trigger */}
              <div className="mt-6">
                <ShareModal title={title} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Breadcrumb />
    </>
  );
}
