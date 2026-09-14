import { db, auth } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
  addDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { UserProfile, UserProgress, AdminAudienceStats, BroadcastAnnouncement } from '@/types';
import { createFreshProgress } from './storage';

/**
 * Sync user profile to user-isolated Firestore document /users/{userId}
 */
export async function syncUserProfileToFirestore(user: UserProfile) {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(
      userRef,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinedDate: user.joinedDate,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore syncUserProfile warning:', err);
  }
}

/**
 * Load user-isolated progress from /users/{userId}/progress/current
 */
export async function getUserProgressFromFirestore(userId: string): Promise<UserProgress | null> {
  try {
    const progRef = doc(db, 'users', userId, 'progress', 'current');
    const snap = await getDoc(progRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        userId,
        enrolled: data.enrolled ?? true,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        completedDays: Array.isArray(data.completedDays) ? data.completedDays : [],
        completedChapters: Array.isArray(data.completedChapters) ? data.completedChapters : [],
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        lastActiveDate: data.lastActiveDate || '',
        notes: data.notes || {},
        bookmarks: data.bookmarks || [],
      };
    }
    return null;
  } catch (err) {
    console.warn('Firestore getUserProgress warning:', err);
    return null;
  }
}

/**
 * Save user-isolated progress to /users/{userId}/progress/current
 */
export async function saveUserProgressToFirestore(userId: string, progress: UserProgress) {
  try {
    const progRef = doc(db, 'users', userId, 'progress', 'current');
    await setDoc(
      progRef,
      {
        ...progress,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Also update parent /users/{userId} summary for admin metrics
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        completedDaysCount: progress.completedDays.length,
        completedChaptersCount: progress.completedChapters.length,
        currentStreak: progress.currentStreak,
        lastActiveDate: progress.lastActiveDate,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore saveUserProgress warning:', err);
  }
}

/**
 * Save user-isolated daily prayer note to /users/{userId}/notes/{dayNum}
 */
export async function saveDayNoteToFirestore(userId: string, dayNum: number, note: string) {
  try {
    const noteRef = doc(db, 'users', userId, 'notes', dayNum.toString());
    await setDoc(
      noteRef,
      {
        dayNum,
        note,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore saveDayNote warning:', err);
  }
}

/**
 * Admin: Fetch all users from /users collection in Firestore
 */
export async function getAdminAudienceFromFirestore(): Promise<{
  stats: AdminAudienceStats;
  users: Array<UserProfile & { currentDay: number; progressPercent: number; lastActive: string }>;
}> {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);

    const todayStr = new Date().toISOString().split('T')[0];
    const enrichedUsers: Array<UserProfile & { currentDay: number; progressPercent: number; lastActive: string }> = [];

    snapshot.forEach((d) => {
      const u = d.data();
      const completedDaysCount = Number(u.completedDaysCount) || 0;
      const progressPercent = Math.round((completedDaysCount / 365) * 100 * 10) / 10;
      
      let lastActive = 'Never';
      if (u.lastActiveDate === todayStr) {
        lastActive = 'Today';
      } else if (u.lastActiveDate) {
        lastActive = u.lastActiveDate;
      }

      enrichedUsers.push({
        id: u.id || d.id,
        name: u.name || 'Child of God',
        email: u.email || '',
        role: u.role || 'user',
        joinedDate: u.joinedDate || todayStr,
        currentDay: Math.min(365, completedDaysCount + 1),
        progressPercent,
        lastActive,
      });
    });

    const totalAudience = enrichedUsers.length;
    const enrolledIn365 = totalAudience;
    const activeToday = enrichedUsers.filter((u) => u.lastActive === 'Today').length;
    const activeThisWeek = activeToday;
    const totalChaptersRead = snapshot.docs.reduce((acc, curr) => acc + (Number(curr.data().completedChaptersCount) || 0), 0);

    const cohortDistribution = {
      days1to30: enrichedUsers.filter((u) => u.currentDay <= 30 && u.currentDay < 365).length,
      days31to90: enrichedUsers.filter((u) => u.currentDay > 30 && u.currentDay <= 90).length,
      days91to180: enrichedUsers.filter((u) => u.currentDay > 90 && u.currentDay <= 180).length,
      days181to270: enrichedUsers.filter((u) => u.currentDay > 180 && u.currentDay <= 270).length,
      days271to365: enrichedUsers.filter((u) => u.currentDay > 270 && u.currentDay < 365).length,
      completedAll: enrichedUsers.filter((u) => u.currentDay >= 365 && u.progressPercent >= 100).length,
    };

    return {
      stats: {
        totalAudience,
        enrolledIn365,
        activeToday,
        activeThisWeek,
        totalChaptersRead,
        averageProgressPercent: totalAudience > 0 ? Math.round(enrichedUsers.reduce((a, b) => a + b.progressPercent, 0) / totalAudience) : 0,
        cohortDistribution,
      },
      users: enrichedUsers,
    };
  } catch (err) {
    console.warn('Firestore getAdminAudience warning:', err);
    return {
      stats: {
        totalAudience: 0,
        enrolledIn365: 0,
        activeToday: 0,
        activeThisWeek: 0,
        totalChaptersRead: 0,
        averageProgressPercent: 0,
        cohortDistribution: {
          days1to30: 0,
          days31to90: 0,
          days91to180: 0,
          days181to270: 0,
          days271to365: 0,
          completedAll: 0,
        },
      },
      users: [],
    };
  }
}

/**
 * Save broadcast announcement to Firestore /announcements/global
 */
export async function saveAnnouncementToFirestore(announcement: BroadcastAnnouncement) {
  try {
    const ref = doc(db, 'announcements', 'global');
    await setDoc(
      ref,
      {
        ...announcement,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore saveAnnouncement warning:', err);
  }
}

/**
 * Fetch broadcast announcement from Firestore /announcements/global
 */
export async function getAnnouncementFromFirestore(): Promise<BroadcastAnnouncement | null> {
  try {
    const ref = doc(db, 'announcements', 'global');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: data.id || 'global_notice',
        title: data.title || '',
        message: data.message || '',
        author: data.author || 'J Jerish Obed',
        date: data.date || '',
        active: data.active ?? true,
      };
    }
    return null;
  } catch (err) {
    console.warn('Firestore getAnnouncement warning:', err);
    return null;
  }
}

/**
 * Record anonymous or authenticated page visit for real-time traffic tracking
 */
export async function recordVisitorPageView(path: string, userEmail?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    // 1. Never track admin routes
    if (!path || path.startsWith('/admin')) return;

    // 2. Never track founder / owner accounts
    const emailToCheck = (userEmail || auth.currentUser?.email || '').toLowerCase();
    if (
      emailToCheck === 'jerishbtech@gmail.com' ||
      emailToCheck === 'jerishobed@gmail.com' ||
      emailToCheck === 'relationswithgod@gmail.com'
    ) {
      return;
    }

    // Check cached profile in localStorage
    try {
      const stored = localStorage.getItem('rwg_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedEmail = (parsed?.email || '').toLowerCase();
        if (
          storedEmail === 'jerishbtech@gmail.com' ||
          storedEmail === 'jerishobed@gmail.com' ||
          storedEmail === 'relationswithgod@gmail.com' ||
          parsed?.role === 'admin'
        ) {
          return;
        }
      }
    } catch {}

    // Session debounce: avoid duplicate counts within 60s for the exact same path
    const sessionKey = `rwg_pv_${path}`;
    const lastVisit = sessionStorage.getItem(sessionKey);
    const now = Date.now();
    if (lastVisit && now - parseInt(lastVisit, 10) < 60000) {
      return;
    }
    sessionStorage.setItem(sessionKey, now.toString());

    const referrer = document.referrer || 'direct';
    const href = window.location.href;
    const isInstagram =
      referrer.includes('instagram.com') ||
      href.includes('utm_source=instagram') ||
      href.includes('ref=ig') ||
      href.includes('instagram');

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const todayStr = new Date().toISOString().split('T')[0];

    const visitsCol = collection(db, 'visits');
    await addDoc(visitsCol, {
      path,
      referrer: isInstagram ? 'instagram' : (referrer.length > 50 ? referrer.slice(0, 50) : referrer),
      isInstagram,
      isMobile,
      date: todayStr,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    // Non-blocking for visitors
  }
}

export interface VisitorMetrics {
  totalVisits: number;
  visitsToday: number;
  instagramVisits: number;
  mobileVisits: number;
  desktopVisits: number;
  recentVisits: Array<{
    path: string;
    referrer: string;
    isInstagram: boolean;
    isMobile: boolean;
    time: string;
  }>;
}

export async function getVisitorMetricsFromFirestore(): Promise<VisitorMetrics> {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const visitsCol = collection(db, 'visits');
    const q = query(visitsCol, orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);

    let totalVisits = snap.size;
    let visitsToday = 0;
    let instagramVisits = 0;
    let mobileVisits = 0;
    let desktopVisits = 0;
    const recentVisits: VisitorMetrics['recentVisits'] = [];

    snap.forEach((d) => {
      const data = d.data();
      if (data.date === todayStr) visitsToday++;
      if (data.isInstagram) instagramVisits++;
      if (data.isMobile) mobileVisits++;
      else desktopVisits++;

      let timeStr = 'Recently';
      if (data.timestamp?.toDate) {
        timeStr = data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      recentVisits.push({
        path: data.path || '/',
        referrer: data.referrer || 'direct',
        isInstagram: !!data.isInstagram,
        isMobile: !!data.isMobile,
        time: timeStr,
      });
    });

    return {
      totalVisits,
      visitsToday,
      instagramVisits,
      mobileVisits,
      desktopVisits,
      recentVisits: recentVisits.slice(0, 10),
    };
  } catch (e) {
    console.warn('Visitor metrics fetch error:', e);
    return {
      totalVisits: 0,
      visitsToday: 0,
      instagramVisits: 0,
      mobileVisits: 0,
      desktopVisits: 0,
      recentVisits: [],
    };
  }
}
