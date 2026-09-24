'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import { submitBookletRequest } from '@/lib/firestoreService';
import { BookletRequest } from '@/types';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Send,
  CheckCircle2,
  Gift,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Calendar,
  Layers,
  MessageCircle,
  Clock,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';

export default function BookletPage() {
  const { user, isAuthenticated } = useAuth();
  const { lang } = useTheme();
  const isTamil = lang === 'ta';

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [languagePreference, setLanguagePreference] = useState<'ta' | 'en' | 'bilingual'>('ta');
  const [prayerRequest, setPrayerRequest] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState<BookletRequest | null>(null);
  const [previousRequests, setPreviousRequests] = useState<BookletRequest[]>([]);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Load previous local requests if any
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rwg_my_booklet_requests');
      if (stored) {
        setPreviousRequests(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    const cleanName = fullName.trim();
    const cleanPhone = phoneNumber.trim().replace(/[\s-]/g, '');
    const cleanAddress1 = addressLine1.trim();
    const cleanCity = city.trim();
    const cleanState = state.trim();
    const cleanPincode = pincode.trim().replace(/\s/g, '');

    if (!cleanName) {
      setErrorMessage(isTamil ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.' : 'Please enter your full name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(
        isTamil
          ? 'தயவுசெய்து சரியான 10-இலக்க தொடர்பு எண்ணை உள்ளிடவும்.'
          : 'Please enter a valid 10-digit contact phone number.'
      );
      return;
    }
    if (!cleanAddress1 || cleanAddress1.length < 5) {
      setErrorMessage(
        isTamil
          ? 'தயவுசெய்து உங்கள் கதவு எண் மற்றும் தெரு முகவரியை உள்ளிடவும்.'
          : 'Please enter your complete street / house address.'
      );
      return;
    }
    if (!cleanCity) {
      setErrorMessage(isTamil ? 'தயவுசெய்து உங்கள் ஊர்/நகரத்தை உள்ளிடவும்.' : 'Please enter your city/town.');
      return;
    }
    if (!cleanState) {
      setErrorMessage(isTamil ? 'தயவுசெய்து உங்கள் மாநிலத்தை உள்ளிடவும்.' : 'Please enter your state.');
      return;
    }
    if (!cleanPincode || cleanPincode.length < 5) {
      setErrorMessage(
        isTamil
          ? 'தயவுசெய்து சரியான அஞ்சல் குறியீட்டு எண்ணை (PIN Code) உள்ளிடவும்.'
          : 'Please enter a valid postal PIN code.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitBookletRequest({
        fullName: cleanName,
        phoneNumber: cleanPhone,
        email: email.trim() || undefined,
        addressLine1: cleanAddress1,
        addressLine2: addressLine2.trim() || undefined,
        city: cleanCity,
        state: cleanState,
        pincode: cleanPincode,
        country: country.trim() || 'India',
        languagePreference,
        prayerRequest: prayerRequest.trim() || undefined,
        userId: user?.id || null,
      });

      if (result.success && result.id) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#800020', '#10B981', '#3B82F6'],
        });

        const newReq: BookletRequest = {
          id: result.id,
          fullName: cleanName,
          phoneNumber: cleanPhone,
          email: email.trim(),
          addressLine1: cleanAddress1,
          addressLine2: addressLine2.trim(),
          city: cleanCity,
          state: cleanState,
          pincode: cleanPincode,
          country: country.trim() || 'India',
          languagePreference,
          prayerRequest: prayerRequest.trim(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          userId: user?.id || null,
        };

        setSubmittedRequest(newReq);
        setPreviousRequests((prev) => [newReq, ...prev]);

        // Smooth scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(result.error || 'Failed to submit request. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Something went wrong. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const indianStates = [
    'Tamil Nadu',
    'Kerala',
    'Karnataka',
    'Andhra Pradesh',
    'Telangana',
    'Maharashtra',
    'Goa',
    'Puducherry',
    'Delhi',
    'Gujarat',
    'West Bengal',
    'Odisha',
    'Punjab',
    'Other / Outside India',
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-sanctuary-texture">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between text-xs text-sanctuary-500">
          <Link href="/" className="hover:text-gold-600 transition-colors flex items-center gap-1">
            <span>←</span>
            <span>{isTamil ? 'முகப்புக்குத் திரும்பு' : 'Back to Home'}</span>
          </Link>
          <div className="flex items-center gap-1 text-gold-600 dark:text-gold-400 font-semibold">
            <Gift className="w-3.5 h-3.5" />
            <span>100% Free Ministry Service</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUCCESS CONFIRMATION STATE */}
        {/* ========================================================= */}
        {submittedRequest ? (
          <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-sanctuary-900 border-2 border-gold-400/50 shadow-2xl space-y-8 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isTamil ? 'கோரிக்கை வெற்றிகரமாகப் பெறப்பட்டது' : 'Request Received Successfully!'}</span>
              </div>

              <h2 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-sanctuary-900 dark:text-sanctuary-50">
                {isTamil ? 'உங்கள் இலவச புத்தகம் விரைவில் அனுப்பப்படும்!' : 'Your Free Booklet Will Be Dispatched Soon!'}
              </h2>

              <p className="text-xs sm:text-sm text-sanctuary-600 dark:text-sanctuary-300 max-w-xl mx-auto">
                {isTamil
                  ? `அன்பான ${submittedRequest.fullName}, உங்கள் வேதாகம காலவரிசை அச்சுப் புத்தகம் (Print Edition) அஞ்சல் அல்லது கூரியர் மூலம் இலவசமாக அனுப்பி வைக்கப்படும். இறைவனின் ஆசீர்வாதம் உங்களோடு இருப்பதாக!`
                  : `Dear ${submittedRequest.fullName}, your copy of the 365-Day Chronological Bible Reading Guide will be packaged with prayer and dispatched to your postal address completely free.`}
              </p>
            </div>

            {/* Order Summary Receipt Box */}
            <div className="p-6 rounded-2xl bg-sanctuary-50 dark:bg-sanctuary-800/60 border border-sanctuary-200 dark:border-sanctuary-700 space-y-4 max-w-xl mx-auto">
              <div className="flex items-center justify-between border-b border-sanctuary-200 dark:border-sanctuary-700 pb-3">
                <span className="text-xs font-bold text-sanctuary-500 uppercase tracking-wider">
                  Request Reference ID
                </span>
                <span className="font-mono text-xs font-bold text-gold-700 dark:text-gold-400 bg-gold-100 dark:bg-sanctuary-900 px-2 py-0.5 rounded">
                  RWG-BK-{submittedRequest.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-sanctuary-700 dark:text-sanctuary-300 space-y-1.5">
                <div className="flex items-start gap-2">
                  <User className="w-3.5 h-3.5 text-sanctuary-400 mt-0.5 shrink-0" />
                  <span className="font-semibold">{submittedRequest.fullName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-sanctuary-400 mt-0.5 shrink-0" />
                  <span>{submittedRequest.phoneNumber}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sanctuary-400 mt-0.5 shrink-0" />
                  <span>
                    {submittedRequest.addressLine1}
                    {submittedRequest.addressLine2 ? `, ${submittedRequest.addressLine2}` : ''},{' '}
                    {submittedRequest.city}, {submittedRequest.state} - {submittedRequest.pincode},{' '}
                    {submittedRequest.country}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-sanctuary-400 mt-0.5 shrink-0" />
                  <span className="capitalize">
                    Language Edition: {submittedRequest.languagePreference === 'ta' ? 'தமிழ் (Tamil)' : submittedRequest.languagePreference === 'en' ? 'English' : 'Bilingual'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-sanctuary-200 dark:border-sanctuary-700 flex items-center justify-between text-xs">
                <span className="font-semibold text-sanctuary-600 dark:text-sanctuary-400">
                  Shipping & Handling:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  FREE (இலவசம்)
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Confirmation Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/919442418286?text=${encodeURIComponent(
                  `Praise the Lord Brother Jerish! I have submitted a free hardcopy booklet request on Relation With God.\n\nName: ${submittedRequest.fullName}\nPhone: ${submittedRequest.phoneNumber}\nCity: ${submittedRequest.city}\nRef ID: RWG-BK-${submittedRequest.id.slice(0, 8).toUpperCase()}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isTamil ? 'WhatsApp-ல் தகவல் அனுப்ப' : 'Connect with Bro. Jerish on WhatsApp'}</span>
              </a>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-semibold text-xs shadow-glow-gold transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isTamil ? 'இப்போதே ஆன்லைனில் வாசிக்கத் தொடங்கவும்' : 'Start Reading Online Now'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setSubmittedRequest(null)}
                className="text-xs text-sanctuary-500 hover:text-gold-600 underline"
              >
                {isTamil ? 'மற்றொரு முகவரிக்கு புத்தகம் கேட்க' : 'Request another copy for someone else'}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* PRIMARY REQUEST HERO & FORM */
          /* ========================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Booklet Presentation & Features */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm space-y-6">
                
                {/* Booklet Image Showcase */}
                <div className="relative group max-w-[280px] mx-auto">
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-gold-500 to-sacred-700 rounded-2xl opacity-30 blur-md group-hover:opacity-50 transition duration-300" />
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-gold-400/60 dark:border-gold-500/40 bg-sanctuary-900">
                    <Image
                      src="/assets/booklet-cover.png"
                      alt="Read The Bible In Chronological Order Booklet - J Jerish Obed"
                      width={320}
                      height={440}
                      className="w-full h-auto object-cover transform group-hover:scale-102 transition duration-300"
                      priority
                    />
                    <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-black/75 backdrop-blur-sm border border-white/20 text-white flex items-center justify-between text-xs">
                      <span className="font-cinzel font-bold text-gold-300">Hardcopy Edition</span>
                      <span className="px-1.5 py-0.5 rounded bg-gold-500/40 font-bold text-[10px] text-gold-200">
                        FREE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sacred-100 dark:bg-sacred-950 text-sacred-800 dark:text-sacred-300 text-xs font-bold">
                    <Gift className="w-3.5 h-3.5 text-sacred-600" />
                    <span>Free Postal Ministry</span>
                  </div>

                  <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-sanctuary-900 dark:text-sanctuary-50">
                    {isTamil
                      ? '365 நாள் காலவரிசை வேதாகம அட்டவணை புத்தகம்'
                      : '365-Day Chronological Bible Reading Booklet'}
                  </h1>

                  <p className="text-xs sm:text-sm text-sanctuary-600 dark:text-sanctuary-300 leading-relaxed">
                    {isTamil
                      ? 'பரிசுத்த வேதாகமத்தை 365 நாட்களில் காலவரிசையில் வாசித்து முடிக்க உதவும் அழகான அச்சுப் புத்தகம் (Print Booklet). உங்கள் இல்லத்திற்கே இலவசமாக அனுப்பி வைக்கப்படுகிறது.'
                      : 'A high quality printed physical guide containing the complete 365-day chronological Bible reading plan, daily chapter targets, and tick-mark progress records. Shipped to your doorstep 100% free.'}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="space-y-2.5 pt-2 border-t border-sanctuary-200 dark:border-sanctuary-800 text-xs text-sanctuary-700 dark:text-sanctuary-300">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>
                      <strong>Complete 365 Days & 1,163 Chapters:</strong> Harmonized according to chronological history.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>
                      <strong>Physical Tick Marks:</strong> Keep track on your personal Bible table or altar every morning.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>
                      <strong>Free Delivery via Post:</strong> Dispatched by Indian Speed Post / Courier at zero cost to you.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>
                      <strong>Prepared with Prayer:</strong> Compiled by Brother J Jerish Obed (Founder).
                    </span>
                  </div>
                </div>

                {/* Direct contact note */}
                <div className="p-3.5 rounded-2xl bg-gold-50 dark:bg-sanctuary-800/60 border border-gold-200 dark:border-gold-800 text-xs text-gold-900 dark:text-gold-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gold-600" />
                    <div>
                      <p className="font-semibold">Questions? Contact Founder</p>
                      <p className="text-[11px] text-sanctuary-600 dark:text-sanctuary-400">+91 9442418286</p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/919442418286?text=Hi%20Brother%20Jerish,%20I%20would%20like%20to%20know%20more%20about%20the%20Relation%20With%20God%20hardcopy%20booklet."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>

              </div>

              {/* Show Previous User Requests If Cached */}
              {previousRequests.length > 0 && (
                <div className="p-5 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-sanctuary-700 dark:text-sanctuary-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold-600" />
                      <span>Your Past Requests</span>
                    </h3>
                    <span className="text-[10px] text-sanctuary-400">
                      {previousRequests.length} {previousRequests.length === 1 ? 'request' : 'requests'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {previousRequests.slice(0, 3).map((req, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-sanctuary-50 dark:bg-sanctuary-800/40 border border-sanctuary-200 dark:border-sanctuary-700 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sanctuary-900 dark:text-sanctuary-100">
                            {req.fullName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : req.status === 'dispatched'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {req.status === 'delivered'
                              ? 'Delivered ✅'
                              : req.status === 'dispatched'
                              ? 'Dispatched 📦'
                              : 'Pending Packing ⏳'}
                          </span>
                        </div>
                        <p className="text-[11px] text-sanctuary-500 truncate">
                          {req.city}, {req.state} • {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Request Form */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-xl space-y-6">
                
                {/* Form Header */}
                <div className="space-y-1 border-b border-sanctuary-200 dark:border-sanctuary-800 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      <span>{isTamil ? 'அஞ்சல் முகவரி படிவம்' : 'Postal Delivery Form'}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                      100% Free Shipping
                    </span>
                  </div>

                  <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-sanctuary-900 dark:text-sanctuary-50">
                    {isTamil ? 'புத்தகம் பெற உங்கள் முகவரியைப் பதிவு செய்க' : 'Request Your Free Copy Today'}
                  </h2>

                  <p className="text-xs text-sanctuary-500 dark:text-sanctuary-400">
                    {isTamil
                      ? 'கீழே உள்ள படிவத்தில் உங்கள் முழு முகவரியை சரியாகப் பூர்த்தி செய்யவும். கூரியர் அல்லது இந்திய அஞ்சல் வழியாக அனுப்பி வைக்கப்படும்.'
                      : 'Please provide your accurate postal address and phone number so the delivery partner can reach you smoothly.'}
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-medium flex items-start gap-2">
                    <span className="text-sm">⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* The Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1.5">
                        {isTamil ? 'முழு பெயர் (Full Name) *' : 'Full Name *'}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-sanctuary-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Samuel Raj / Kavitha"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1.5">
                        {isTamil ? 'தொடர்பு எண் (WhatsApp / Mobile) *' : 'Contact Number (WhatsApp) *'}
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-sanctuary-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                        />
                      </div>
                      <span className="text-[10px] text-sanctuary-400 mt-1 block">
                        Used for delivery updates & courier dispatch
                      </span>
                    </div>
                  </div>

                  {/* Email & Language Edition */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1.5">
                        {isTamil ? 'மின்னஞ்சல் (Email Address)' : 'Email Address (Optional)'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-sanctuary-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. name@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1.5">
                        {isTamil ? 'மொழி விருப்பம் (Language Edition)' : 'Language Edition'}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setLanguagePreference('ta')}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                            languagePreference === 'ta'
                              ? 'bg-gold-500 text-white border-gold-600 shadow-sm'
                              : 'bg-sanctuary-50 dark:bg-sanctuary-800 border-sanctuary-200 dark:border-sanctuary-700 text-sanctuary-700 dark:text-sanctuary-300'
                          }`}
                        >
                          தமிழ்
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguagePreference('en')}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                            languagePreference === 'en'
                              ? 'bg-gold-500 text-white border-gold-600 shadow-sm'
                              : 'bg-sanctuary-50 dark:bg-sanctuary-800 border-sanctuary-200 dark:border-sanctuary-700 text-sanctuary-700 dark:text-sanctuary-300'
                          }`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguagePreference('bilingual')}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                            languagePreference === 'bilingual'
                              ? 'bg-gold-500 text-white border-gold-600 shadow-sm'
                              : 'bg-sanctuary-50 dark:bg-sanctuary-800 border-sanctuary-200 dark:border-sanctuary-700 text-sanctuary-700 dark:text-sanctuary-300'
                          }`}
                        >
                          Both
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Postal Address Line 1 */}
                  <div>
                    <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1.5">
                      {isTamil
                        ? 'கதவு எண் / வீடு / தெரு முகவரி (Door No, House & Street) *'
                        : 'Door No / House / Apartment & Street Address *'}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-sanctuary-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="e.g. No. 12/4, Grace Villa, 3rd Cross Street"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                      />
                    </div>
                  </div>

                  {/* Address Line 2 / Landmark */}
                  <div>
                    <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1.5">
                      {isTamil ? 'பகுதி / அடையாளம் (Area / Landmark)' : 'Area / Locality / Landmark (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="e.g. Near CSI Church / Opposite Post Office"
                      className="w-full px-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                    />
                  </div>

                  {/* City, State & Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1.5">
                        {isTamil ? 'நகரம் / ஊர் (City/Town) *' : 'City / Town *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Chennai / Tirunelveli"
                        className="w-full px-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1.5">
                        {isTamil ? 'மாநிலம் (State) *' : 'State *'}
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                      >
                        {indianStates.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1.5">
                        {isTamil ? 'அஞ்சல் குறியீடு (PIN Code) *' : 'Postal PIN Code *'}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="e.g. 600028"
                        className="w-full px-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                      />
                    </div>
                  </div>

                  {/* Prayer Request / Personal Note */}
                  <div>
                    <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1.5">
                      {isTamil
                        ? 'ஜெபக் குறிப்பு அல்லது வாழ்த்து (Prayer Request / Note for Bro. Jerish)'
                        : 'Personal Prayer Request or Message to Bro. Jerish (Optional)'}
                    </label>
                    <textarea
                      rows={2}
                      value={prayerRequest}
                      onChange={(e) => setPrayerRequest(e.target.value)}
                      placeholder={
                        isTamil
                          ? 'உங்கள் தனிப்பட்ட ஜெப விண்ணப்பம் அல்லது குறிப்பை இங்கு பகிரலாம்...'
                          : 'Share any prayer request or spiritual thought for our ministry team...'
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-600 to-sacred-700 text-white font-bold text-sm shadow-glow-gold hover:shadow-xl hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{isTamil ? 'பதிவு செய்யப்படுகிறது...' : 'Submitting Your Request...'}</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          <span>
                            {isTamil
                              ? 'இலவச புத்தகத்தைப் பெற பதிவு செய்க (Submit)'
                              : 'Request My Free Hardcopy Booklet'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Trust badge */}
                  <div className="flex items-center justify-center gap-2 text-[11px] text-sanctuary-500 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {isTamil
                        ? '100% இலவசம் • எந்தக் கட்டணமும் இல்லை • ஆசீர்வாதத்தோடு அனுப்பப்படும்'
                        : '100% Free Ministry Initiative • No hidden shipping charges • Hand-packed with prayer'}
                    </span>
                  </div>

                </form>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
