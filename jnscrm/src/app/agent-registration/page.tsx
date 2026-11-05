import AgentRegisterForm from '@/components/GeneralFormsComponents/AgentRegisterForm';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Registration | JnS Education',
  description: 'Join our Agent team and earn rewards.',
};

export default function AgentRegistrationPage() {
  return (
    <>
      <PageHero
        title="Agent Registration"
        bgImage="/images/events/events-banner.webp"
      />
      <AgentRegisterForm />
    </>
  );
}
