'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import planData from '@/data/readingPlan.json';
import {
  Flame,
  Calendar,
  Award,
  BookOpen,
  Sparkles,
  Trophy,
  ChevronDown,
} from 'lucide-react';

export default function ProgressOverview() {
  const { progress } = useAuth();
  const { lang } = useTheme();
  const [showMobileBadges, setShowMobileBadges] = useState(false);

  const isTamil = lang === 'ta';
  const totalDays = 365;
  const totalChapters = planData.program.totalChapters; // 1,163
  const completedDaysCount = progress.completedDays.length;
  const completedChaptersCount = progress.completedChapters.length;

  const percentDays = Math.round((completedDaysCount / totalDays) * 100 * 10) / 10;
  const percentChapters = Math.round((completedChaptersCount / totalChapters) * 100 * 10) / 10;

  // Milestone Badges
  const milestones = [
    { id: 'first_day', label: 'First Step', desc: 'Day 1 Complete', unlocked: completedDaysCount >= 1, icon: '🌱' },
    { id: 'week_1', label: '7-Day Devotion', desc: '1 Week Faithful', unlocked: completedDaysCount >= 7, icon: '🔥' },
    { id: 'month_1', label: 'Month of Grace', desc: '30 Days Complete', unlocked: completedDaysCount >= 30, icon: '📜' },
    { id: 'patriarchs', label: 'Patriarchs', desc: 'Genesis & Job', unlocked: completedDaysCount >= 40, icon: '⭐' },
    { id: 'century', label: '100-Day Champion', desc: '100 Days in Word', unlocked: completedDaysCount >= 100, icon: '🛡️' },
    { id: 'halfway', label: 'Halfway Blessed', desc: '183 Days', unlocked: completedDaysCount >= 183, icon: '👑' },
    { id: 'finisher', label: 'Bible Finisher', desc: '365 Days Complete', unlocked: completedDaysCount >= 365, icon: '🏆' },
  ];

  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  return (
    <div className="space-y-2">
      {/* ========================================================== */}
      {/* 🌟 UNIFIED COMPACT MICRO-STATS STRIP (ZERO SCROLL OVERHEAD) */}
      {/* ========================================================== */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm space-y-2">
        {/* 4-column micro badges */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 text-center">
          {/* Streak */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 border border-amber-400/25 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
              <span className="font-cinzel text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                {progress?.currentStreak || 0}d
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-sanctuary-500 font-medium uppercase tracking-tight">
              {isTamil ? 'தொடர்' : 'Streak'}
            </span>
          </div>

          {/* Days */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-gold-500/10 border border-gold-400/25 flex flex-col items-center justify-center">
            <div className="flex items-center gap-0.5">
              <span className="font-cinzel text-xs sm:text-sm font-black text-gold-600 dark:text-gold-400">
                {completedDaysCount}
              </span>
              <span className="text-[9px] sm:text-[10px] text-sanctuary-400 font-bold">/365</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-sanctuary-500 font-medium uppercase tracking-tight">
              {isTamil ? 'நாட்கள்' : 'Days'}
            </span>
          </div>

          {/* Chapters */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-sacred-600/10 border border-sacred-400/25 flex flex-col items-center justify-center">
            <div className="flex items-center gap-0.5">
              <span className="font-cinzel text-xs sm:text-sm font-black text-sacred-700 dark:text-gold-400">
                {completedChaptersCount}
              </span>
              <span className="text-[9px] sm:text-[10px] text-sanctuary-400 font-bold">/1.1k</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-sanctuary-500 font-medium uppercase tracking-tight">
              {isTamil ? 'அதிகாரம்' : 'Chapters'}
            </span>
          </div>

          {/* Badges / Milestones */}
          <button
            type="button"
            onClick={() => setShowMobileBadges(!showMobileBadges)}
            className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 border border-emerald-400/25 flex flex-col items-center justify-center active:scale-95 transition-transform hover:bg-emerald-500/20"
            title="Click to view all milestone badges"
          >
            <div className="flex items-center gap-0.5">
              <span className="font-cinzel text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                {unlockedCount}
              </span>
              <span className="text-[9px] sm:text-[10px] text-sanctuary-400 font-bold">/7</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-400 font-medium uppercase tracking-tight flex items-center gap-0.5">
              {isTamil ? 'பதக்கம்' : 'Badges'}
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showMobileBadges ? 'rotate-180' : ''}`} />
            </span>
          </button>
        </div>

        {/* Ultra-slim progress bar */}
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-[10px] text-sanctuary-500 font-medium">
            <span>{isTamil ? '365 நாள் முன்னேற்றம்' : 'Yearly Walk'}</span>
            <span className="font-bold text-gold-600 dark:text-gold-400">{percentDays}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-sanctuary-100 dark:bg-sanctuary-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-500 via-amber-500 to-sacred-700 rounded-full transition-all duration-500 shadow-glow-gold"
              style={{ width: `${Math.max(2, percentDays)}%` }}
            />
          </div>
        </div>

        {/* Expandable Badges (Only shown when user taps the Badges button) */}
        {showMobileBadges && (
          <div className="pt-2 border-t border-sanctuary-100 dark:border-sanctuary-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 animate-fadeIn">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={`p-2 rounded-xl border text-center transition-all ${
                  m.unlocked
                    ? 'bg-gold-50/60 dark:bg-gold-950/20 border-gold-300'
                    : 'bg-sanctuary-50/40 opacity-40 grayscale border-sanctuary-200'
                }`}
              >
                <div className="text-base">{m.icon}</div>
                <p className="text-[10px] font-bold truncate text-sanctuary-800 dark:text-sanctuary-100">{m.label}</p>
                <p className="text-[9px] text-sanctuary-500 truncate">{m.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
