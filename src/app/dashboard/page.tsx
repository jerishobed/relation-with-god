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
  ExternalLink,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/SocialIcons';

export default function DashboardPage() {
  const { user, progress, resetProgress, isAuthenticated, loading, openAuthModal, toggleEmailReminders } = useAuth();
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

        {/* WhatsApp Community Fellowship Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-600/10 to-teal-500/10 border border-emerald-500/30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-sanctuary-900 dark:text-sanctuary-100">
                {isTamil ? 'அதிகாரப்பூர்வ WhatsApp குழுவில் இணையுங்கள்!' : 'Join our Official WhatsApp Community!'}
              </p>
              <p className="text-[11px] sm:text-xs text-sanctuary-600 dark:text-sanctuary-400">
                {isTamil ? 'தினசரி நினைவூட்டல்கள், தியானங்கள் மற்றும் கூட்டு வாசிப்பு ஐக்கியம்' : 'Daily 15-minute reminders, chapter discussions & prayer fellowship'}
              </p>
            </div>
          </div>
          <a
            href="https://chat.whatsapp.com/HtxaD964WV4EeYFw64MTJY?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>{isTamil ? 'குழுவில் இணைய' : 'Join WhatsApp Group'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Daily Reading Reminder Preference Card */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                user?.emailRemindersEnabled !== false
                  ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-400/30'
                  : 'bg-sanctuary-100 dark:bg-sanctuary-800 text-sanctuary-400 border border-sanctuary-300 dark:border-sanctuary-700'
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs sm:text-sm font-bold text-sanctuary-900 dark:text-sanctuary-100">
                  {isTamil ? 'இரவு 9:00 மணி வேத வாசிப்பு நினைவூட்டல் (9 PM Reminder Email)' : 'Daily 9:00 PM Reading Reminder Email'}
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    user?.emailRemindersEnabled !== false
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-sanctuary-200 text-sanctuary-600 dark:bg-sanctuary-800 dark:text-sanctuary-400'
                  }`}
                >
                  {user?.emailRemindersEnabled !== false
                    ? isTamil
                      ? 'இயக்கத்தில் உள்ளது'
                      : 'Active'
                    : isTamil
                    ? 'முடக்கப்பட்டுள்ளது'
                    : 'Turned Off'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-sanctuary-600 dark:text-sanctuary-400">
                {isTamil
                  ? 'அன்றைய வேத வாசிப்பை முடிக்காத நாட்களில் மட்டும் உங்கள் முன்னேற்றத்துடன் அன்பான நினைவூட்டல் அனுப்பப்படும்.'
                  : 'Sends an encouraging reminder with your assigned chapters at 9:00 PM if reading is pending.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleEmailReminders()}
            type="button"
            className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              user?.emailRemindersEnabled !== false
                ? 'bg-sanctuary-100 dark:bg-sanctuary-800 text-sanctuary-700 dark:text-sanctuary-300 hover:bg-sanctuary-200 border-sanctuary-300 dark:border-sanctuary-700'
                : 'bg-gold-500 hover:bg-gold-600 text-white border-gold-600 shadow-sm'
            }`}
          >
            {user?.emailRemindersEnabled !== false ? (
              <span>{isTamil ? 'நினைவூட்டலை முடக்கு (Turn Off)' : 'Disable Email Reminders'}</span>
            ) : (
              <span>{isTamil ? 'நினைவூட்டலை இயக்கு (Turn On)' : 'Enable Email Reminders'}</span>
            )}
          </button>
        </div>

        {/* Compact Micro-Stats Bar (Only 45px tall!) */}
        <ProgressOverview />

        {/* Today's Reading Target - IMMEDIATELY AT THE TOP! */}
        <ReadingPlanGrid />

      </div>
    </div>
  );
}
