'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Phone, Heart, ExternalLink, Shield } from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from '@/components/SocialIcons';
export default function Footer() {

  return (
    <footer className="bg-sanctuary-100 dark:bg-sanctuary-950 theme-sepia:bg-[#EBE0C5] border-t border-sanctuary-200 dark:border-sanctuary-800 transition-colors pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Scripture Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12 p-6 rounded-2xl bg-white/70 dark:bg-sanctuary-900/60 border border-gold-400/40 shadow-sm">
          <p className="font-scripture italic text-base sm:text-lg text-sanctuary-800 dark:text-sanctuary-200 leading-relaxed mb-2">
            “Thy word is a lamp unto my feet, and a light unto my path.”
          </p>
          <p className="font-tamil text-sm sm:text-base text-sacred-700 dark:text-gold-400 font-medium">
            “உம்முடைய வசனம் என் கால்களுக்குத் தீபமும், என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது.”
          </p>
          <span className="text-xs uppercase tracking-widest font-cinzel text-sanctuary-500 dark:text-sanctuary-400 block mt-2 font-semibold">
            — Psalm 119:105
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-sacred-700 flex items-center justify-center text-white shadow-glow-gold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold tracking-wider text-sanctuary-900 dark:text-sanctuary-100">
                  RELATION WITH GOD
                </h3>
                <p className="text-xs font-tamil text-sacred-700 dark:text-gold-400">
                  365 Days Chronological Bible Journey
                </p>
              </div>
            </div>

            <p className="text-sm text-sanctuary-600 dark:text-sanctuary-400 max-w-md leading-relaxed">
              A dedicated spiritual platform guiding believers through the entire Holy Bible in chronological order across 365 days. Experience God’s unified story from Genesis to Revelation.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <a
                href="https://www.youtube.com/@relationswithgod"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-600 text-xs font-semibold transition-colors"
              >
                <YoutubeIcon className="w-4 h-4" />
                <span>@relationswithgod</span>
              </a>

              <a
                href="https://www.instagram.com/relations_with_god/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-600/10 hover:bg-pink-600/20 text-pink-600 text-xs font-semibold transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>@relations_with_god</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-widest text-sanctuary-900 dark:text-sanctuary-100">
              Spiritual Path
            </h4>
            <ul className="space-y-2 text-sm text-sanctuary-600 dark:text-sanctuary-400">
              <li>
                <Link href="/" className="hover:text-gold-600 transition-colors">
                  Home & Overview
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-gold-600 transition-colors">
                  My 365-Day Tracker
                </Link>
              </li>
              <li>
                <Link href="/#facts" className="hover:text-gold-600 transition-colors">
                  Amazing Bible Facts
                </Link>
              </li>
              <li>
                <Link href="/booklet" className="hover:text-gold-600 transition-colors flex items-center gap-1.5 text-sacred-700 dark:text-gold-400 font-semibold">
                  <span>🎁 Free Hardcopy Booklet</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://www.bible.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-gold-600 transition-colors"
                >
                  <span>YouVersion Bible</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Ministry & Leadership */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-widest text-sanctuary-900 dark:text-sanctuary-100">
              Ministry & Care
            </h4>
            <div className="text-sm text-sanctuary-700 dark:text-sanctuary-300 space-y-1.5">
              <p className="font-semibold text-sanctuary-900 dark:text-sanctuary-100">
                Prepared by J Jerish Obed
              </p>
              <p className="flex items-center gap-2 text-xs text-sanctuary-500 dark:text-sanctuary-400">
                <Phone className="w-3.5 h-3.5 text-gold-600" />
                <span>+91 9442418286</span>
              </p>
              <p className="text-xs text-sanctuary-500 dark:text-sanctuary-400 pt-1">
                One Book. One Story. One God.
              </p>
            </div>

            <div className="pt-3">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs text-sanctuary-400 hover:text-sacred-700 dark:hover:text-gold-400 transition-colors"
              >
                <Shield className="w-3 h-3" />
                <span>Founder Console</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-sanctuary-200 dark:border-sanctuary-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sanctuary-500 dark:text-sanctuary-400">
          <p>© {new Date().getFullYear()} Relation With God. All glory to God alone.</p>
          <p className="flex items-center gap-1">
            <span>Walking together in Scripture with</span>
            <Heart className="w-3.5 h-3.5 text-sacred-600 fill-sacred-600" />
            <span>Jerish Obed & Community</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
