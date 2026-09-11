'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import planData from '@/data/readingPlan.json';
import {
  Search,
  CheckCircle2,
  Circle,
  BookOpen,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Flame,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReadingPlanGrid() {
  const { progress, toggleDay, toggleChapter, isAuthenticated, openAuthModal } = useAuth();
  const { lang } = useTheme();

  // Find next uncompleted day (Today's default target)
  const nextPendingDay = useMemo(() => {
    if (!progress || !progress.completedDays) return 1;
    for (let i = 1; i <= 365; i++) {
      if (!progress.completedDays.includes(i)) {
        return i;
      }
    }
    return 1;
  }, [progress?.completedDays]);

  // Calculate Calendar Day of Year
  const calendarDayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.min(365, Math.max(1, dayOfYear));
  }, []);

  const [activeDayNum, setActiveDayNum] = useState<number>(nextPendingDay);
  const [hasUserManuallySelectedDay, setHasUserManuallySelectedDay] = useState(false);
  const [showCompletedSection, setShowCompletedSection] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // Sync activeDayNum with nextPendingDay when user progress changes / loads from Firestore
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dayParam = params.get('day');
      if (dayParam) {
        const parsed = parseInt(dayParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 365) {
          setActiveDayNum(parsed);
          setHasUserManuallySelectedDay(true);
          return;
        }
      }
    }
    if (!hasUserManuallySelectedDay) {
      setActiveDayNum(nextPendingDay);
    }
  }, [nextPendingDay, hasUserManuallySelectedDay]);

  // Filters for the full schedule (when expanded)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');

  const isTamil = lang === 'ta';

  const periods = [
    { id: 'all', nameEn: 'All 365 Days', nameTa: 'அனைத்து நாட்கள்' },
    { id: 'patriarchs', nameEn: 'Patriarchs (1-40)', nameTa: 'முற்பிதாக்கள்' },
    { id: 'exodus', nameEn: 'Exodus & Law (41-80)', nameTa: 'யாத்திராகமம்' },
    { id: 'conquest', nameEn: 'Promised Land (81-120)', nameTa: 'வாக்குத்தத்த தேசம்' },
    { id: 'united_kingdom', nameEn: 'Kingdom & Psalms (121-170)', nameTa: 'ராஜ்யம் & சங்கீதம்' },
    { id: 'divided_kingdom', nameEn: 'Prophets (171-230)', nameTa: 'தீர்க்கதரிசிகள்' },
    { id: 'exile_return', nameEn: 'Exile & Return (231-270)', nameTa: 'மறுமலர்ச்சி' },
    { id: 'gospels', nameEn: 'Gospels (271-315)', nameTa: 'சுவிசேஷம்' },
    { id: 'epistles', nameEn: 'Epistles (316-355)', nameTa: 'நிருபங்கள்' },
    { id: 'revelation', nameEn: 'Revelation (356-365)', nameTa: 'வெளிப்படுத்தின விசேஷம்' },
  ];

  // Active target day data
  const currentDayData = planData.days.find((d) => d.day === activeDayNum) || planData.days[0];
  const isTargetCompleted = progress.completedDays.includes(currentDayData.day);

  // Completed days list
  const completedDaysList = useMemo(() => {
    return planData.days.filter((d) => progress.completedDays.includes(d.day));
  }, [progress.completedDays]);

  // Full filtered days
  const filteredDays = useMemo(() => {
    return planData.days.filter((d) => {
      if (selectedPeriod !== 'all' && d.period.id !== selectedPeriod) return false;
      const isCompleted = progress.completedDays.includes(d.day);
      if (statusFilter === 'completed' && !isCompleted) return false;
      if (statusFilter === 'pending' && isCompleted) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesDay = d.day.toString() === query || `day ${d.day}`.includes(query);
        const matchesEnglish = d.englishSummary.toLowerCase().includes(query);
        const matchesTamil = d.tamilSummary.toLowerCase().includes(query);
        if (!matchesDay && !matchesEnglish && !matchesTamil) return false;
      }
      return true;
    });
  }, [selectedPeriod, statusFilter, searchQuery, progress.completedDays]);

  const handleToggleDay = (e: React.MouseEvent, dayNum: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const willComplete = !progress.completedDays.includes(dayNum);
    toggleDay(dayNum);
    if (willComplete) {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#D4AF37', '#E6C85E', '#BA3142', '#FAF8F5'],
      });
      // If user marks the active day complete, smoothly advance to the next day
      if (dayNum === activeDayNum && dayNum < 365) {
        setTimeout(() => {
          setActiveDayNum(dayNum + 1);
        }, 500);
      }
    }
  };

  const handleToggleChapter = (dayNum: number, chapterId: string) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    toggleChapter(dayNum, chapterId);
  };

  return (
    <section id="reading-grid" className="space-y-6">

      {/* ========================================================== */}
      {/* 🌟 1. TODAY'S TARGET ALONE (DEFAULT ACTIVE VIEW - NO SCROLL) */}
      {/* ========================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gold-50/90 via-white to-sanctuary-50 dark:from-sanctuary-900 dark:via-sanctuary-900 dark:to-sanctuary-950 border-2 border-gold-400/60 shadow-lg relative overflow-hidden">
        
        {/* Sacred background ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Target Day Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-gold-200/60 dark:border-sanctuary-800">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-900 dark:text-gold-300 text-xs font-extrabold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>{isTamil ? 'இன்றைய வாசிப்பு இலக்கு' : "TODAY'S READING TARGET"}</span>
              <span>• Day {currentDayData.day}</span>
            </div>

            {/* Jump to Next Unread Day button if browsing another day */}
            {activeDayNum !== nextPendingDay && (
              <button
                onClick={() => {
                  setActiveDayNum(nextPendingDay);
                  setHasUserManuallySelectedDay(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold transition-all shadow-sm hover:bg-amber-600"
                title="Jump to your next uncompleted day"
              >
                <Flame className="w-3 h-3 fill-white" />
                <span>Jump to Next Day ({nextPendingDay})</span>
              </button>
            )}

            {/* Quick switcher to Calendar Day of Year */}
            <button
              onClick={() => {
                setActiveDayNum(calendarDayOfYear);
                setHasUserManuallySelectedDay(true);
              }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                activeDayNum === calendarDayOfYear
                  ? 'bg-gold-500 text-white border-gold-500 font-bold'
                  : 'bg-white/80 dark:bg-sanctuary-800 border-sanctuary-200 dark:border-sanctuary-700 text-sanctuary-600 dark:text-sanctuary-400 hover:border-gold-400'
              }`}
              title={`Jump to calendar day of year: Day ${calendarDayOfYear}`}
            >
              <Calendar className="w-3 h-3 text-gold-600" />
              <span>Calendar Day {calendarDayOfYear}</span>
            </button>
          </div>

          {/* Quick day switcher (< Prev | Next >) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setHasUserManuallySelectedDay(true);
                setActiveDayNum((prev) => Math.max(1, prev - 1));
              }}
              disabled={activeDayNum <= 1}
              className="p-1.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-white dark:bg-sanctuary-800 text-sanctuary-600 disabled:opacity-30 hover:border-gold-400 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-sanctuary-700 dark:text-sanctuary-300 px-1">
              {currentDayData.day} / 365
            </span>
            <button
              onClick={() => {
                setHasUserManuallySelectedDay(true);
                setActiveDayNum((prev) => Math.min(365, prev + 1));
              }}
              disabled={activeDayNum >= 365}
              className="p-1.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-white dark:bg-sanctuary-800 text-sanctuary-600 disabled:opacity-30 hover:border-gold-400 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Target Header */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-sanctuary-500 dark:text-sanctuary-400">
            <span>Period:</span>
            <span className="font-semibold text-sanctuary-800 dark:text-sanctuary-200">
              {isTamil ? currentDayData.period.nameTa : currentDayData.period.nameEn}
            </span>
            <span>•</span>
            <span>{currentDayData.chaptersCount} chapters</span>
            {isTargetCompleted && (
              <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Completed</span>
              </span>
            )}
          </div>

          <h2 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-sanctuary-900 dark:text-sanctuary-50 tracking-tight">
            {currentDayData.englishSummary}
          </h2>

          <p className="font-tamil text-base sm:text-xl text-sacred-700 dark:text-gold-400 font-semibold">
            {currentDayData.tamilSummary}
          </p>
        </div>

        {/* Assigned Chapters Interactive Checkboxes */}
        <div className="space-y-2 mb-6">
          <p className="text-xs font-bold text-sanctuary-600 dark:text-sanctuary-300 uppercase tracking-wider">
            {isTamil ? 'அதிகாரங்கள் (வாசித்து முடித்தவுடன் குறிக்கவும்)' : 'Assigned Chapters (Read from your Bible & tick off)'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {currentDayData.chapters.map((ch) => {
              const isChapterDone = progress.completedChapters.includes(ch.id);
              return (
                <button
                  key={ch.id}
                  onClick={() => handleToggleChapter(currentDayData.day, ch.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                    isChapterDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'bg-white dark:bg-sanctuary-800/80 border-sanctuary-200 dark:border-sanctuary-700 text-sanctuary-800 dark:text-sanctuary-100 hover:border-gold-400'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs sm:text-sm block">
                      {ch.englishRef}
                    </span>
                    <span className="text-[11px] font-tamil text-sanctuary-500 dark:text-sanctuary-400 block">
                      {ch.tamilRef}
                    </span>
                  </div>
                  {isChapterDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-sanctuary-300 hover:text-gold-500 shrink-0 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Read in My Bible or Mark Day Complete */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href={`/read/${currentDayData.day}`}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-600 to-sacred-700 text-white font-semibold text-sm shadow-glow-gold hover:opacity-95 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>{isTamil ? 'வேத வாசிப்பு & குறிப்புகள்' : "Open in My Bible & Notes"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={(e) => handleToggleDay(e, currentDayData.day)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl border text-sm font-semibold transition-all active:scale-98 ${
              isTargetCompleted
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-sanctuary-800 border-sanctuary-300 dark:border-sanctuary-700 text-sanctuary-800 dark:text-sanctuary-200 hover:border-gold-500'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isTargetCompleted ? 'text-emerald-600' : 'text-sanctuary-400'}`} />
            <span>
              {isTargetCompleted
                ? (isTamil ? 'முடிந்தது ✓' : 'Completed ✓')
                : (isTamil ? 'இன்றைய இலக்கை முடிக்க' : `Mark Day ${currentDayData.day} Done`)}
            </span>
          </button>
        </div>

      </div>

      {/* ========================================================== */}
      {/* 🔘 2. SELECTOR BUTTONS TO REVEAL COMPLETED DAYS OR FULL SCHEDULE */}
      {/* ========================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        
        {/* Button: View Completed Days */}
        <button
          onClick={() => setShowCompletedSection(!showCompletedSection)}
          className={`w-full sm:w-auto px-5 py-3 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 ${
            showCompletedSection
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white dark:bg-sanctuary-900 border-sanctuary-300 dark:border-sanctuary-700 text-sanctuary-800 dark:text-sanctuary-200 hover:border-emerald-500 shadow-sm'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            {showCompletedSection
              ? (isTamil ? 'முடிந்த நாட்களை மறைக்க' : 'Hide Completed Days')
              : (isTamil ? `முடிந்த நாட்கள் (${completedDaysList.length})` : `View Completed Days (${completedDaysList.length})`)}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCompletedSection ? 'rotate-180' : ''}`} />
        </button>

        {/* Button: Browse Full 365-Day Schedule & Upcoming Days */}
        <button
          onClick={() => setShowFullSchedule(!showFullSchedule)}
          className={`w-full sm:w-auto px-5 py-3 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 ${
            showFullSchedule
              ? 'bg-gold-500 text-white border-gold-500 shadow-md'
              : 'bg-white dark:bg-sanctuary-900 border-sanctuary-300 dark:border-sanctuary-700 text-sanctuary-800 dark:text-sanctuary-200 hover:border-gold-500 shadow-sm'
          }`}
        >
          <Calendar className="w-4 h-4 text-gold-600 shrink-0" />
          <span>
            {showFullSchedule
              ? (isTamil ? 'முழு அட்டவணையை மறைக்க' : 'Hide Full 365-Day Schedule')
              : (isTamil ? 'அனைத்து 365 நாட்கள் & அடுத்த அட்டவணை' : 'Browse All 365 Days & Upcoming')}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFullSchedule ? 'rotate-180' : ''}`} />
        </button>

      </div>

      {/* ========================================================== */}
      {/* 📜 3. COMPLETED DAYS SECTION (EXPANDED ON DEMAND ONLY) */}
      {/* ========================================================== */}
      {showCompletedSection && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-emerald-400/40 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-sanctuary-200 dark:border-sanctuary-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-cinzel text-lg font-bold text-sanctuary-900 dark:text-sanctuary-100">
                {isTamil ? 'நீங்கள் வாசித்து முடித்த நாட்கள்' : 'Your Completed Scripture Days'}
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {completedDaysList.length} / 365
            </span>
          </div>

          {completedDaysList.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-sanctuary-500">
                {isTamil ? 'நீங்கள் இன்னும் எந்த நாளையும் முடிக்கவில்லை. இன்றைய இலக்கை ஆரம்பியுங்கள்!' : 'You have not completed any days yet. Complete Day 1 to begin!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedDaysList.map((d) => (
                <div
                  key={d.day}
                  onClick={() => setActiveDayNum(d.day)}
                  className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Day {d.day}
                    </span>
                    <h4 className="font-cinzel text-sm font-semibold text-sanctuary-900 dark:text-sanctuary-100 truncate max-w-[200px]">
                      {d.englishSummary}
                    </h4>
                    <p className="text-xs font-tamil text-sanctuary-500 truncate max-w-[200px]">
                      {d.tamilSummary}
                    </p>
                  </div>
                  <Link
                    href={`/read/${d.day}`}
                    className="p-2 rounded-xl bg-white dark:bg-sanctuary-800 text-emerald-600 hover:text-emerald-700"
                    title="View Notes & Chapters"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 🗓️ 4. FULL 365-DAY SCHEDULE (EXPANDED ON DEMAND ONLY) */}
      {/* ========================================================== */}
      {showFullSchedule && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Controls Bar */}
          <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm space-y-4">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-sanctuary-900 dark:text-sanctuary-100 flex items-center gap-2">
                  <span>{isTamil ? '365 நாள் காலவரிசை முழு அட்டவணை' : 'Full 365-Day Chronological Schedule'}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold-100 dark:bg-sanctuary-800 text-gold-700 dark:text-gold-400">
                    {filteredDays.length} Days
                  </span>
                </h3>
                <p className="text-xs text-sanctuary-500 dark:text-sanctuary-400 mt-0.5">
                  Click any day to inspect chapters, notes, or set as today’s focus
                </p>
              </div>

              {/* View Toggle & Status Filter */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-sanctuary-100 dark:bg-sanctuary-800 rounded-xl p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === 'all' ? 'bg-white dark:bg-sanctuary-700 shadow-sm text-sanctuary-900 dark:text-white font-bold' : 'text-sanctuary-500'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === 'completed' ? 'bg-white dark:bg-sanctuary-700 shadow-sm text-emerald-600 font-bold' : 'text-sanctuary-500'
                    }`}
                  >
                    Done ({progress.completedDays.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === 'pending' ? 'bg-white dark:bg-sanctuary-700 shadow-sm text-amber-600 font-bold' : 'text-sanctuary-500'
                    }`}
                  >
                    Pending ({365 - progress.completedDays.length})
                  </button>
                </div>

                <div className="flex items-center bg-sanctuary-100 dark:bg-sanctuary-800 rounded-xl p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      viewMode === 'cards' ? 'bg-white dark:bg-sanctuary-700 shadow-sm text-sanctuary-900 dark:text-white font-bold' : 'text-sanctuary-500'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      viewMode === 'compact' ? 'bg-white dark:bg-sanctuary-700 shadow-sm text-sanctuary-900 dark:text-white font-bold' : 'text-sanctuary-500'
                    }`}
                  >
                    Compact
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Period Chips */}
            <div className="flex flex-col lg:flex-row items-center gap-3 pt-2 border-t border-sanctuary-100 dark:border-sanctuary-800">
              
              {/* Search Box */}
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 text-sanctuary-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search day or book (e.g. Job, யோபு, 45)..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                />
              </div>

              {/* Period Filter Horizontal Scroll */}
              <div className="w-full overflow-x-auto flex items-center gap-1.5 pb-1 text-xs">
                {periods.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPeriod(p.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      selectedPeriod === p.id
                        ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold shadow-sm'
                        : 'bg-sanctuary-100 dark:bg-sanctuary-800 text-sanctuary-600 dark:text-sanctuary-300 hover:bg-gold-50'
                    }`}
                  >
                    {isTamil ? p.nameTa : p.nameEn}
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* Cards View */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDays.map((d) => {
                const isDone = progress.completedDays.includes(d.day);
                const chaptersCompletedInDay = d.chapters.filter((c) =>
                  progress.completedChapters.includes(c.id)
                ).length;

                return (
                  <div
                    key={d.day}
                    onClick={() => {
                      setActiveDayNum(d.day);
                      // smooth scroll to top target
                      document.getElementById('reading-grid')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                      isDone
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-sm'
                        : 'bg-white dark:bg-sanctuary-900 border-sanctuary-200 dark:border-sanctuary-800 hover:border-gold-400 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-gold-100 dark:bg-sanctuary-800 text-gold-800 dark:text-gold-300'
                          }`}
                        >
                          Day {d.day}
                        </span>

                        <span className="text-[11px] text-sanctuary-400 font-medium">
                          {isTamil ? d.period.nameTa : d.period.nameEn}
                        </span>
                      </div>

                      <h4 className="font-cinzel text-base font-bold text-sanctuary-900 dark:text-sanctuary-100 leading-snug mb-1">
                        {d.englishSummary}
                      </h4>

                      <p className="font-tamil text-xs text-sacred-700 dark:text-gold-400 font-medium mb-3">
                        {d.tamilSummary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-sanctuary-100 dark:border-sanctuary-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-sanctuary-500">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>
                          {chaptersCompletedInDay}/{d.chaptersCount} chapters
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/read/${d.day}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                          Read
                        </Link>
                        <button
                          onClick={(e) => handleToggleDay(e, d.day)}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-sanctuary-300 text-sanctuary-400 hover:text-gold-600 hover:border-gold-400'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Compact Grid View */
            <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm">
              <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
                {filteredDays.map((d) => {
                  const isDone = progress.completedDays.includes(d.day);
                  return (
                    <button
                      key={d.day}
                      onClick={() => {
                        setActiveDayNum(d.day);
                        document.getElementById('reading-grid')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      title={`Day ${d.day}: ${d.englishSummary}`}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center font-cinzel text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-sanctuary-100 dark:bg-sanctuary-800 text-sanctuary-700 dark:text-sanctuary-300 hover:bg-gold-100 hover:text-gold-700'
                      }`}
                    >
                      <span>{d.day}</span>
                      {isDone && <Check className="w-2.5 h-2.5 -mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </section>
  );
}
