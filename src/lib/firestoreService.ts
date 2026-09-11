import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { UserProfile, UserProgress, AdminAudienceStats } from '@/types';
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

    const enrichedUsers: Array<UserProfile & { currentDay: number; progressPercent: number; lastActive: string }> = [];

    snapshot.forEach((d) => {
      const u = d.data();
      const completedDaysCount = u.completedDaysCount || 0;
      const progressPercent = Math.round((completedDaysCount / 365) * 100 * 10) / 10;
      enrichedUsers.push({
        id: u.id || d.id,
        name: u.name || 'Devotee',
        email: u.email || '',
        role: u.role || 'user',
        joinedDate: u.joinedDate || new Date().toISOString().split('T')[0],
        currentDay: Math.min(365, completedDaysCount + 1),
        progressPercent,
        lastActive: u.lastActiveDate || 'Recently',
      });
    });

    const totalAudience = enrichedUsers.length;
    const enrolledIn365 = totalAudience;
    const activeToday = enrichedUsers.filter((u) => u.lastActive === 'Today').length;
    const activeThisWeek = activeToday;
    const totalChaptersRead = snapshot.docs.reduce((acc, curr) => acc + (curr.data().completedChaptersCount || 0), 0);

    const cohortDistribution = {
      days1to30: enrichedUsers.filter((u) => u.currentDay <= 30).length,
      days31to90: enrichedUsers.filter((u) => u.currentDay > 30 && u.currentDay <= 90).length,
      days91to180: enrichedUsers.filter((u) => u.currentDay > 90 && u.currentDay <= 180).length,
      days181to270: enrichedUsers.filter((u) => u.currentDay > 180 && u.currentDay <= 270).length,
      days271to365: enrichedUsers.filter((u) => u.currentDay > 270 && u.currentDay <= 365).length,
      completedAll: enrichedUsers.filter((u) => u.currentDay >= 365).length,
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
