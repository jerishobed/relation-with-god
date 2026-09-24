'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import { BookOpen, Sparkles, Flame, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HeroSection() {
  const { isAuthenticated, progress, openAuthModal } = useAuth();
  const { lang } = useTheme();

  const nextPendingDay = React.useMemo(() => {
    if (!progress || !Array.isArray(progress.completedDays)) return 1;
    for (let i = 1; i <= 365; i++) {
      const isDone = progress.completedDays.some((d: number | string) => Number(d) === i);
      if (!isDone) {
        return i;
      }
    }
    return 1;
  }, [progress?.completedDays]);

  const isTamil = lang === 'ta';

  return (
    <section className="relative overflow-hidden pt-8 pb-20 md:pt-14 md:pb-28 bg-sanctuary-texture">
      
      {/* Holy Ambient Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-400/15 dark:bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-sacred-600/10 dark:bg-sacred-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 dark:bg-sanctuary-800/80 border border-gold-400/40 text-xs font-semibold text-sanctuary-800 dark:text-gold-400 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>Relation With God Ministries • 365-Day Plan</span>
            </div>

            {/* Main Title */}
            <div className="space-y-2">
              <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-sanctuary-900 dark:text-sanctuary-50 leading-[1.15]">
                READ THE BIBLE IN <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-gold-600 via-amber-500 to-sacred-700 bg-clip-text text-transparent">
                  CHRONOLOGICAL
                </span>{' '}
                ORDER
              </h1>
              
              <p className="font-tamil text-base sm:text-xl font-medium text-sacred-700 dark:text-gold-300 pt-1">
                பரிசுத்த வேதாகமத்தை 365 நாட்களில் காலவரிசையில் வாசிப்போம்!
              </p>
            </div>

            {/* Scripture Quote */}
            <div className="relative pl-4 border-l-2 border-gold-500/60 py-1 text-left inline-block lg:block">
              <p className="font-scripture italic text-sm sm:text-base text-sanctuary-700 dark:text-sanctuary-300">
                “Thy word is a lamp unto my feet, and a light unto my path.”
              </p>
              <p className="font-tamil text-xs sm:text-sm text-sanctuary-600 dark:text-sanctuary-400 mt-0.5">
                “உம்முடைய வசனம் என் கால்களுக்குத் தீபமும், என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது.” — சங் 119 : 105
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-sanctuary-600 dark:text-sanctuary-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              When we read the Holy Scriptures in chronological sequence, historical events and prophetic promises align with clarity. Track your daily chapters, keep your reading streak, and experience God’s heart from creation to eternity.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-600 to-sacred-700 text-white font-semibold text-sm shadow-glow-gold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {isTamil
                      ? `வாசிப்பைத் தொடரவும் (நாள் ${nextPendingDay})`
                      : `Continue Reading (Day ${nextPendingDay})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-600 to-sacred-700 text-white font-semibold text-sm shadow-glow-gold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{isTamil ? '365 நாள் பயணத்தில் இணையுங்கள்' : 'Enroll in 365-Day Journey'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <Link
                href="/dashboard#reading-grid"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-sanctuary-900 border border-sanctuary-300 dark:border-sanctuary-700 text-sanctuary-800 dark:text-sanctuary-200 text-sm font-semibold hover:border-gold-500 transition-all"
              >
                <span>{isTamil ? '365 நாட்கள் அட்டவணை' : 'Explore All 365 Days'}</span>
              </Link>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-sanctuary-200 dark:border-sanctuary-800 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="font-cinzel text-xl sm:text-2xl font-bold text-sanctuary-900 dark:text-sanctuary-100">
                  365
                </div>
                <div className="text-xs text-sanctuary-500 dark:text-sanctuary-400">
                  {isTamil ? 'நாட்கள்' : 'Daily Readings'}
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-cinzel text-xl sm:text-2xl font-bold text-sanctuary-900 dark:text-sanctuary-100">
                  1,163
                </div>
                <div className="text-xs text-sanctuary-500 dark:text-sanctuary-400">
                  {isTamil ? 'அதிகாரங்கள்' : 'Chapters'}
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-cinzel text-xl sm:text-2xl font-bold text-gold-600 dark:text-gold-400">
                  100%
                </div>
                <div className="text-xs text-sanctuary-500 dark:text-sanctuary-400">
                  {isTamil ? 'முழு வேதாகமம்' : 'Chronological'}
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Image - Booklet Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              
              {/* Outer Golden Halo */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-gold-500 to-sacred-700 rounded-3xl opacity-30 blur-lg group-hover:opacity-50 transition duration-500" />

              {/* Book Cover Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gold-400/60 dark:border-gold-500/40 bg-sanctuary-900 max-w-[340px] sm:max-w-[380px]">
                <Image
                  src="/assets/booklet-cover.png"
                  alt="Read The Bible In Chronological Order Booklet Cover - J Jerish Obed"
                  width={380}
                  height={520}
                  className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition duration-500"
                  priority
                />

                {/* Floating Tag */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gold-300 font-cinzel">
                      Official Booklet Edition
                    </p>
                    <p className="text-[11px] text-gray-300">
                      Prepared by J Jerish Obed
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-gold-500/30 border border-gold-400/50 text-[10px] font-bold text-gold-300 uppercase tracking-wide">
                    365 Days
                  </span>
                </div>
              </div>

              {/* Free Hardcopy Request CTA */}
              <div className="mt-3 text-center">
                <Link
                  href="/booklet"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sacred-700 via-sacred-800 to-gold-600 hover:from-sacred-800 hover:to-gold-700 text-white font-semibold text-xs shadow-md transition-all hover:scale-102 active:scale-98"
                >
                  <span>🎁 {isTamil ? 'இலவச அச்சுப் புத்தகம் பெறுக' : 'Request Free Hardcopy Booklet'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <p className="text-[10px] text-sanctuary-500 mt-1">
                  {isTamil ? '100% இலவசம் • அஞ்சலில் உங்கள் இல்லத்திற்கே' : '100% Free • Delivered by Post'}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
