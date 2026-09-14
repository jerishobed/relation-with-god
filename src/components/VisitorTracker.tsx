'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { recordVisitorPageView } from '@/lib/firestoreService';

export default function VisitorTracker() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    // Filter out owner / admin accounts
    const email = (user?.email || '').toLowerCase();
    if (
      email === 'jerishbtech@gmail.com' ||
      email === 'jerishobed@gmail.com' ||
      email === 'relationswithgod@gmail.com'
    ) {
      return;
    }

    // Record pageview in Cloud Firestore
    recordVisitorPageView(pathname, email);

    // If Google Analytics (gtag) is present on window, track pageview
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: pathname,
      });
    }
  }, [pathname, user?.email]);

  return null;
}
