'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import ProgressOverview from '@/components/ProgressOverview';
import ReadingPlanGrid from '@/components/ReadingPlanGrid';
import { getStoredAnnouncement } from '@/lib/storage';
import { getAnnouncementFromFirestore } from '@/lib/firestoreService';
import { BroadcastAnnouncement } from '@/types';
import AuthBarrier from '@/components/AuthBarrier';
import {
  Sparkles,
  Flame,
  Bell,
  RotateCcw,
  BookOpen,
  User,
  Shield,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, progress, resetProgress, isAuthenticated, loading, openAuthModal } = useAuth();
  const { lang } = useTheme();
  const [announcement, setAnnouncement] = useState<BroadcastAnnouncement>(getStoredAnnouncement());

  useEffect(() => {
    getAnnouncementFromFirestore().then((live) => {
      if (live && live.title) {
        setAnnouncement(live);
      }
    });
  }, []);

  const isTamil = lang === 'ta';

  // 1. Loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-sanctuary-texture space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-400 via-gold-500 to-sacred-700 flex items-center justify-center text-white shadow-glow-gold animate-pulse">
          <BookOpen className="w-7 h-7" />
        </div>
        <p className="font-cinzel text-xs sm:text-sm text-sanctuary-600 dark:text-sanctuary-300 font-semibold tracking-wider">
          {isTamil ? 'உங்கள் வாசிப்புப் பயணம் தயாராகிறது...' : 'Loading Your 365-Day Journey...'}
        </p>
      </div>
    );
  }

  // 2. Strict Auth Barrier: Compulsory Sign-In
  if (!isAuthenticated) {
    return <AuthBarrier targetDescription={isTamil ? '365 நாள் வாசிப்பு அட்டவணை' : '365-Day Reading Plan'} />;
  }

  return (
    <div className="min-h-screen py-3 sm:py-6 md:py-8 bg-sanctuary-texture">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
        
        {/* Compact Responsive Welcome Header */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-100 dark:bg-sanctuary-800 text-gold-700 dark:text-gold-400 text-[10px] sm:text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-gold-600" />
                <span>Relation With God • 365 Days</span>
              </div>

              <h1 className="font-cinzel text-base sm:text-2xl font-extrabold text-sanctuary-900 dark:text-sanctuary-50 tracking-tight">
                Peace be with you, {user?.name || (isTamil ? 'அன்பான தேவபிள்ளையே' : 'Child of God')}
              </h1>

              <p className="font-tamil text-xs sm:text-sm text-sacred-700 dark:text-gold-400 font-medium hidden sm:block">
                “உமது வேதத்திலுள்ள அதிசயங்களை நான் பார்க்கும்படிக்கு என் கண்களைத் திறந்தருளும்” — சங் 119:18
              </p>
            </div>

            {/* Quick Action: Reset */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (window.confirm('Would you like to restart your reading plan fresh from Day 1? This will reset completed chapters.')) {
                    resetProgress();
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-[10px] sm:text-xs font-semibold text-sanctuary-500 hover:text-sacred-700 transition-colors"
                title="Reset to Day 1"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset to Day 1</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Micro-Stats Bar (Only 45px tall!) */}
        <ProgressOverview />

        {/* Today's Reading Target - IMMEDIATELY AT THE TOP! */}
        <ReadingPlanGrid />

      </div>
    </div>
  );
}
