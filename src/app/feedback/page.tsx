'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import { submitFeedback } from '@/lib/firestoreService';
import { FeedbackCategory } from '@/types';
import confetti from 'canvas-confetti';
import {
  MessageSquareHeart,
  Send,
  CheckCircle2,
  Star,
  Sparkles,
  ArrowRight,
  Heart,
  HelpCircle,
  Lightbulb,
  Compass,
  BookOpen,
} from 'lucide-react';

export default function FeedbackPage() {
  const { user } = useAuth();
  const { lang } = useTheme();
  const isTamil = lang === 'ta';

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState<FeedbackCategory>('testimonial');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (!fullName && user.name) setFullName(user.name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanMessage = message.trim();
    if (!cleanMessage) {
      setErrorMessage(
        isTamil
          ? 'தயவுசெய்து உங்கள் கருத்து அல்லது சாட்சியை உள்ளிடவும்.'
          : 'Please enter your message or reflection.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitFeedback({
        fullName: fullName.trim() || 'Anonymous Believer',
        email: email.trim(),
        category,
        rating,
        message: cleanMessage,
        userId: user?.id || null,
      });

      if (res.success) {
        setIsSuccess(true);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#C59A45', '#7A1C1C', '#2E5A31', '#F59E0B'],
          });
        } catch {}
      } else {
        setErrorMessage(res.error || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { id: FeedbackCategory; titleTa: string; titleEn: string; icon: any; color: string }[] = [
    {
      id: 'testimonial',
      titleTa: 'சாட்சி & ஆவிக்குரிய ஆசீர்வாதம்',
      titleEn: 'Testimonial & Spiritual Blessing',
      icon: Heart,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40',
    },
    {
      id: 'suggestion',
      titleTa: 'இணையதள ஆலோசனை & யோசனை',
      titleEn: 'Website Feedback & Suggestion',
      icon: Lightbulb,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40',
    },
    {
      id: 'prayer_request',
      titleTa: 'ஜெப விண்ணப்பம்',
      titleEn: 'Prayer Request',
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/40',
    },
    {
      id: 'question',
      titleTa: 'கேள்வி அல்லது உதவி',
      titleEn: 'Question or Help',
      icon: HelpCircle,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40',
    },
  ];

  return (
    <div className="min-h-screen bg-sanctuary-50 dark:bg-sanctuary-950 text-sanctuary-900 dark:text-sanctuary-100 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-sanctuary-500 mb-6 font-medium">
          <Link href="/" className="hover:text-gold-600 transition-colors">
            {isTamil ? 'முகப்பு' : 'Home'}
          </Link>
          <span>/</span>
          <span className="text-sanctuary-800 dark:text-sanctuary-200">
            {isTamil ? 'உங்கள் கருத்துக்கள்' : 'Feedback & Reflections'}
          </span>
        </div>

        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sacred-700 to-gold-500 text-white shadow-lg shadow-sacred-700/20 mb-4">
            <MessageSquareHeart className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-sanctuary-900 dark:text-sanctuary-100">
            {isTamil ? 'உங்கள் கருத்துக்கள் & சாட்சிகள்' : 'Share Your Feedback & Testimony'}
          </h1>
          <p className="mt-2 text-sm text-sanctuary-600 dark:text-sanctuary-400 max-w-lg mx-auto leading-relaxed">
            {isTamil
              ? 'இந்த வேதாகம வாசிப்பு தளம் உங்களுக்கு எவ்வகையில் ஆசீர்வாதமாக இருந்தது? மேலும் என்ன வசதிகள் தேவை? உங்கள் எண்ணங்களை எங்களோடு பகிருங்கள்.'
              : 'How has this chronological Bible journey blessed your walk with God? Let us know your reflections, prayer requests, or suggestions.'}
          </p>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 p-8 sm:p-10 shadow-xl text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-bold font-cinzel text-sanctuary-900 dark:text-sanctuary-100 mb-2">
              {isTamil ? 'மிக்க நன்றி! சமர்ப்பிக்கப்பட்டது 🙏' : 'Thank You! Received with Joy 🙏'}
            </h2>

            <p className="text-sm text-sanctuary-600 dark:text-sanctuary-300 leading-relaxed mb-6 max-w-md mx-auto">
              {isTamil
                ? 'உங்கள் கருத்து மற்றும் சாட்சி தேவனுடைய நாமத்தை மகிமைப்படுத்துகிறது. சக விசுவாசிகளுக்கு சிறந்த வாசிப்பு அனுபவத்தை உருவாக்க இது பெரிதும் உதவும்.'
                : 'Your feedback and testimony encourage our ministry greatly. May the Lord continue to guide and bless your daily time in His Holy Word.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sacred-700 to-gold-600 hover:from-sacred-800 hover:to-gold-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>{isTamil ? 'டேஷ்போர்டுக்கு செல்லவும்' : 'Go to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setMessage('');
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-sanctuary-100 dark:bg-sanctuary-800 hover:bg-sanctuary-200 dark:hover:bg-sanctuary-700 text-sanctuary-800 dark:text-sanctuary-200 text-sm font-semibold transition-colors"
              >
                {isTamil ? 'மற்றொரு கருத்தைப் பகிர' : 'Submit Another'}
              </button>
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <div className="rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 p-6 sm:p-8 shadow-xl">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sanctuary-700 dark:text-sanctuary-300 mb-3">
                  {isTamil ? 'கருத்தின் வகை (Category)' : 'Feedback Type'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'border-sacred-600 bg-sacred-50/70 dark:bg-sacred-950/40 ring-2 ring-sacred-500/30'
                            : 'border-sanctuary-200 dark:border-sanctuary-800 hover:border-sanctuary-300 dark:hover:border-sanctuary-700 bg-sanctuary-50/50 dark:bg-sanctuary-950/30'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${cat.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${isSelected ? 'text-sacred-800 dark:text-sacred-300' : 'text-sanctuary-800 dark:text-sanctuary-200'}`}>
                            {isTamil ? cat.titleTa : cat.titleEn}
                          </p>
                          <p className="text-[11px] text-sanctuary-500 truncate">
                            {isTamil ? cat.titleEn : cat.titleTa}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating Component */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sanctuary-700 dark:text-sanctuary-300 mb-2">
                  {isTamil ? 'உங்கள் அனுபவம் (Overall Experience)' : 'Your Overall Experience'}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-sanctuary-300 dark:text-sanctuary-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-sanctuary-600 dark:text-sanctuary-400 ml-2">
                    {rating === 5 && (isTamil ? 'மிகச்சிறந்தது (Excellent)' : 'Excellent')}
                    {rating === 4 && (isTamil ? 'நல்லது (Very Good)' : 'Very Good')}
                    {rating === 3 && (isTamil ? 'நன்று (Good)' : 'Good')}
                    {rating <= 2 && (isTamil ? 'மேம்பாடு தேவை (Needs Improvement)' : 'Needs Improvement')}
                  </span>
                </div>
              </div>

              {/* Message Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sanctuary-700 dark:text-sanctuary-300 mb-2">
                  {isTamil ? 'உங்கள் கருத்து / சாட்சி / ஜெப விண்ணப்பம் *' : 'Your Message, Testimony or Prayer Request *'}
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isTamil
                      ? 'உங்கள் ஆவிக்குரிய அனுபவத்தை அல்லது இந்த இணையதளத்திற்கான உங்கள் மேலான ஆலோசனைகளை இங்கே எழுதவும்...'
                      : 'Share your thoughts, experiences, encouragement, or any features you would love to see...'
                  }
                  required
                  className="w-full rounded-2xl bg-sanctuary-50 dark:bg-sanctuary-950 border border-sanctuary-200 dark:border-sanctuary-800 p-4 text-sm text-sanctuary-900 dark:text-sanctuary-100 placeholder-sanctuary-400 focus:outline-none focus:ring-2 focus:ring-sacred-600 transition-all resize-y"
                />
              </div>

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sanctuary-700 dark:text-sanctuary-300 mb-2">
                    {isTamil ? 'உங்கள் பெயர் (விருப்பப்பட்டால்)' : 'Your Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isTamil ? 'எ.கா: சுந்தர்' : 'e.g. John Doe'}
                    className="w-full rounded-xl bg-sanctuary-50 dark:bg-sanctuary-950 border border-sanctuary-200 dark:border-sanctuary-800 px-4 py-3 text-sm text-sanctuary-900 dark:text-sanctuary-100 placeholder-sanctuary-400 focus:outline-none focus:ring-2 focus:ring-sacred-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sanctuary-700 dark:text-sanctuary-300 mb-2">
                    {isTamil ? 'மின்னஞ்சல் (பதிலளிக்க விரும்பினால்)' : 'Email (For follow-up, optional)'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl bg-sanctuary-50 dark:bg-sanctuary-950 border border-sanctuary-200 dark:border-sanctuary-800 px-4 py-3 text-sm text-sanctuary-900 dark:text-sanctuary-100 placeholder-sanctuary-400 focus:outline-none focus:ring-2 focus:ring-sacred-600 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-sacred-700 hover:bg-sacred-800 active:bg-sacred-900 bg-gradient-to-r from-sacred-700 via-sacred-800 to-gold-600 text-white font-bold text-base shadow-xl shadow-sacred-700/25 hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-gold-500/30"
              >
                {isSubmitting ? (
                  <span>{isTamil ? 'சமர்ப்பிக்கப்படுகிறது...' : 'Submitting...'}</span>
                ) : (
                  <>
                    <Send className="w-5 h-5 text-white" />
                    <span>{isTamil ? 'கருத்தை சமர்ப்பிக்கவும் (Submit Feedback)' : 'Submit Feedback'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Helpful links below */}
        <div className="mt-8 text-center text-xs text-sanctuary-500 dark:text-sanctuary-400 flex items-center justify-center gap-4">
          <Link href="/dashboard" className="hover:text-gold-600 transition-colors flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isTamil ? 'வாசிப்புத் திட்டம்' : 'Reading Plan'}</span>
          </Link>
          <span>•</span>
          <Link href="/booklet" className="hover:text-gold-600 transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isTamil ? 'இலவச கையேடு' : 'Free Booklet'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
