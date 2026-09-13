import { UserProgress, UserProfile, BroadcastAnnouncement, AdminAudienceStats } from '@/types';
import planData from '@/data/readingPlan.json';

const STORAGE_KEYS = {
  USER: 'rwg_current_user',
  PROGRESS: 'rwg_user_progress',
  THEME: 'rwg_theme',
  LANG: 'rwg_language',
  ANNOUNCEMENT: 'rwg_announcement',
};

export const DEFAULT_USER: UserProfile = {
  id: 'guest_user',
  name: 'Child of God',
  email: 'guest@relationwithgod.in',
  role: 'user',
  joinedDate: new Date().toISOString().split('T')[0],
};

export const ADMIN_USER: UserProfile = {
  id: 'usr_jerishbtech',
  name: 'J Jerish Obed (jerishbtech)',
  email: 'jerishbtech@gmail.com',
  role: 'admin',
  joinedDate: '2024-01-01',
};

export const createFreshProgress = (userId: string): UserProgress => ({
  userId,
  enrolled: true,
  startDate: new Date().toISOString().split('T')[0],
  completedDays: [],
  completedChapters: [],
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  notes: {},
  bookmarks: [],
});

export const DEFAULT_PROGRESS: UserProgress = createFreshProgress('guest_user');

export const DEFAULT_ANNOUNCEMENT: BroadcastAnnouncement = {
  id: 'welcome_notice',
  title: 'Welcome to the 365-Day Chronological Bible Journey! ✨',
  message: '“Thy word is a lamp unto my feet, and a light unto my path.” (Psalm 119:105). Welcome to our spiritual family at Relation With God. Let us walk through Scripture day by day together!',
  author: 'J Jerish Obed',
  date: new Date().toISOString().split('T')[0],
  active: true,
};

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return null;
    const parsed = JSON.parse(data);
    // Automatically purge old test/demo sessions from localStorage
    if (
      parsed &&
      (parsed.id === 'guest_devotee' ||
        parsed.id === 'guest_user' ||
        parsed.id.startsWith('guest_') ||
        parsed.email === 'devotee@gmail.com' ||
        parsed.name === 'Google Devotee' ||
        parsed.id === 'default_devotee')
    ) {
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null) {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getStoredProgress(userId?: string): UserProgress {
  const uid = userId || 'default';
  if (typeof window === 'undefined') return createFreshProgress(uid);
  try {
    const key = `${STORAGE_KEYS.PROGRESS}_${uid}`;
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    
    // Create and save clean fresh progress for new user
    const fresh = createFreshProgress(uid);
    localStorage.setItem(key, JSON.stringify(fresh));
    return fresh;
  } catch {
    return createFreshProgress(uid);
  }
}

export function resetUserProgress(userId: string): UserProgress {
  const fresh = createFreshProgress(userId);
  setStoredProgress(fresh);
  return fresh;
}

export function setStoredProgress(progress: UserProgress) {
  if (typeof window === 'undefined') return;
  const key = `${STORAGE_KEYS.PROGRESS}_${progress.userId}`;
  localStorage.setItem(key, JSON.stringify(progress));
}

export function toggleChapterCompletion(
  progress: UserProgress,
  dayNum: number,
  chapterId: string
): UserProgress {
  const isCompleted = progress.completedChapters.includes(chapterId);
  const updatedChapters = isCompleted
    ? progress.completedChapters.filter((c) => c !== chapterId)
    : [...progress.completedChapters, chapterId];

  // Check if all chapters of the day are completed
  const dayData = planData.days.find((d) => d.day === dayNum);
  const allDayChaptersCompleted = dayData
    ? dayData.chapters.every((c) => updatedChapters.includes(c.id))
    : false;

  let updatedCompletedDays = [...progress.completedDays];
  if (allDayChaptersCompleted && !updatedCompletedDays.includes(dayNum)) {
    updatedCompletedDays.push(dayNum);
    updatedCompletedDays.sort((a, b) => a - b);
  } else if (!allDayChaptersCompleted && updatedCompletedDays.includes(dayNum)) {
    updatedCompletedDays = updatedCompletedDays.filter((d) => d !== dayNum);
  }

  // Update streak calculation
  const todayStr = new Date().toISOString().split('T')[0];
  let streak = progress.currentStreak;
  if (!isCompleted && progress.lastActiveDate !== todayStr) {
    // Check if last active was yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (progress.lastActiveDate === yesterdayStr) {
      streak += 1;
    } else if (progress.lastActiveDate !== todayStr) {
      streak = 1;
    }
  }

  const updated: UserProgress = {
    ...progress,
    completedChapters: updatedChapters,
    completedDays: updatedCompletedDays,
    lastActiveDate: todayStr,
    currentStreak: streak,
    longestStreak: Math.max(progress.longestStreak, streak),
  };

  setStoredProgress(updated);
  return updated;
}

export function toggleDayCompletion(progress: UserProgress, dayNum: number): UserProgress {
  const isDayCompleted = progress.completedDays.includes(dayNum);
  const dayData = planData.days.find((d) => d.day === dayNum);
  if (!dayData) return progress;

  const dayChapterIds = dayData.chapters.map((c) => c.id);

  let updatedChapters = [...progress.completedChapters];
  let updatedDays = [...progress.completedDays];

  if (isDayCompleted) {
    // Unmark day and its chapters
    updatedDays = updatedDays.filter((d) => d !== dayNum);
    updatedChapters = updatedChapters.filter((c) => !dayChapterIds.includes(c));
  } else {
    // Mark day and all its chapters as completed
    if (!updatedDays.includes(dayNum)) {
      updatedDays.push(dayNum);
      updatedDays.sort((a, b) => a - b);
    }
    for (const cid of dayChapterIds) {
      if (!updatedChapters.includes(cid)) {
        updatedChapters.push(cid);
      }
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const updated: UserProgress = {
    ...progress,
    completedDays: updatedDays,
    completedChapters: updatedChapters,
    lastActiveDate: todayStr,
    currentStreak: isDayCompleted ? progress.currentStreak : Math.max(1, progress.currentStreak),
  };

  setStoredProgress(updated);
  return updated;
}

export function saveDayNote(progress: UserProgress, dayNum: number, note: string): UserProgress {
  const updated: UserProgress = {
    ...progress,
    notes: {
      ...progress.notes,
      [dayNum]: note,
    },
  };
  setStoredProgress(updated);
  return updated;
}

export function getStoredAnnouncement(): BroadcastAnnouncement {
  if (typeof window === 'undefined') return DEFAULT_ANNOUNCEMENT;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT);
    return data ? JSON.parse(data) : DEFAULT_ANNOUNCEMENT;
  } catch {
    return DEFAULT_ANNOUNCEMENT;
  }
}

export function setStoredAnnouncement(announcement: BroadcastAnnouncement) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, JSON.stringify(announcement));
}

export function getRegisteredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('rwg_registered_users');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function registerUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id || u.email === user.email);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem('rwg_registered_users', JSON.stringify(users));
  } catch {
    // ignore
  }
}

export function getRealAudienceData(): {
  stats: AdminAudienceStats;
  users: Array<UserProfile & { currentDay: number; progressPercent: number; lastActive: string }>;
} {
  const registered = getRegisteredUsers();
  
  // If no users registered yet, check current user
  const currentUser = getStoredUser();
  if (registered.length === 0 && currentUser && currentUser.id !== 'guest_user' && currentUser.id !== 'guest_devotee') {
    registered.push(currentUser);
  }

  const enrichedUsers = registered.map((u) => {
    const prog = getStoredProgress(u.id);
    const completedCount = prog.completedDays.length;
    const progressPercent = Math.round((completedCount / 365) * 100 * 10) / 10;
    
    // Find latest day
    let currentDay = 1;
    if (prog.completedDays.length > 0) {
      currentDay = Math.min(365, Math.max(...prog.completedDays) + 1);
    }

    let lastActive = 'Never';
    const todayStr = new Date().toISOString().split('T')[0];
    if (prog.lastActiveDate === todayStr) {
      lastActive = 'Today';
    } else if (prog.lastActiveDate) {
      lastActive = prog.lastActiveDate;
    }

    return {
      ...u,
      currentDay,
      progressPercent,
      lastActive,
      completedChaptersCount: prog.completedChapters.length,
      completedDaysCount: completedCount,
    };
  });

  const totalAudience = enrichedUsers.length;
  const enrolledIn365 = enrichedUsers.filter((u) => {
    const p = getStoredProgress(u.id);
    return p.enrolled;
  }).length;

  const activeToday = enrichedUsers.filter((u) => u.lastActive === 'Today').length;
  const activeThisWeek = activeToday; // real active count

  let totalChapters = 0;
  let totalPercentSum = 0;

  const cohorts = {
    days1to30: 0,
    days31to90: 0,
    days91to180: 0,
    days181to270: 0,
    days271to365: 0,
    completedAll: 0,
  };

  enrichedUsers.forEach((u) => {
    totalChapters += u.completedChaptersCount;
    totalPercentSum += u.progressPercent;
    if (u.completedDaysCount >= 365) {
      cohorts.completedAll++;
    } else if (u.currentDay <= 30) {
      cohorts.days1to30++;
    } else if (u.currentDay <= 90) {
      cohorts.days31to90++;
    } else if (u.currentDay <= 180) {
      cohorts.days91to180++;
    } else if (u.currentDay <= 270) {
      cohorts.days181to270++;
    } else {
      cohorts.days271to365++;
    }
  });

  const averageProgressPercent = totalAudience > 0 ? Math.round((totalPercentSum / totalAudience) * 10) / 10 : 0;

  const stats: AdminAudienceStats = {
    totalAudience,
    enrolledIn365,
    activeToday,
    activeThisWeek,
    totalChaptersRead: totalChapters,
    averageProgressPercent,
    cohortDistribution: cohorts,
  };

  return {
    stats,
    users: enrichedUsers,
  };
}

// Keep alias for backwards compatibility
export const getMockAudienceData = getRealAudienceData;
