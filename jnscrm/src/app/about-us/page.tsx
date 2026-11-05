export default function AboutUsPage() {
    return (
        <>
        <PageHero
        title="About Us"
        bgImage="/images/events/events-banner.webp"
      />
      <AboutFirstSection />
      <ThirdSection />
        </>
    )
}
import AboutFirstSection from '@/components/HomepageComponents/AboutFirstSection';
import ThirdSection from '@/components/HomepageComponents/ThirdSection';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'JnS Education | About Us | Middle East',
  description: 'Learn more about our company and team in the Middle East.',
};