'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordVisitorPageView } from '@/lib/firestoreService';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    
    // Record pageview in Cloud Firestore
    recordVisitorPageView(pathname);

    // If Google Analytics (gtag) is present on window, track pageview
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
