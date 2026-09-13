'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import {
  BookOpen,
  Sparkles,
  Flame,
  FileEdit,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Lock,
} from 'lucide-react';

interface AuthBarrierProps {
  targetDescription?: string;
}

export default function AuthBarrier({ targetDescription }: AuthBarrierProps) {
  const { loginWithGoogle, openAuthModal } = useAuth();
  const { lang } = useTheme();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isTamil = lang === 'ta';

  const handleGoogleClick = async () => {
    setIsSigningIn(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err?.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-sanctuary-texture">
      <div className="w-full max-w-lg bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden text-center transition-all">
        
        {/* Holy Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-gold-400/15 dark:bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sacred-600/10 dark:bg-sacred-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100/90 dark:bg-sanctuary-800/90 border border-gold-400/30 text-[11px] sm:text-xs font-semibold text-sanctuary-800 dark:text-gold-400 shadow-sm">
            <Lock className="w-3 h-3 text-gold-600" />
            <span>{isTamil ? 'அங்கீகரிக்கப்பட்ட வாசிப்புத் தளம்' : 'Sign-In Required'}</span>
          </div>

          {/* Central Logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-400 via-gold-500 to-sacred-700 flex items-center justify-center text-white shadow-glow-gold mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <h2 className="font-cinzel text-xl sm:text-2xl font-extrabold text-sanctuary-900 dark:text-sanctuary-50 tracking-tight">
              {isTamil
                ? 'உங்கள் 365 நாள் பயணத்தை அணுக உள்நுழையவும்'
                : 'Sign In to Access Your 365-Day Journey'}
            </h2>
            <p className="font-tamil text-xs sm:text-sm text-sacred-700 dark:text-gold-400 font-medium">
              {targetDescription
                ? (isTamil ? `${targetDescription} அணுக உங்கள் கணக்கில் உள்நுழையவும்.` : `Please sign in to view and save ${targetDescription}.`)
                : (isTamil ? 'அனுதினமும் தேவனுடைய வார்த்தையோடு இணைந்திருங்கள்.' : 'Walk day-by-day in God’s Holy Word.')}
            </p>
          </div>

          {/* Scripture Verse */}
          <div className="py-2.5 px-4 rounded-2xl bg-gold-500/10 dark:bg-sanctuary-800/60 border border-gold-400/20 text-center">
            <p className="font-scripture italic text-xs sm:text-sm text-sanctuary-800 dark:text-sanctuary-200">
              “Thy word is a lamp unto my feet, and a light unto my path.”
            </p>
            <p className="font-tamil text-[11px] sm:text-xs text-sanctuary-600 dark:text-sanctuary-400 mt-0.5">
              “உம்முடைய வசனம் என் கால்களுக்குத் தீபமும், என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது.” — சங் 119:105
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left py-1">
            <div className="p-3 rounded-xl bg-sanctuary-50 dark:bg-sanctuary-800/50 border border-sanctuary-200 dark:border-sanctuary-800 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-sanctuary-900 dark:text-sanctuary-100">
                  {isTamil ? 'காலவரிசை வாசிப்பு' : 'Chronological Plan'}
                </p>
                <p className="text-[10px] text-sanctuary-600 dark:text-sanctuary-400">
                  {isTamil ? '365 நாட்களுக்கான வழிகாட்டி' : 'Day 1 to 365 in history order'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sanctuary-50 dark:bg-sanctuary-800/50 border border-sanctuary-200 dark:border-sanctuary-800 flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-sanctuary-900 dark:text-sanctuary-100">
                  {isTamil ? 'வாசிப்புத் தொடர்' : 'Daily Streaks'}
                </p>
                <p className="text-[10px] text-sanctuary-600 dark:text-sanctuary-400">
                  {isTamil ? 'முடித்த அதிகாரங்கள் சேமிப்பு' : 'Track your consistency'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sanctuary-50 dark:bg-sanctuary-800/50 border border-sanctuary-200 dark:border-sanctuary-800 flex items-start gap-2.5">
              <FileEdit className="w-4 h-4 text-sacred-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-sanctuary-900 dark:text-sanctuary-100">
                  {isTamil ? 'ஜெபக் குறிப்புகள்' : 'Prayer Notes'}
                </p>
                <p className="text-[10px] text-sanctuary-600 dark:text-sanctuary-400">
                  {isTamil ? 'மேகக்கணியில் பாதுகாப்பு' : 'Saved privately in cloud'}
                </p>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-xs text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {/* 1-Tap Google Sign-In */}
            <button
              onClick={handleGoogleClick}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white dark:bg-sanctuary-800 border-2 border-sanctuary-200 dark:border-sanctuary-700 hover:border-gold-500 dark:hover:border-gold-500 text-sanctuary-900 dark:text-sanctuary-50 font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? (isTamil ? 'உள்நுழைகிறது...' : 'Connecting to Google...') : (isTamil ? 'கூகிள் மூலம் தொடரவும்' : 'Continue with Google')}</span>
            </button>

            {/* Email / Sign Up Option */}
            <button
              onClick={openAuthModal}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-600 to-sacred-700 text-white font-bold text-xs sm:text-sm shadow-glow-gold hover:opacity-95 transition-all active:scale-[0.98]"
            >
              <Mail className="w-4 h-4" />
              <span>{isTamil ? 'மின்னஞ்சல் மூலம் உள்நுழைக / பதிவு செய்க' : 'Sign In with Email / Register'}</span>
            </button>
          </div>

          {/* Return to Home link */}
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sanctuary-500 hover:text-sacred-700 dark:hover:text-gold-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isTamil ? 'முகப்புப் பக்கத்திற்குத் திரும்புக' : 'Return to Home Page'}</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
