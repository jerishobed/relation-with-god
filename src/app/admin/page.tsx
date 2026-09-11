'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import {
  getRealAudienceData,
  getStoredAnnouncement,
  setStoredAnnouncement,
} from '@/lib/storage';
import {
  getAdminAudienceFromFirestore,
  saveAnnouncementToFirestore,
  getAnnouncementFromFirestore,
} from '@/lib/firestoreService';
import { BroadcastAnnouncement, AdminAudienceStats, UserProfile } from '@/types';
import {
  ShieldCheck,
  Users,
  UserCheck,
  Activity,
  BookOpen,
  TrendingUp,
  Download,
  Search,
  Send,
  Bell,
  CheckCircle2,
  FileText,
  Lock,
  LogOut,
  ExternalLink,
  KeyRound,
  RefreshCw,
  Sparkles,
  Cloud,
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, loginAdmin, logoutAdmin, loginWithGoogle } = useAuth();
  
  // Initial fallback to local data, updated with live Firestore data
  const initialData = getRealAudienceData();
  const [stats, setStats] = useState<AdminAudienceStats>(initialData.stats);
  const [users, setUsers] = useState<Array<UserProfile & { currentDay: number; progressPercent: number; lastActive: string }>>(initialData.users);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');

  const [announcement, setAnnouncement] = useState<BroadcastAnnouncement>(getStoredAnnouncement());
  const [announcementUpdated, setAnnouncementUpdated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Admin login credentials state
  const [adminUsername, setAdminUsername] = useState('jerishbtech');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Fetch live audience from Firestore
  const fetchLiveAudience = useCallback(async () => {
    setIsLoadingLive(true);
    try {
      const res = await getAdminAudienceFromFirestore();
      if (res.users && res.users.length > 0) {
        setStats(res.stats);
        setUsers(res.users);
      } else {
        const local = getRealAudienceData();
        setStats(local.stats);
        setUsers(local.users);
      }
      setLastRefreshedAt(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Error loading live audience from Firestore:', e);
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  // Fetch on mount or when admin is authenticated
  useEffect(() => {
    if (isAdmin) {
      fetchLiveAudience();
      getAnnouncementFromFirestore().then((liveAnn) => {
        if (liveAnn && liveAnn.title) {
          setAnnouncement(liveAnn);
        }
      });
    }
  }, [isAdmin, fetchLiveAudience]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = loginAdmin(adminUsername, adminPasscode);
    if (!res.success) {
      setAuthError(res.error || 'Access denied.');
    }
  };

  const handleGoogleAdminLogin = async () => {
    setAuthError('');
    try {
      await loginWithGoogle();
    } catch (e: any) {
      setAuthError(e?.message || 'Google sign-in failed.');
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...announcement,
      date: new Date().toISOString().split('T')[0],
      author: 'J Jerish Obed',
    };
    setAnnouncement(updated);
    setStoredAnnouncement(updated);
    await saveAnnouncementToFirestore(updated);
    setAnnouncementUpdated(true);
    setTimeout(() => setAnnouncementUpdated(false), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Joined Date', 'Current Day', 'Progress Percent', 'Last Active'];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.role,
      u.joinedDate,
      u.currentDay,
      `${u.progressPercent}%`,
      u.lastActive,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'relation_with_god_audience.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If not logged in as jerishbtech, render the secure Founder Gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center bg-sanctuary-texture px-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-gold-400/40 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sacred-700 via-sacred-600 to-gold-500 flex items-center justify-center text-white shadow-glow-gold mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sacred-100 dark:bg-sacred-950 text-sacred-800 dark:text-sacred-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-sacred-600" />
              <span>Ministry Administration Gate</span>
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-sanctuary-900 dark:text-sanctuary-100">
              Founder Console
            </h2>
            <p className="text-xs text-sanctuary-600 dark:text-sanctuary-400">
              This console is strictly reserved for <span className="font-semibold text-sanctuary-900 dark:text-sanctuary-100">jerishbtech</span>. Sign in with your founder Google account to access live Cloud Firestore analytics.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-medium flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          {/* Primary: Sign In with Google Founder Account */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleAdminLogin}
              type="button"
              className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-sanctuary-800 border-2 border-gold-500/60 hover:border-gold-500 text-sanctuary-900 dark:text-sanctuary-100 font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-98"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google (jerishbtech)</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-sanctuary-200 dark:border-sanctuary-700 w-full" />
              <span className="bg-white dark:bg-sanctuary-900 px-3 text-[11px] font-bold text-sanctuary-400 uppercase tracking-wider relative">
                Or unlock with passcode
              </span>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1">
                  Admin Username / Email
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="jerishbtech"
                  className="w-full px-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-500 font-mono text-sanctuary-900 dark:text-sanctuary-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1">
                  Founder Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-sanctuary-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter passcode"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-500 text-sanctuary-900 dark:text-sanctuary-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sacred-700 via-sacred-800 to-sanctuary-950 text-white font-semibold text-sm shadow-md hover:opacity-95 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Unlock Ministry Console</span>
              </button>
            </form>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-sanctuary-500 hover:text-gold-600 transition-colors"
            >
              ← Return to Relation With God Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-sanctuary-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sacred-100 dark:bg-sacred-950/70 text-sacred-800 dark:text-sacred-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-sacred-600" />
              <span>Ministry Administration Console</span>
            </div>

            <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-sanctuary-900 dark:text-sanctuary-50">
              Relation With God • Audience Analytics
            </h1>

            <p className="text-xs sm:text-sm text-sanctuary-600 dark:text-sanctuary-300">
              Overseeing participants in the 365-Day Chronological Bible Reading Journey.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={fetchLiveAudience}
              disabled={isLoadingLive}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gold-50 dark:bg-sanctuary-800 border border-gold-300 dark:border-gold-700/50 hover:bg-gold-100 text-gold-900 dark:text-gold-200 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Refresh Live Data from Cloud Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin text-gold-600' : 'text-gold-600'}`} />
              <span>{isLoadingLive ? 'Syncing...' : 'Live Refresh'}</span>
            </button>

            <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-sanctuary-800 border border-emerald-300 text-xs flex items-center gap-2">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                {user?.email || 'jerishbtech@gmail.com'}
              </span>
            </div>

            {(!user?.email || user.id === 'usr_jerishbtech') && (
              <button
                onClick={handleGoogleAdminLogin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition-colors"
                title="Authorize with Google for Full Cloud Access"
              >
                <span>Connect Google</span>
              </button>
            )}

            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sanctuary-100 dark:bg-sanctuary-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-sanctuary-700 hover:text-red-600 text-xs font-semibold transition-colors"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Primary Audience Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sanctuary-500 uppercase tracking-wider">
                Total Audience
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="font-cinzel text-3xl font-extrabold text-sanctuary-900 dark:text-sanctuary-100">
              {stats.totalAudience.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Live registered participants
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sanctuary-500 uppercase tracking-wider">
                Enrolled in 365 Days
              </span>
              <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="font-cinzel text-3xl font-extrabold text-gold-600 dark:text-gold-400">
              {stats.enrolledIn365.toLocaleString()}
            </div>
            <p className="text-[11px] text-sanctuary-500 mt-1">
              {stats.totalAudience > 0
                ? Math.round((stats.enrolledIn365 / stats.totalAudience) * 100)
                : 0}
              % of total audience enrolled
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sanctuary-500 uppercase tracking-wider">
                Active Readers Today
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="font-cinzel text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.activeToday.toLocaleString()}
            </div>
            <p className="text-[11px] text-sanctuary-500 mt-1">
              {stats.activeThisWeek.toLocaleString()} readers this week
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sanctuary-500 uppercase tracking-wider">
                Chapters Read
              </span>
              <div className="p-2 rounded-xl bg-sacred-500/10 text-sacred-600">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="font-cinzel text-3xl font-extrabold text-sacred-700 dark:text-gold-400">
              {stats.totalChaptersRead.toLocaleString()}
            </div>
            <p className="text-[11px] text-sanctuary-500 mt-1">
              Across all active participants
            </p>
          </div>

        </div>

        {/* Cohort Journey Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-cinzel text-lg font-bold text-sanctuary-900 dark:text-sanctuary-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gold-600" />
                <span>Reader Journey Distribution (Cohorts)</span>
              </h3>
              <p className="text-xs text-sanctuary-500 mt-0.5">
                Distribution of where participants are along the 365-day chronological timeline
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Days 1-30', count: stats.cohortDistribution.days1to30, sub: 'Beginnings (Genesis)' },
              { label: 'Days 31-90', count: stats.cohortDistribution.days31to90, sub: 'Exodus & Law' },
              { label: 'Days 91-180', count: stats.cohortDistribution.days91to180, sub: 'Kingdoms & Psalms' },
              { label: 'Days 181-270', count: stats.cohortDistribution.days181to270, sub: 'Major Prophets' },
              { label: 'Days 271-365', count: stats.cohortDistribution.days271to365, sub: 'Gospels & Epistles' },
              { label: 'Finished (365)', count: stats.cohortDistribution.completedAll, sub: 'Bible Finisher 🏆' },
            ].map((cohort, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-sanctuary-50 dark:bg-sanctuary-800/60 border border-sanctuary-200 dark:border-sanctuary-700 text-center space-y-1"
              >
                <span className="text-xs font-semibold text-sanctuary-600 dark:text-sanctuary-300 block">
                  {cohort.label}
                </span>
                <span className="font-cinzel text-2xl font-bold text-sanctuary-900 dark:text-sanctuary-50 block">
                  {cohort.count}
                </span>
                <span className="text-[10px] text-sanctuary-400 truncate block">
                  {cohort.sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Broadcaster to Community */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-sanctuary-900 dark:text-sanctuary-100">
                Community Encouragement Broadcast
              </h3>
              <p className="text-xs text-sanctuary-500">
                Post an uplifting scripture devotion or ministry update that appears at the top of every enrolled reader’s dashboard.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateAnnouncement} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                value={announcement.title}
                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-300 mb-1">
                Message Content / Scripture Word
              </label>
              <textarea
                rows={3}
                value={announcement.message}
                onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-semibold text-xs shadow-glow-gold transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast to Community</span>
              </button>

              {announcementUpdated && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Broadcast Published Live!</span>
                </span>
              )}
            </div>
          </form>
        </div>

        {/* User Directory Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-sanctuary-900 border border-sanctuary-200 dark:border-sanctuary-800 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-cinzel text-lg font-bold text-sanctuary-900 dark:text-sanctuary-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-600" />
                <span>Enrolled Participants Directory</span>
              </h3>
              <p className="text-xs text-sanctuary-500 mt-0.5 flex items-center gap-2">
                <span>Showing {filteredUsers.length} active readers</span>
                {lastRefreshedAt && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    • Live Cloud synced ({lastRefreshedAt})
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-sanctuary-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search devotees..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-sanctuary-200 dark:border-sanctuary-700 bg-sanctuary-50 dark:bg-sanctuary-800 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500 text-sanctuary-900 dark:text-sanctuary-100"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-sanctuary-300 dark:border-sanctuary-700 bg-white dark:bg-sanctuary-800 hover:bg-gold-50 text-xs font-semibold text-sanctuary-700 dark:text-sanctuary-200 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-gold-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-sanctuary-200 dark:border-sanctuary-800 text-sanctuary-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="pb-3 px-3">Participant</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Current Day</th>
                  <th className="pb-3 px-3">Overall Progress</th>
                  <th className="pb-3 px-3">Joined</th>
                  <th className="pb-3 px-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sanctuary-100 dark:divide-sanctuary-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sanctuary-400">
                      No matching participants found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-sanctuary-50/50 dark:hover:bg-sanctuary-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-sanctuary-900 dark:text-sanctuary-100">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-sanctuary-400">
                          {u.email}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-sacred-100 text-sacred-800 dark:bg-sacred-950 dark:text-sacred-300'
                              : 'bg-gold-100 text-gold-800 dark:bg-gold-950 dark:text-gold-300'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-sanctuary-900 dark:text-sanctuary-100">
                        Day {u.currentDay} / 365
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-sanctuary-200 dark:bg-sanctuary-700 overflow-hidden">
                            <div
                              className="h-full bg-gold-500 rounded-full"
                              style={{ width: `${Math.min(100, u.progressPercent)}%` }}
                            />
                          </div>
                          <span className="font-bold text-sanctuary-700 dark:text-sanctuary-300">
                            {u.progressPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-sanctuary-500">
                        {u.joinedDate}
                      </td>
                      <td className="py-3 px-3 text-sanctuary-600 dark:text-sanctuary-300 font-medium">
                        {u.lastActive}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resources & Source Document Card */}
        <div className="p-6 rounded-3xl bg-sanctuary-50 dark:bg-sanctuary-900/60 border border-sanctuary-200 dark:border-sanctuary-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-sanctuary-900 dark:text-sanctuary-100">
                Printable Booklet Resources
              </h4>
              <p className="text-[11px] text-sanctuary-500">
                Source file: Bible Chronological Order-2_PrintReady.docx (Compiled by J Jerish Obed, 9442418286)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/assets/booklet-cover.png"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sanctuary-300 dark:border-sanctuary-700 bg-white dark:bg-sanctuary-800 text-xs font-semibold hover:border-gold-500 transition-colors"
            >
              <span>Cover Art</span>
              <ExternalLink className="w-3 h-3 text-sanctuary-400" />
            </a>
            <a
              href="/assets/bible-facts.png"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sanctuary-300 dark:border-sanctuary-700 bg-white dark:bg-sanctuary-800 text-xs font-semibold hover:border-gold-500 transition-colors"
            >
              <span>Facts Poster</span>
              <ExternalLink className="w-3 h-3 text-sanctuary-400" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
