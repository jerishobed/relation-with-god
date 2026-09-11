'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Compass, Music, Bookmark, Star, FileText, Globe2, Eye, X } from 'lucide-react';
import { useTheme } from '@/lib/themeContext';

export default function BibleFactsSection() {
  const { lang } = useTheme();
  const [showPosterModal, setShowPosterModal] = useState(false);
  const isTamil = lang === 'ta';

  const facts = [
    {
      icon: <BookOpen className="w-5 h-5 text-gold-600" />,
      titleEn: '66 Books Unified',
      titleTa: '66 புத்தகங்களின் தொகுப்பு',
      descEn: '39 books in the Old Testament, 27 books in the New Testament written across 1,500+ years.',
      descTa: 'பழைய ஏற்பாட்டில் 39 புத்தகங்கள், புதிய ஏற்பாட்டில் 27 புத்தகங்கள்.',
      highlight: '66 Books',
    },
    {
      icon: <Compass className="w-5 h-5 text-sacred-600" />,
      titleEn: '40+ Inspired Authors',
      titleTa: '40-க்கும் மேற்பட்ட ஆசிரியர்கள்',
      descEn: 'Written by kings, shepherds, fishermen, tent-makers, and doctors — unified by the Holy Spirit.',
      descTa: 'பரிசுத்த ஆவியின் ஏவுதலால் பலதரப்பட்ட மனிதர்களால் எழுதப்பட்ட ஒரே சத்தியம்.',
      highlight: '1 Divine Author',
    },
    {
      icon: <Globe2 className="w-5 h-5 text-amber-600" />,
      titleEn: 'Original Languages',
      titleTa: 'மூல மொழிகள்',
      descEn: 'The Old Testament mainly in Hebrew & Aramaic; the New Testament in ancient Greek.',
      descTa: 'பழைய ஏற்பாடு எபிரெயத்திலும், புதிய ஏற்பாடு கிரேக்கத்திலும் எழுதப்பட்டது.',
      highlight: 'Hebrew & Greek',
    },
    {
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      titleEn: '31,173 Total Verses',
      titleTa: '31,173 மொத்த வசனங்கள்',
      descEn: '1,189 chapters, 788,258 words in King James Version, containing God’s eternal promises.',
      descTa: '1,189 அதிகாரங்கள், 31,173 தேவனுடைய ஆசீர்வதிக்கப்பட்ட வசனங்கள்.',
      highlight: '31,173 Verses',
    },
    {
      icon: <Music className="w-5 h-5 text-purple-600" />,
      titleEn: '185 Sacred Songs',
      titleTa: '185 பரிசுத்த பாடல்கள்',
      descEn: 'From Moses’ song of deliverance to David’s heartfelt hymns and the heavenly songs of Revelation.',
      descTa: 'மோசேயின் பாடல் முதல் சங்கீதம் மற்றும் வெளிப்படுத்தின விசேஷம் வரை 185 பாடல்கள்.',
      highlight: '185 Songs',
    },
    {
      icon: <Star className="w-5 h-5 text-gold-600" />,
      titleEn: 'Center of the Bible',
      titleTa: 'வேதாகமத்தின் மையம்',
      descEn: 'Psalm 118:8 — "It is better to trust in the Lord than to put confidence in man."',
      descTa: 'சங்கீதம் 118:8 — "மனுஷனை நம்புவதைப்பார்க்கிலும், கர்த்தர் பேரில் பற்றுதலாயிருப்பதே நலம்."',
      highlight: 'Psalm 118:8',
    },
  ];

  return (
    <section id="facts" className="py-20 bg-sanctuary-50 dark:bg-sanctuary-900/40 border-y border-sanctuary-200 dark:border-sanctuary-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 dark:bg-sanctuary-800 text-gold-700 dark:text-gold-400 text-xs font-semibold mb-3">
            <Bookmark className="w-3.5 h-3.5 text-gold-600" />
            <span>Scripture Treasury</span>
          </div>

          <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-sanctuary-900 dark:text-sanctuary-100">
            A YEAR TO KNOW. A LIFETIME TO GROW.
          </h2>

          <p className="font-tamil text-sm sm:text-base text-sacred-700 dark:text-gold-400 font-medium mt-1">
            வேதாகமத்தைப் பற்றிய ஆச்சரியமூட்டும் உண்மைகள்
          </p>

          <p className="text-sm text-sanctuary-600 dark:text-sanctuary-300 mt-3">
            “One Book. One Story. One God.” Explore key facts compiled from our official Relation With God reading study guide.
          </p>
        </div>

        {/* Grid of Facts & Visual Booklet Poster */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Fact Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {facts.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-sanctuary-900 theme-sepia:bg-[#FAF4E5] border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm hover:shadow-glow-gold hover:border-gold-400/60 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-sanctuary-100 dark:bg-sanctuary-800 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold text-gold-700 dark:text-gold-400 bg-gold-50 dark:bg-sanctuary-800 px-2 py-0.5 rounded-md border border-gold-200/50">
                    {item.highlight}
                  </span>
                </div>

                <h3 className="font-cinzel font-bold text-sm text-sanctuary-900 dark:text-sanctuary-100 mb-1">
                  {item.titleEn}
                </h3>

                <p className="font-tamil text-xs text-sacred-700 dark:text-gold-400 font-semibold mb-2">
                  {item.titleTa}
                </p>

                <p className="text-xs text-sanctuary-600 dark:text-sanctuary-400 leading-relaxed">
                  {isTamil ? item.descTa : item.descEn}
                </p>
              </div>
            ))}
          </div>

          {/* Infographic Poster Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => setShowPosterModal(true)}>
              
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-gold-400/50 bg-sanctuary-900 max-w-[320px] sm:max-w-[360px]">
                <Image
                  src="/assets/bible-facts.png"
                  alt="Amazing Facts About the Bible Infographic - Relation With God"
                  width={360}
                  height={540}
                  className="w-full h-auto object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Overlay Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 text-sanctuary-900 font-semibold text-xs shadow-lg">
                    <Eye className="w-4 h-4 text-gold-600" />
                    <span>View Full Infographic</span>
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-sanctuary-500 dark:text-sanctuary-400 mt-3 font-cinzel">
                Click to inspect complete Study Poster
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Poster Modal */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-3xl max-h-[90vh] bg-sanctuary-950 rounded-2xl overflow-hidden p-2 border border-gold-400/50 shadow-2xl">
            <button
              onClick={() => setShowPosterModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto max-h-[85vh] p-2 flex justify-center">
              <Image
                src="/assets/bible-facts.png"
                alt="Bible Facts Infographic"
                width={700}
                height={1050}
                className="w-auto h-auto max-w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
