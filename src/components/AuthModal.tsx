'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { X, BookOpen, User, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return;

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      const code = err.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please try again.');
      } else if (code === 'auth/user-not-found') {
        setError('No account found with this email. Please switch to Sign Up.');
      } else if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please Sign In instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-sanctuary-900 theme-sepia:bg-[#FAF4E5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gold-400/40 transition-all">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-sanctuary-400 hover:text-sanctuary-700 dark:hover:text-sanctuary-200 hover:bg-sanctuary-100 dark:hover:bg-sanctuary-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-400 via-gold-500 to-sacred-700 flex items-center justify-center text-white shadow-glow-gold mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-sanctuary-900 dark:text-sanctuary-100">
            {isSignUp ? 'Begin Your 365-Day Walk' : 'Welcome Back Devotee'}
          </h3>
          <p className="text-xs text-sanctuary-600 dark:text-sanctuary-400 font-tamil mt-1">
            தேவனோடு அனுதினமும் இணைந்து வாசியுங்கள்
          </p>
        </div>

        {/* Google 1-Tap Firebase Auth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-sanctuary-300 dark:border-sanctuary-700 bg-white dark:bg-sanctuary-800 text-sm font-semibold text-sanctuary-800 dark:text-sanctuary-100 hover:bg-sanctuary-50 dark:hover:bg-sanctuary-750 transition-all shadow-sm mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-sanctuary-200 dark:border-sanctuary-800" />
          <span className="px-3 text-[11px] uppercase tracking-wider text-sanctuary-400">
            or with email
          </span>
          <div className="flex-grow border-t border-sanctuary-200 dark:border-sanctuary-800" />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1">
                Your Full Name (உங்கள் பெயர்)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-sanctuary-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Obed"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1">
              Email Address (மின்னஞ்சல்)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-sanctuary-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1">
              Password (கடவுச்சொல்)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-sanctuary-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-sacred-700 text-white font-semibold text-sm shadow-glow-gold hover:opacity-95 transition-all mt-2 active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Please wait...' : isSignUp ? 'Create 365 Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-sanctuary-600 dark:text-sanctuary-400 hover:text-gold-600 font-medium transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign In here'
              : 'New to Relation With God? Create an Account'}
          </button>
        </div>

      </div>
    </div>
  );
}
