import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import UAEExpoForm from '@/components/ExpoForms/UAEExpoForm';
export const metadata: Metadata = {
  title: 'Study Abroad Expo UAE | JnS Education',
  description: 'Register for the Study Abroad Expo in UAE. Meet representatives from top global universities.',
};

export default function StudyAbroadExpoUAEPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PageHero
              title="Study Abroad Expo UAE"
              bgImage="/images/events/Expo-Banner/mega-study-abroad-expo-uae.webp"
            />
      <div className="py-10">
        <UAEExpoForm />
      </div>
    </main>
  );
}
