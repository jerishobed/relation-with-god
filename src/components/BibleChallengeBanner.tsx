'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import {
  Flame,
  Calendar,
  Clock,
  BookOpen,
  Gift,
  Target,
  ExternalLink,
  Share2,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/SocialIcons';

interface BibleChallengeBannerProps {
  compact?: boolean;
}

export default function BibleChallengeBanner({ compact = false }: BibleChallengeBannerProps) {
  const { progress, isAuthenticated, openAuthModal } = useAuth();
  const { lang } = useTheme();
  const isTamil = lang === 'ta';
  const [copied, setCopied] = useState(false);

  // Target deadline: 31st December 2027, 23:59:59 IST (UTC+5:30)
  const daysRemaining = useMemo(() => {
    const target = new Date('2027-12-31T23:59:59+05:30').getTime();
    const now = Date.now();
    const diff = target - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, []);

  const nextPendingDay = useMemo(() => {
    if (!progress || !Array.isArray(progress.completedDays)) return 1;
    for (let i = 1; i <= 365; i++) {
      const isDone = progress.completedDays.some((d: number | string) => Number(d) === i);
      if (!isDone) return i;
    }
    return 1;
  }, [progress?.completedDays]);

  const shareText = `📖🔥 365-நாள் வேதாகம வாசிப்பு சவால்! 🔥📖

முழு வேதாகமத்தையும் வாசித்து முடிக்க ஒரு சிறந்த வாய்ப்பு! ❤️

✨ தினமும் வெறும் 12–15 நிமிடங்கள் மட்டுமே!

📖 முழு வேதாகமம் (1,189 அதிகாரங்கள்)
📅 தினமும் 3–4 அதிகாரங்கள்
🎯 கடைசி நாள்: 31 டிசம்பர் 2027
🎁 31/12/2027-க்குள் முடிக்கும் அனைவருக்கும் உற்சாகமூட்டும் சிறப்புப் பரிசுகள்!

👉 இலவசமாக இணைய: https://relationswithgod.in/
📊 வாசிப்பைப் பதிவு செய்ய: https://relationswithgod.in/dashboard
💬 நமது WhatsApp குழுவில் இணைய:
https://chat.whatsapp.com/HtxaD964WV4EeYFw64MTJY?mode=gi_t

உங்கள் குடும்பத்தினருக்கும் நண்பர்களுக்கும் பகிருங்கள்! 🙏`;

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sacred-950 via-sanctuary-900 to-sanctuary-950 border-2 border-gold-500/40 shadow-xl p-5 sm:p-7 text-white">
      {/* Background Decorative Holy Glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sacred-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top Header Badge & Countdown */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sacred-800/80 border border-gold-400/50 text-gold-300 text-xs font-bold tracking-wide shadow-sm">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>
              {isTamil
                ? '365-நாள் வேதாகம வாசிப்பு சவால்'
                : '365-Day Bible Reading Challenge'}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-semibold">
            <Target className="w-3.5 h-3.5 text-gold-400" />
            <span>
              {isTamil
                ? `இலக்கு: 31 டிசம்பர் 2027 (${daysRemaining} நாட்கள் மீதமுள்ளது)`
                : `Target: 31 Dec 2027 (${daysRemaining} Days Left)`}
            </span>
          </div>
        </div>

        {/* Challenge Headline */}
        <div className="space-y-1.5">
          <h2 className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-extrabold text-gold-200 leading-tight">
            {isTamil
              ? 'முழு வேதாகமத்தையும் வாசித்து முடிக்க ஒரு சிறந்த வாய்ப்பு! ❤️'
              : 'Read The Entire Bible in Chronological Order! ❤️'}
          </h2>
          <p className="text-xs sm:text-sm text-sanctuary-200 max-w-2xl leading-relaxed">
            {isTamil
              ? 'ஆதியாகமம் முதல் வெளிப்படுத்தின விசேஷம் வரை 1,189 அதிகாரங்களையும் காலவரிசைப்படி தினசரி 12–15 நிமிடங்களில் வாசித்து முடிக்கலாம்.'
              : 'Journey from Genesis to Revelation through all 1,189 chapters in just 12–15 peaceful minutes each day.'}
          </p>
        </div>

        {/* 4 Feature Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 py-1">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 backdrop-blur-sm">
            <BookOpen className="w-5 h-5 text-gold-400 mx-auto" />
            <div className="text-xs sm:text-sm font-bold text-white">1,189 Chapters</div>
            <div className="text-[10px] text-sanctuary-300">
              {isTamil ? 'முழு வேதாகமம்' : 'Entire Bible'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 backdrop-blur-sm">
            <Calendar className="w-5 h-5 text-emerald-400 mx-auto" />
            <div className="text-xs sm:text-sm font-bold text-white">3–4 Chs / Day</div>
            <div className="text-[10px] text-sanctuary-300">
              {isTamil ? 'தினசரி இலக்கு' : 'Daily Portion'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 backdrop-blur-sm">
            <Clock className="w-5 h-5 text-amber-400 mx-auto" />
            <div className="text-xs sm:text-sm font-bold text-white">12–15 Mins</div>
            <div className="text-[10px] text-sanctuary-300">
              {isTamil ? 'தினமும் போதும்' : 'Minutes Daily'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 backdrop-blur-sm">
            <Gift className="w-5 h-5 text-rose-400 mx-auto" />
            <div className="text-xs sm:text-sm font-bold text-white">Special Gifts</div>
            <div className="text-[10px] text-sanctuary-300">
              {isTamil ? 'சிறப்புப் பரிசுகள்' : 'For Finishers'}
            </div>
          </div>
        </div>

        {/* Special Gifts Callout Strip */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-gold-500/20 via-sacred-700/25 to-gold-500/20 border border-gold-400/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-500 text-sacred-950 flex items-center justify-center shrink-0 shadow-md">
            <Gift className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-gold-200">
            {isTamil
              ? '🎁 31/12/2027-க்குள் வேதாகமம் முழுவதையும் முடிக்கும் அனைவருக்கும் Relations With God சார்பாக உற்சாகமூட்டும் சிறப்புப் பரிசுகள் வழங்கப்படும்!'
              : '🎁 Exciting special gifts await participants who successfully complete the entire Bible on or before 31st December 2027!'}
          </p>
        </div>

        {/* Action Buttons & Share */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {isAuthenticated ? (
              <Link
                href={`/read/${nextPendingDay}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-sacred-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {isTamil
                    ? `Day ${nextPendingDay} வாசிக்கத் தொடங்குங்கள்`
                    : `Start Reading Day ${nextPendingDay}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-sacred-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isTamil ? 'இலவசமாக சவாலில் இணையுங்கள்' : 'Join Challenge Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <a
              href="https://chat.whatsapp.com/HtxaD964WV4EeYFw64MTJY?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{isTamil ? 'WhatsApp குழு' : 'WhatsApp Group'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* 1-Click WhatsApp Share Message Button */}
          <button
            onClick={handleCopyShare}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all active:scale-95"
            title="Copy WhatsApp Message"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold">
                  {isTamil ? 'நகலெடுக்கப்பட்டது!' : 'Copied!'}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-gold-300" />
                <span>
                  {isTamil ? 'WhatsApp செய்தியை நகலெடு' : 'Copy WhatsApp Message'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
