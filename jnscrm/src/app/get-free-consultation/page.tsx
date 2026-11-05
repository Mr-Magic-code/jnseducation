import TalkToExpert from '@/components/HomepageComponents/TalktoExpert';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Get Free Consultation |JnS Education',
  description: 'Get in touch with our team for any inquiries or support.',
};
export default function GetFreeConsultationPage() {
    return (
        <>
        <PageHero
        title="Get Free Consultation"
        bgImage="/images/events/events-banner.webp"
      />
      <TalkToExpert />
        </>
    )
}