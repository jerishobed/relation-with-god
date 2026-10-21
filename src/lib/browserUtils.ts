'use client';

/**
 * Utility functions to detect in-app browsers (WhatsApp, Instagram, Facebook, etc.)
 * and provide fallbacks to open standard external browsers (Chrome, Safari).
 * 
 * Google explicitly blocks OAuth 2.0 inside embedded WebViews with "Error 403: disallowed_useragent".
 * These utilities help guide users to a standard browser or use Email/Password sign-in.
 */

export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined' || !navigator?.userAgent) return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /WhatsApp|Instagram|FBAN|FBAV|FB_IAB|Messenger|Line|Twitter|Snapchat|MicroMessenger|wv|Android.*Version\/[0-9.]+\s+Chrome\/[0-9.]+\s+Mobile/i.test(ua);
}

export function getInAppBrowserName(): string | null {
  if (typeof window === 'undefined' || !navigator?.userAgent) return null;
  const ua = navigator.userAgent;
  if (/WhatsApp/i.test(ua)) return 'WhatsApp';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/FBAN|FBAV|FB_IAB|Messenger/i.test(ua)) return 'Facebook';
  if (/Twitter/i.test(ua)) return 'Twitter / X';
  if (/Line/i.test(ua)) return 'Line';
  if (/Snapchat/i.test(ua)) return 'Snapchat';
  if (/wv|Version\/[0-9.]+\s+Chrome/i.test(ua)) return 'In-App Browser';
  return null;
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined' || !navigator?.userAgent) return false;
  return /Android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof window === 'undefined' || !navigator?.userAgent) return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Constructs an Android Intent URL to open the current or given URL directly in Chrome / external browser.
 */
export function getAndroidIntentUrl(targetUrl?: string): string {
  if (typeof window === 'undefined') return '#';
  try {
    const raw = targetUrl || window.location.href;
    const url = new URL(raw, 'https://relationswithgod.in');
    const pathAndQuery = `${url.pathname}${url.search}${url.hash}`;
    // Intent that tells Android to launch external browser
    return `intent://${url.host}${pathAndQuery}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
  } catch {
    return 'intent://relationswithgod.in/dashboard#Intent;scheme=https;action=android.intent.action.VIEW;end';
  }
}
