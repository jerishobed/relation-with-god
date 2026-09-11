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
  const { user, progress, resetProgress, isAuthenticated, openAuthModal } = useAuth();
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
                Peace be with you, {isAuthenticated ? (user?.name || 'Devotee') : (isTamil ? 'அன்பான தேவபிள்ளையே' : 'Beloved Devotee')}
              </h1>

              <p className="font-tamil text-xs sm:text-sm text-sacred-700 dark:text-gold-400 font-medium hidden sm:block">
                “உமது வேதத்திலுள்ள அதிசயங்களை நான் பார்க்கும்படிக்கு என் கண்களைத் திறந்தருளும்” — சங் 119:18
              </p>
            </div>

            {/* Quick Actions: Reset / Sign In */}
            <div className="flex items-center gap-2 shrink-0">
              {!isAuthenticated ? (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-sacred-700 text-white text-[11px] sm:text-xs font-bold shadow-glow-gold hover:opacity-95 transition-all active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'உள்நுழைக' : 'Sign In'}</span>
                </button>
              ) : (
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
              )}
            </div>
          </div>
        </div>

        {/* Guest prompt banner if not authenticated */}
        {!isAuthenticated && (
          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-gold-500/10 to-sacred-600/10 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs text-sanctuary-800 dark:text-sanctuary-200">
                <span className="font-bold">{isTamil ? 'அன்பான குறிப்பு: ' : 'Devotional Note: '}</span>
                {isTamil
                  ? 'நீங்கள் இப்போது விருந்தினராகப் பார்க்கிறீர்கள். உங்கள் வாசிப்புத் தொடர், குறிப்புகள் மற்றும் முடிக்கப்பட்ட அதிகாரங்களைச் சேமிக்க உள்நுழையவும்.'
                  : 'You are viewing as a guest. Sign in with Google or Email to record your chapters, streak, and daily notes to your account.'}
              </p>
            </div>
            <button
              onClick={openAuthModal}
              className="shrink-0 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              {isTamil ? 'இப்போதே உள்நுழையவும்' : 'Sign In with Google'}
            </button>
          </div>
        )}

        {/* Compact Micro-Stats Bar (Only 45px tall!) */}
        <ProgressOverview />

        {/* Today's Reading Target - IMMEDIATELY AT THE TOP! */}
        <ReadingPlanGrid />

      </div>
    </div>
  );
}
