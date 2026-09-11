'use client';

import React from 'react';
import { Heart, Play, ExternalLink, Share2, Sparkles } from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from '@/components/SocialIcons';
import { useTheme } from '@/lib/themeContext';

export default function SocialHubSection() {
  const { lang } = useTheme();
  const isTamil = lang === 'ta';

  return (
    <section className="py-20 bg-sanctuary-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sacred-100 dark:bg-sacred-950/70 text-sacred-800 dark:text-sacred-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sacred-600" />
            <span>Spiritual Fellowship</span>
          </div>

          <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-sanctuary-900 dark:text-sanctuary-100">
            CONNECT WITH RELATION WITH GOD
          </h2>

          <p className="font-tamil text-sm sm:text-base text-sacred-700 dark:text-gold-400 font-medium mt-1">
            சமூக வலைத்தளங்கள் மூலம் தேவனுடைய வார்த்தையைப் பெற்றுக்கொள்ளுங்கள்
          </p>

          <p className="text-sm text-sanctuary-600 dark:text-sanctuary-300 mt-3">
            Join our growing community on YouTube and Instagram for daily spiritual encouragement, Bible reading reflections, and prayer.
          </p>
        </div>

        {/* Social Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* YouTube Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm hover:shadow-xl hover:border-red-400/50 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <YoutubeIcon className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-bold border border-red-200/40">
                  Daily Devotionals & Shorts
                </span>
              </div>

              <h3 className="font-cinzel text-xl font-bold text-sanctuary-900 dark:text-sanctuary-100 mb-1">
                YouTube Channel
              </h3>
              <p className="text-sm text-red-600 font-semibold mb-3">
                @relationswithgod
              </p>

              <p className="text-xs sm:text-sm text-sanctuary-600 dark:text-sanctuary-300 leading-relaxed mb-6">
                Watch chronological Bible breakdown messages, prayer shorts, verse explanations, and uplifting spiritual worship videos created to nourish your soul.
              </p>

              {/* YouTube Preview Box */}
              <div className="rounded-2xl bg-sanctuary-100 dark:bg-sanctuary-950 p-4 border border-sanctuary-200 dark:border-sanctuary-800 flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
                  <Play className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-sanctuary-900 dark:text-sanctuary-100">
                    Relations with God
                  </p>
                  <p className="text-[11px] text-sanctuary-500 dark:text-sanctuary-400">
                    Subscribe for 365-day video companions
                  </p>
                </div>
              </div>
            </div>

            <a
              href="https://www.youtube.com/@relationswithgod"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <YoutubeIcon className="w-4 h-4" />
              <span>Subscribe on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Instagram Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm hover:shadow-xl hover:border-pink-400/50 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <InstagramIcon className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 text-xs font-bold border border-pink-200/40">
                  Daily Verse Graphics
                </span>
              </div>

              <h3 className="font-cinzel text-xl font-bold text-sanctuary-900 dark:text-sanctuary-100 mb-1">
                Instagram Family
              </h3>
              <p className="text-sm text-pink-600 font-semibold mb-3">
                @relations_with_god
              </p>

              <p className="text-xs sm:text-sm text-sanctuary-600 dark:text-sanctuary-300 leading-relaxed mb-6">
                Receive beautifully crafted Scripture verse posters, morning blessings, encouraging quotes, and community updates directly on your Instagram feed.
              </p>

              {/* Instagram Preview Box */}
              <div className="rounded-2xl bg-sanctuary-100 dark:bg-sanctuary-950 p-4 border border-sanctuary-200 dark:border-sanctuary-800 flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 to-pink-600 text-white flex items-center justify-center shadow-md">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-sanctuary-900 dark:text-sanctuary-100">
                    @relations_with_god
                  </p>
                  <p className="text-[11px] text-sanctuary-500 dark:text-sanctuary-400">
                    Follow for daily spiritual inspiration
                  </p>
                </div>
              </div>
            </div>

            <a
              href="https://www.instagram.com/relations_with_god/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Follow on Instagram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
