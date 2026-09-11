'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import {
  Home,
  BookOpen,
  Calendar,
  Sparkles,
  User,
  ShieldCheck,
  Flame,
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, progress, isAuthenticated, isAdmin, openAuthModal } = useAuth();
  const { lang } = useTheme();

  const isTamil = lang === 'ta';

  const nextPendingDay = React.useMemo(() => {
    if (!progress || !progress.completedDays) return 1;
    for (let i = 1; i <= 365; i++) {
      if (!progress.completedDays.includes(i)) {
        return i;
      }
    }
    return 1;
  }, [progress?.completedDays]);

  const isHome = pathname === '/';
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/read');
  const isAdminPath = pathname.startsWith('/admin');

  return (
    <nav className="fixed bottom-0 inset-x-0 sm:bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md sm:w-full z-50 bg-white/95 dark:bg-sanctuary-950/95 theme-sepia:bg-[#FAF4E5]/95 backdrop-blur-xl border-t sm:border border-sanctuary-200 dark:border-sanctuary-800 theme-sepia:border-[#DECFA8] sm:rounded-2xl shadow-[0_-4px_25px_rgba(0,0,0,0.12)] sm:shadow-2xl pb-[max(env(safe-area-inset-bottom),10px)] sm:pb-2 pt-2 transition-all">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around">
        
        {/* 1. Home Tab */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isHome
              ? 'text-sacred-700 dark:text-gold-400 font-bold'
              : 'text-sanctuary-500 dark:text-sanctuary-400 hover:text-gold-600'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">
            {isTamil ? 'முகப்பு' : 'Home'}
          </span>
        </Link>

        {/* 2. Today's Reading Target Tab */}
        <Link
          href={`/dashboard?day=${nextPendingDay}`}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl relative transition-all ${
            isDashboard
              ? 'text-sacred-700 dark:text-gold-400 font-bold'
              : 'text-sanctuary-500 dark:text-sanctuary-400 hover:text-gold-600'
          }`}
        >
          <div className="relative">
            <BookOpen className={`w-5 h-5 ${isDashboard ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {progress.currentStreak > 0 && (
              <span className="absolute -top-1.5 -right-3 flex items-center gap-0.5 text-[9px] font-black bg-amber-500 text-white px-1 py-0.2 rounded-full shadow-sm">
                <Flame className="w-2.5 h-2.5 fill-white" />
                {progress.currentStreak}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">
            {isTamil ? 'இன்றைய இலக்கு' : 'Today'}
          </span>
        </Link>

        {/* 3. Full 365 Schedule Tab */}
        <Link
          href="/dashboard#reading-grid"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-sanctuary-500 dark:text-sanctuary-400 hover:text-gold-600 transition-all"
        >
          <Calendar className="w-5 h-5 stroke-2" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">
            {isTamil ? 'அட்டவணை' : '365 Plan'}
          </span>
        </Link>

        {/* 4. Bible Facts Tab */}
        <Link
          href="/#facts"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-sanctuary-500 dark:text-sanctuary-400 hover:text-gold-600 transition-all"
        >
          <Sparkles className="w-5 h-5 stroke-2" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">
            {isTamil ? 'உண்மைகள்' : 'Facts'}
          </span>
        </Link>

        {/* 5. User Profile / Admin Tab */}
        {isAdmin ? (
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isAdminPath
                ? 'text-sacred-700 dark:text-gold-400 font-bold'
                : 'text-sanctuary-500 dark:text-sanctuary-400 hover:text-sacred-700'
            }`}
          >
            <ShieldCheck className="w-5 h-5 stroke-2" />
            <span className="text-[10px] tracking-tight mt-0.5 font-medium">
              Admin
            </span>
          </Link>
        ) : isAuthenticated ? (
          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-sanctuary-500 dark:text-sanctuary-400 hover:text-gold-600 transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-medium truncate max-w-[50px]">
              {user?.name?.split(' ')[0] || 'Profile'}
            </span>
          </Link>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gold-600 dark:text-gold-400 font-semibold"
          >
            <User className="w-5 h-5 stroke-2" />
            <span className="text-[10px] tracking-tight mt-0.5">
              {isTamil ? 'உள்நுழைக' : 'Sign In'}
            </span>
          </button>
        )}

      </div>
    </nav>
  );
}
