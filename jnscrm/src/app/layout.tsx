import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import GenHeader from '@/components/Headers/GenHeader';
import GenFooter from '@/components/Footers/GenFooter';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const SITE_URL = (process.env.SITE_URL || 'https://jnsedu.com').replace(/\/$/, '');
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/pages-banner/hero-banner.webp`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'JnS Education | Study Abroad & Immigration Experts',
    template: '%s | JnS Education',
  },
  description:
    'JnS Education helps students and families with study abroad admissions, visa guidance, IELTS/PTE testing and global education events.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'JnS Education',
    title: 'JnS Education | Study Abroad & Immigration Experts',
    description:
      'Study abroad admissions, visa guidance and global education events.',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'JnS Education' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JnS Education',
    description:
      'Study abroad admissions, visa guidance and global education events.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${poppins.variable}`}>
      <body>
        <GenHeader />
        <main className="flex-1">
          {children}
        </main>
        <GenFooter />
      </body>
    </html>
  );
}