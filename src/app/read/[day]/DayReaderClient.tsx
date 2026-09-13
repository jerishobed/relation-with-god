'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import planData from '@/data/readingPlan.json';
import AuthBarrier from '@/components/AuthBarrier';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  Save,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DayReaderClient({ day }: { day: number }) {
  const router = useRouter();
  const { progress, toggleChapter, toggleDay, saveNote, isAuthenticated, loading, openAuthModal } = useAuth();
  const { lang } = useTheme();

  const dayNum = day || 1;
  const dayData = planData.days.find((d) => d.day === dayNum) || planData.days[0];

  const [prayerNote, setPrayerNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const isTamil = lang === 'ta';
  const isDayCompleted = progress.completedDays.includes(dayNum);

  // 1. Loading State while resolving auth
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-sanctuary-texture space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-400 via-gold-500 to-sacred-700 flex items-center justify-center text-white shadow-glow-gold animate-pulse">
          <BookOpen className="w-7 h-7" />
        </div>
        <p className="font-cinzel text-xs sm:text-sm text-sanctuary-600 dark:text-sanctuary-300 font-semibold tracking-wider">
          {isTamil ? `நாள் ${dayNum} வேத வாசிப்பு தயாராகிறது...` : `Loading Day ${dayNum} Scripture...`}
        </p>
      </div>
    );
  }

  // 2. Compulsory Sign-In Barrier
  if (!isAuthenticated) {
    return (
      <AuthBarrier
        targetDescription={
          isTamil
            ? `நாள் ${dayNum} (${dayData?.tamilSummary || 'வேத வாசிப்பு'})`
            : `Day ${dayNum} (${dayData?.englishSummary || 'Scripture Reading'})`
        }
      />
    );
  }

  // Initialize existing note
  useEffect(() => {
    if (progress.notes && progress.notes[dayNum]) {
      setPrayerNote(progress.notes[dayNum]);
    } else {
      setPrayerNote('');
    }
  }, [dayNum, progress.notes]);

  const handleSaveNote = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    saveNote(dayNum, prayerNote);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  const handleToggleDayComplete = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const willComplete = !isDayCompleted;
    toggleDay(dayNum);
    if (willComplete) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E6C85E', '#BA3142', '#FAF8F5'],
      });
    }
  };

  const handleChapterClick = (chapterId: string) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const isCompleted = progress.completedChapters.includes(chapterId);
    toggleChapter(dayNum, chapterId);
    if (!isCompleted) {
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#D4AF37', '#E6C85E', '#BA3142'],
      });
    }
  };

  const prevDay = dayNum > 1 ? dayNum - 1 : null;
  const nextDay = dayNum < 365 ? dayNum + 1 : null;

  const completedChaptersCount = dayData.chapters.filter((c) =>
    progress.completedChapters.includes(c.id)
  ).length;

  return (
    <div className="min-h-screen py-8 bg-sanctuary-texture">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation & Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-sanctuary-600 dark:text-sanctuary-300 hover:text-gold-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isTamil ? 'அட்டவணைக்கு திரும்புக' : 'Back to 365-Day Schedule'}</span>
          </Link>

          {/* Prev / Next Navigation */}
          <div className="flex items-center gap-2">
            {prevDay && (
              <button
                onClick={() => router.push(`/read/${prevDay}`)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-800 bg-white dark:bg-sanctuary-900 text-xs font-medium text-sanctuary-700 dark:text-sanctuary-300 hover:border-gold-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Day {prevDay}</span>
              </button>
            )}
            {nextDay && (
              <button
                onClick={() => router.push(`/read/${nextDay}`)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-800 bg-white dark:bg-sanctuary-900 text-xs font-medium text-sanctuary-700 dark:text-sanctuary-300 hover:border-gold-500 transition-colors"
              >
                <span>Day {nextDay}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>


        {/* Day Headline Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold-400/10 dark:bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 dark:bg-sanctuary-800 text-gold-800 dark:text-gold-300 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>DAY {dayData.day} OF 365</span>
                <span>• {isTamil ? dayData.period.nameTa : dayData.period.nameEn}</span>
              </div>

              <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-sanctuary-900 dark:text-sanctuary-50">
                {dayData.englishSummary}
              </h1>

              <p className="font-tamil text-base sm:text-lg text-sacred-700 dark:text-gold-400 font-semibold mt-1">
                {dayData.tamilSummary}
              </p>
            </div>

            {/* Mark Day Complete Button */}
            <button
              onClick={handleToggleDayComplete}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
                isDayCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gradient-to-r from-gold-500 via-gold-600 to-sacred-700 hover:opacity-95 text-white shadow-glow-gold'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isDayCompleted ? 'Day Completed! ✨' : 'Mark Day Completed'}</span>
            </button>
          </div>

          {/* Quick Progress Indicator */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-sanctuary-100 dark:border-sanctuary-800 text-xs">
            <span className="text-sanctuary-500 dark:text-sanctuary-400 font-medium">
              Today's Chapters:
            </span>
            <div className="flex items-center gap-2 font-bold text-sanctuary-800 dark:text-sanctuary-200">
              <span className="text-gold-600 dark:text-gold-400">
                {completedChaptersCount} of {dayData.chaptersCount} completed
              </span>
            </div>
          </div>
        </div>

        {/* Spiritual Reading Guide (Booklet Exhortation) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gold-50/80 via-white to-sanctuary-50 dark:from-sanctuary-900 dark:via-sanctuary-900 dark:to-sanctuary-950 border-2 border-gold-300/60 dark:border-gold-700/50 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-sanctuary-900 dark:text-sanctuary-100">
                {isTamil ? 'உங்கள் சொந்த வேதாகமத்தை திறந்து வாசியுங்கள்' : 'Open & Read From Your Personal Holy Bible'}
              </h3>
              <p className="text-xs text-sanctuary-500 dark:text-sanctuary-400">
                A sacred moment at the Lord's feet before God's Word
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-sanctuary-800/80 border border-gold-200/50 dark:border-sanctuary-700 space-y-2">
            <p className="font-tamil text-sm text-sanctuary-800 dark:text-sanctuary-200 leading-relaxed font-medium">
              “தினமும் வேதம் வாசிப்பதற்கு முன்பாக சில நிமிடங்கள் ஆண்டவருடைய பாதத்தில் அமர்ந்து அவருடைய சத்தத்தைக் கேளுங்கள். கர்த்தர் உங்களை ஆசீர்வதிப்பாராக!”
            </p>
            <p className="font-scripture italic text-xs sm:text-sm text-sacred-700 dark:text-gold-400">
              “உமது வேதத்திலுள்ள அதிசயங்களை நான் பார்க்கும்படிக்கு என் கண்களைத் திறந்தருளும்” — சங்கீதம் 119:18
            </p>
          </div>

          <p className="text-xs sm:text-sm text-sanctuary-600 dark:text-sanctuary-300 leading-relaxed">
            Please open your physical Bible to today's assigned chapters. As you finish reading each chapter, tick it off below to track your progress and maintain your reading streak!
          </p>
        </div>

        {/* Assigned Chapters Checklist */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sanctuary-100 dark:border-sanctuary-800">
            <h3 className="font-cinzel text-base font-bold text-sanctuary-900 dark:text-sanctuary-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-600" />
              <span>Assigned Chapters for Day {dayData.day}</span>
            </h3>
            <span className="text-xs text-sanctuary-400">
              {dayData.chaptersCount} Chapters
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {dayData.chapters.map((ch) => {
              const chDone = progress.completedChapters.includes(ch.id);

              return (
                <div
                  key={ch.id}
                  onClick={() => handleChapterClick(ch.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                    chDone
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-400/60 dark:border-emerald-700/60'
                      : 'bg-sanctuary-50/60 dark:bg-sanctuary-800/60 border-sanctuary-200 dark:border-sanctuary-700 hover:border-gold-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        chDone
                          ? 'bg-emerald-600 text-white shadow-sm scale-105'
                          : 'border-2 border-sanctuary-300 dark:border-sanctuary-600 text-transparent group-hover:border-gold-500'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel text-lg font-bold text-sanctuary-900 dark:text-sanctuary-100">
                          {ch.englishRef}
                        </span>
                        <span className="font-tamil text-sm font-semibold text-sacred-700 dark:text-gold-400">
                          {ch.tamilRef}
                        </span>
                      </div>
                      <p className="text-xs text-sanctuary-500 dark:text-sanctuary-400 mt-0.5">
                        {chDone ? '✓ Completed in your Bible' : 'Tap to mark as read in your Bible'}
                      </p>
                    </div>
                  </div>

                  {/* Optional YouVersion Link */}
                  <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={ch.youversionTamilUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-sanctuary-700 border border-sanctuary-200 dark:border-sanctuary-600 text-[11px] font-semibold text-sanctuary-700 dark:text-sanctuary-200 hover:border-gold-500 flex items-center gap-1 transition-colors"
                      title="Open Tamil Bible in YouVersion"
                    >
                      <span>தமிழ்</span>
                      <ExternalLink className="w-3 h-3 text-gold-600" />
                    </a>
                    <a
                      href={ch.youversionEnglishUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-sanctuary-700 border border-sanctuary-200 dark:border-sanctuary-600 text-[11px] font-semibold text-sanctuary-700 dark:text-sanctuary-200 hover:border-gold-500 flex items-center gap-1 transition-colors"
                      title="Open English Bible in YouVersion"
                    >
                      <span>KJV</span>
                      <ExternalLink className="w-3 h-3 text-gold-600" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Prayer & Reflection Journal Note */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sacred-600" />
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-sanctuary-900 dark:text-sanctuary-100">
                {isTamil ? 'அனுதின ஜெபம் & தியானக் குறிப்புகள்' : 'Daily Prayer & Reflection Journal'}
              </h3>
            </div>
            {noteSaved && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </span>
            )}
          </div>

          <p className="text-xs text-sanctuary-500 dark:text-sanctuary-400">
            What is God speaking to your heart today through {dayData.englishSummary} ({dayData.tamilSummary})? Record your thoughts, prayer, and key verse.
          </p>

          <textarea
            rows={4}
            value={prayerNote}
            onChange={(e) => setPrayerNote(e.target.value)}
            placeholder="Write your personal reflections or prayer here..."
            className="w-full p-4 rounded-2xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100 leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSaveNote}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Reflection</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
