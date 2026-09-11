import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/themeContext';
import { AuthProvider } from '@/lib/authContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Relation With God | 365 Days Chronological Bible Journey',
  description:
    'Read the Bible in 365 days in chronological order with daily progress tracking, streaks, YouVersion integration, and spiritual devotionals. Prepared by J Jerish Obed.',
  keywords: [
    'Relation With God',
    '365 Day Bible Reading Plan',
    'Chronological Bible',
    'Tamil Bible Reading',
    'YouVersion Bible',
    'J Jerish Obed',
    'Devotional',
  ],
  authors: [{ name: 'J Jerish Obed' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col selection:bg-gold-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pb-24">{children}</main>
            <Footer />
            <BottomNav />
            <AuthModal />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
