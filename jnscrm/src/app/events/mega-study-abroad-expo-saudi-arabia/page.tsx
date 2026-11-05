import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import SaudiExpoForm from '@/components/ExpoForms/SaudiExpoForm';
export const metadata: Metadata = {
  title: 'Mega Study Abroad Expo Saudi Arabia | JnS Education',
  description: 'Register for the Mega Study Abroad Expo in Saudi Arabia. Meet representatives from top global universities.',
};

export default function StudyAbroadExpoSaudiArabiaPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PageHero
              title="Mega Study Abroad Expo Saudi Arabia"
              bgImage="/images/events/Expo-Banner/mega-study-abroad-expo-saudi-arabia.webp"
            />
      <div className="py-10">
        <SaudiExpoForm />
      </div>
    </main>
  );
}
