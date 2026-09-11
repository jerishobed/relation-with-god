import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { ThemeProvider } from '@/lib/themeContext';
import { AuthProvider } from '@/lib/authContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import BottomNav from '@/components/BottomNav';
import VisitorTracker from '@/components/VisitorTracker';

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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col selection:bg-gold-500 selection:text-white">
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <VisitorTracker />
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
