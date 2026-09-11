'use client';

import React from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import BibleFactsSection from '@/components/BibleFactsSection';
import SocialHubSection from '@/components/SocialHubSection';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import {
  BookOpen,
  Calendar,
  Flame,
  CheckCircle2,
  Heart,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  Compass,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, progress, openAuthModal } = useAuth();
  const { lang } = useTheme();
  const isTamil = lang === 'ta';

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

  return (
    <div className="space-y-12">
      
      {/* Devotional Hero Section */}
      <HeroSection />

      {/* Intro from Original Booklet Section */}
      <section className="py-12 bg-white dark:bg-sanctuary-900/50 theme-sepia:bg-[#FAF4E5] border-y border-sanctuary-200 dark:border-sanctuary-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sacred-50 dark:bg-sacred-950 text-sacred-700 dark:text-sacred-300 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-sacred-600 fill-sacred-600" />
            <span>A Message from Relation With God</span>
          </div>

          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-sanctuary-900 dark:text-sanctuary-100">
            Why Read The Bible In Chronological Order?
          </h2>

          <div className="space-y-4 font-scripture text-sm sm:text-base text-sanctuary-700 dark:text-sanctuary-300 max-w-3xl mx-auto leading-relaxed text-left sm:text-justify">
            <p>
              “இன்று நம்மிடம் உள்ள பரிசுத்த வேதாகமம் <strong>Canonical order</strong> (நியதி முறை)-ல் அமைந்துள்ளது. அதாவது இவ்வரிசை, வரலாற்று நிகழ்வுகளின் காலவரிசையாக இல்லாமல், புத்தகங்கள் மற்றும் சுவிசேஷங்களின் தொகுப்பாகக் கொண்டுள்ளது.”
            </p>
            <p>
              “பரிசுத்த வேதாகமத்தை காலவரிசை முறையில் வாசிக்கும் போது, வசனத்தை வரலாற்றோடு ஒப்பிட்டுப் புரிந்து கொள்ள உதவும். உதாரணமாக: அப்போஸ்தல நடபடிகளை வாசிக்கும் போது பவுலின் நிருபங்கள் எப்போது எழுதப்பட்டன என்பதைத் தெளிவாகப் புரிந்து கொள்ள முடியும். தாவீதின் சரித்திரத்தைப் படிக்கும் போது, தாவீதால் எழுதப்பட்ட சங்கீதத்தையும் சேர்த்துப் படித்தால், அந்தச் சங்கீதம் எழுதப்பட்ட நோக்கத்தையும் உணர்வையும் அறிந்து கொள்ள முடியும்.”
            </p>
            <p className="font-sans text-xs sm:text-sm text-gold-700 dark:text-gold-400 font-semibold italic text-center pt-2">
              — J Jerish Obed (Relation With God)
            </p>
          </div>
        </div>
      </section>

      {/* 4 Pillars of the 365-Day Program */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h3 className="font-cinzel text-xl sm:text-3xl font-bold text-sanctuary-900 dark:text-sanctuary-100">
            How The 365-Day Program Works
          </h3>
          <p className="text-xs sm:text-sm text-sanctuary-600 dark:text-sanctuary-400 mt-2">
            A step-by-step spiritual journey designed to keep you consistent, inspired, and rooted in God’s Word.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm text-center space-y-3 group hover:border-gold-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-cinzel text-base font-bold text-sanctuary-900 dark:text-sanctuary-100">
              1. Daily Scripture
            </h4>
            <p className="text-xs text-sanctuary-600 dark:text-sanctuary-400 leading-relaxed">
              3 to 4 chapters assigned each day, harmonized in chronological timeline from Genesis to Revelation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm text-center space-y-3 group hover:border-gold-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 fill-amber-500" />
            </div>
            <h4 className="font-cinzel text-base font-bold text-sanctuary-900 dark:text-sanctuary-100">
              2. Track & Streaks
            </h4>
            <p className="text-xs text-sanctuary-600 dark:text-sanctuary-400 leading-relaxed">
              Tick off chapters as you finish. Keep your daily reading streak alive with YouVersion-style progress rings.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm text-center space-y-3 group hover:border-gold-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sacred-600/10 text-sacred-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-cinzel text-base font-bold text-sanctuary-900 dark:text-sanctuary-100">
              3. Dual-Language & Audio
            </h4>
            <p className="text-xs text-sanctuary-600 dark:text-sanctuary-400 leading-relaxed">
              Read in Tamil and English in-app, or tap 1-click to open in YouVersion Tamil (BSI) / KJV with audio narration.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm text-center space-y-3 group hover:border-gold-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-cinzel text-base font-bold text-sanctuary-900 dark:text-sanctuary-100">
              4. Daily Prayer Note
            </h4>
            <p className="text-xs text-sanctuary-600 dark:text-sanctuary-400 leading-relaxed">
              Record personal prayer notes and journal what God spoke to you each day, building a lasting spiritual memorial.
            </p>
          </div>

        </div>
      </section>

      {/* Bible Facts Section */}
      <BibleFactsSection />

      {/* YouTube & Instagram Social Hub */}
      <SocialHubSection />

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gold-50/50 dark:to-sanctuary-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-sanctuary-900 dark:text-sanctuary-50">
            Start Your Journey with God Today
          </h2>
          <p className="text-sm sm:text-base text-sanctuary-600 dark:text-sanctuary-300 max-w-xl mx-auto">
            Commit 15 minutes a day to Scripture. Experience the peace, direction, and intimacy of a deep Relation With God.
          </p>
          
          <div className="pt-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-600 to-sacred-700 text-white font-bold text-sm shadow-glow-gold hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <span>{isTamil ? `வாசிப்பை தொடரவும் (நாள் ${nextPendingDay})` : `Continue Day ${nextPendingDay} Reading`}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-600 to-sacred-700 text-white font-bold text-sm shadow-glow-gold hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <span>Join The 365-Day Program Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
