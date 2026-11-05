import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import BahrainExpoForm from '@/components/ExpoForms/BahrainExpoForm';
export const metadata: Metadata = {
  title: 'Study Abroad Expo Bahrain | JnS Education',
  description: 'Register for the Study Abroad Expo in Bahrain. Meet representatives from top global universities.',
};

export default function StudyAbroadExpoBahrainPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PageHero
              title="Study Abroad Expo Bahrain"
              bgImage="/images/events/Expo-Banner/mega-study-abroad-expo-bahrain.webp"
            />
      <div className="py-10">
        <BahrainExpoForm />
      </div>
    </main>
  );
}
