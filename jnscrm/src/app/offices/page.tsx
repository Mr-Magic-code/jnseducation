import GlobalOffices from '@/components/GlobalOffices/page';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'JnS Education | Contact Us ',
  description: 'Get in touch with our team in the Middle East for any inquiries or support.',
};
export default function ContactUsPage() {
    return (
        <>
        <PageHero
        title="Contact Us"
        bgImage="/images/events/events-banner.webp"
      />
      <GlobalOffices />
        </>
    )
}