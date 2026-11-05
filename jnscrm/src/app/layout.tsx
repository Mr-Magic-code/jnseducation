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

export const metadata = {
  title: 'JNS CRM',
  description: 'CRM Web Application',
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