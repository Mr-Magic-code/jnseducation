import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import QatarExpoForm from '@/components/ExpoForms/QatarExpoForm';
export const metadata: Metadata = {
  title: 'Mega Study Abroad Expo Qatar | JnS Education',
  description: 'Register for the Mega Study Abroad Expo in Qatar. Meet representatives from top global universities.',
};

export default function StudyAbroadExpoQatarPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PageHero
              title="Mega Study Abroad Expo Qatar"
              bgImage="/images/events/Expo-Banner/study-abroad-expo-qatar.webp"
            />
      <div className="py-10">
        <QatarExpoForm />
      </div>
    </main>
  );
}
