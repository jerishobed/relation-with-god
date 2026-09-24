'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/themeContext';
import { useAuth } from '@/lib/authContext';
import {
  BookOpen,
  Flame,
  Sun,
  Moon,
  Sparkles,
  User,
  ShieldCheck,
  Languages,
  Gift,
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from '@/components/SocialIcons';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, lang, setLang } = useTheme();
  const { user, progress, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();

  const isTamil = lang === 'ta';
  const isEn = lang === 'en';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-sanctuary-950/85 theme-sepia:bg-[#FAF4E5]/90 border-b border-sanctuary-200 dark:border-sanctuary-800 theme-sepia:border-[#DECFA8] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand & Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-sacred-700 flex items-center justify-center text-white shadow-glow-gold group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-sanctuary-900 dark:text-sanctuary-50 theme-sepia:text-[#3B2E1E] group-hover:text-gold-600 transition-colors">
                RELATION WITH GOD
              </span>
              <span className="text-[11px] font-tamil font-medium text-sacred-700 dark:text-gold-400 tracking-wide">
                தேவனோடு அனுதின உறவு • 365 Days
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === '/'
                  ? 'text-sacred-700 dark:text-gold-400 font-semibold bg-gold-100/50 dark:bg-sanctuary-800/60'
                  : 'text-sanctuary-700 dark:text-sanctuary-300 hover:text-gold-600'
              }`}
            >
              {isTamil ? 'முகப்பு' : 'Home'}
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith('/dashboard')
                  ? 'text-sacred-700 dark:text-gold-400 font-semibold bg-gold-100/50 dark:bg-sanctuary-800/60'
                  : 'text-sanctuary-700 dark:text-sanctuary-300 hover:text-gold-600'
              }`}
            >
              <span>{isTamil ? 'என் வாசிப்பு' : 'My 365 Journey'}</span>
              {progress.currentStreak > 0 && (
                <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-full">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {progress.currentStreak}d
                </span>
              )}
            </Link>

            <Link
              href="/#facts"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-sanctuary-700 dark:text-sanctuary-300 hover:text-gold-600 transition-colors"
            >
              {isTamil ? 'வேதாகம உண்மைகள்' : 'Bible Facts'}
            </Link>

            <Link
              href="/booklet"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith('/booklet')
                  ? 'text-sacred-700 dark:text-gold-400 font-semibold bg-gold-100/50 dark:bg-sanctuary-800/60'
                  : 'text-sanctuary-700 dark:text-sanctuary-300 hover:text-gold-600'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-gold-600" />
              <span>{isTamil ? 'இலவச புத்தகம்' : 'Free Booklet'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-gold-500 text-white text-[9px] font-extrabold uppercase">
                Free
              </span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  pathname.startsWith('/admin')
                    ? 'bg-sacred-700 text-white'
                    : 'bg-sacred-100 dark:bg-sacred-950/70 text-sacred-800 dark:text-sacred-300 hover:bg-sacred-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Social Channels & Controls */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Social Links */}
            <a
              href="https://www.youtube.com/@relationswithgod"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="YouTube @relationswithgod"
            >
              <YoutubeIcon className="w-5 h-5" />
            </a>

            <a
              href="https://www.instagram.com/relations_with_god/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-colors"
              title="Instagram @relations_with_god"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>

            <div className="h-5 w-[1px] bg-sanctuary-200 dark:bg-sanctuary-800 mx-1" />

            {/* Language Switcher */}
            <div className="flex items-center bg-sanctuary-100 dark:bg-sanctuary-900 rounded-lg p-0.5 border border-sanctuary-200 dark:border-sanctuary-800 text-xs font-medium">
              <button
                onClick={() => setLang('ta')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  lang === 'ta' ? 'bg-gold-500 text-white font-semibold' : 'text-sanctuary-600 dark:text-sanctuary-300'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLang('bilingual')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  lang === 'bilingual' ? 'bg-gold-500 text-white font-semibold' : 'text-sanctuary-600 dark:text-sanctuary-300'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  lang === 'en' ? 'bg-gold-500 text-white font-semibold' : 'text-sanctuary-600 dark:text-sanctuary-300'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center bg-sanctuary-100 dark:bg-sanctuary-900 rounded-lg p-0.5 border border-sanctuary-200 dark:border-sanctuary-800">
              <button
                onClick={() => setTheme('sanctuary')}
                className={`p-1.5 rounded-md transition-colors ${
                  theme === 'sanctuary' ? 'bg-white shadow-sm text-gold-600' : 'text-sanctuary-500'
                }`}
                title="Parchment Day"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1.5 rounded-md transition-colors ${
                  theme === 'sepia' ? 'bg-[#F4ECD8] shadow-sm text-amber-800' : 'text-sanctuary-500'
                }`}
                title="Sepia Devotional"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('midnight')}
                className={`p-1.5 rounded-md transition-colors ${
                  theme === 'midnight' ? 'bg-sanctuary-800 text-gold-400' : 'text-sanctuary-500'
                }`}
                title="Midnight Sanctuary"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Auth / Profile */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-sanctuary-100 dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 hover:border-gold-400 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium max-w-[100px] truncate text-sanctuary-900 dark:text-sanctuary-100">
                    {user?.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-sanctuary-500 hover:text-sacred-700 transition-colors"
                  title="Sign Out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white text-xs font-semibold shadow-glow-gold hover:shadow-md transition-all active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>{isTamil ? 'உள்நுழைக' : 'Sign In'}</span>
              </button>
            )}
          </div>

          {/* Mobile Quick Controls (Lang, Theme, Auth) */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={() => setLang(lang === 'ta' ? 'en' : 'ta')}
              className="px-2 py-1 text-xs font-bold rounded-lg bg-sanctuary-100 dark:bg-sanctuary-800 text-gold-600 dark:text-gold-400"
              title="Toggle Language"
            >
              {lang === 'ta' ? 'EN' : 'தமிழ்'}
            </button>

            <button
              onClick={() => setTheme(theme === 'midnight' ? 'sanctuary' : 'midnight')}
              className="p-1.5 rounded-lg text-sanctuary-700 dark:text-sanctuary-200 hover:bg-sanctuary-100 dark:hover:bg-sanctuary-900"
              title="Toggle Theme"
            >
              {theme === 'midnight' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/dashboard"
                  className="w-7 h-7 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold text-xs shadow-sm"
                  title={user?.name}
                >
                  {user?.name.charAt(0).toUpperCase()}
                </Link>
                <button
                  onClick={logout}
                  className="text-[11px] font-semibold text-sanctuary-500 hover:text-sacred-700 px-1 py-0.5"
                  title="Sign Out"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-2.5 py-1 rounded-lg bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold shadow-sm active:scale-95"
              >
                {isTamil ? 'உள்நுழைக' : 'Sign In'}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
