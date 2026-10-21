'use client';

import React, { useState, useEffect } from 'react';
import { isInAppBrowser, getInAppBrowserName, isAndroid, getAndroidIntentUrl } from '@/lib/browserUtils';
import { ExternalLink, Copy, Check, AlertTriangle, Compass } from 'lucide-react';

interface InAppBrowserNoticeProps {
  className?: string;
  compact?: boolean;
}

export default function InAppBrowserNotice({ className = '', compact = false }: InAppBrowserNoticeProps) {
  const [inApp, setInApp] = useState(false);
  const [appName, setAppName] = useState<string>('WhatsApp / Instagram');
  const [copied, setCopied] = useState(false);
  const [androidDevice, setAndroidDevice] = useState(false);
  const [intentUrl, setIntentUrl] = useState('');

  useEffect(() => {
    const isApp = isInAppBrowser();
    setInApp(isApp);
    if (isApp) {
      setAppName(getInAppBrowserName() || 'WhatsApp / Instagram');
      setAndroidDevice(isAndroid());
      setIntentUrl(getAndroidIntentUrl());
    }
  }, []);

  if (!inApp) return null;

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-500/30 text-amber-900 dark:text-amber-100 transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 text-left space-y-2">
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <span>{appName}-ல் இருந்து வருகிறீர்களா? (Opening inside {appName}?)</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
              Google-ன் பாதுகாப்புக் கொள்கையினால் WhatsApp / Instagram உள்-உலாவியில் கூகிள் (Google) உள்நுழைவு தடைபடலாம்.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-sanctuary-900/70 border border-amber-400/30 space-y-1 text-[11px] sm:text-xs text-sanctuary-800 dark:text-sanctuary-200">
            <p className="font-semibold text-sacred-800 dark:text-gold-300">
              👉 சீராக உள்நுழைய (To Sign In smoothly):
            </p>
            <p>
              1. மேலே அல்லது கீழே உள்ள <strong>3 புள்ளிகளை (⋮ அல்லது ⋯)</strong> தொடவும்.
            </p>
            <p>
              2. <strong>&apos;Open in Chrome&apos;</strong> அல்லது <strong>&apos;Open in Safari / Browser&apos;</strong> என்பதைத் தேர்ந்தெடுக்கவும்.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {androidDevice && (
              <a
                href={intentUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-sm transition-all active:scale-95"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Chrome-ல் திறக்க (Open in Chrome)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-sanctuary-800 hover:bg-amber-100 dark:hover:bg-sanctuary-700 border border-amber-400/40 text-[11px] font-semibold text-amber-900 dark:text-amber-200 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">இணைப்பு நகலெடுக்கப்பட்டது! (Copied!)</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>இணைப்பை நகலெடு (Copy Link to open in browser)</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300/80 italic pt-0.5">
            💡 குறிப்பு: கீழே உள்ள மின்னஞ்சல் (Email & Password) மூலம் இங்கேயே உடனடியாக உள்நுழையலாம்!
          </p>
        </div>
      </div>
    </div>
  );
}
