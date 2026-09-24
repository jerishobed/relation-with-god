export type Language = 'ta' | 'en' | 'bilingual';

export type ReadingTheme = 'sanctuary' | 'midnight' | 'sepia';

export interface ChapterRef {
  id: string;
  raw: string;
  bookEnglish: string;
  bookTamil: string;
  passage: string;
  chapter: string;
  englishRef: string;
  tamilRef: string;
  youversionCode: string;
  youversionEnglishUrl: string;
  youversionTamilUrl: string;
}

export interface PeriodInfo {
  id: string;
  nameEn: string;
  nameTa: string;
}

export interface ReadingDay {
  day: number;
  period: PeriodInfo;
  chaptersCount: number;
  chapters: ChapterRef[];
  tamilSummary: string;
  englishSummary: string;
}

export interface UserProgress {
  userId: string;
  enrolled: boolean;
  startDate: string; // ISO date string
  completedDays: number[]; // e.g. [1, 2, 3]
  completedChapters: string[]; // e.g. ['GEN_1', 'GEN_2']
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  notes: Record<number, string>; // day -> user prayer note
  bookmarks: number[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  joinedDate: string;
  avatar?: string;
}

export interface BroadcastAnnouncement {
  id: string;
  title: string;
  message: string;
  author: string;
  date: string;
  active: boolean;
}

export interface AdminAudienceStats {
  totalAudience: number;
  enrolledIn365: number;
  activeToday: number;
  activeThisWeek: number;
  totalChaptersRead: number;
  averageProgressPercent: number;
  cohortDistribution: {
    days1to30: number;
    days31to90: number;
    days91to180: number;
    days181to270: number;
    days271to365: number;
    completedAll: number;
  };
}

export type BookletRequestStatus = 'pending' | 'dispatched' | 'delivered' | 'cancelled';

export interface BookletRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  languagePreference: 'ta' | 'en' | 'bilingual';
  prayerRequest?: string;
  status: BookletRequestStatus;
  trackingNumber?: string;
  courierPartner?: string;
  adminNotes?: string;
  userId?: string | null;
  createdAt: string; // ISO date string
  dispatchedAt?: string;
  deliveredAt?: string;
}
