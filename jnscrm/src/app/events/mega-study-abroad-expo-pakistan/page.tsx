import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import PakExpoForm from '@/components/ExpoForms/PakExpoForm';
  export const metadata: Metadata = {
    title: 'Study Abroad Expo Pakistan | JnS Education',
    description: 'Register for the Study Abroad Expo in Pakistan. Meet representatives from top global universities.',
  };

  export default function StudyAbroadExpoPakistanPage() {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <PageHero
                title="Mega Study Abroad Expo Pakistan"
                bgImage="/images/events/Expo-Banner/mega-study-abroad-expo-pakistan.webp"
              />
        <div className="py-10">
          <PakExpoForm />
        </div>
      </main>
    );
  }
