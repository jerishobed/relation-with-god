'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserProgress } from '@/types';
import { auth, googleProvider } from './firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  DEFAULT_PROGRESS,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  getStoredProgress,
  setStoredProgress,
  resetUserProgress,
  registerUser,
  toggleChapterCompletion,
  toggleDayCompletion,
  saveDayNote,
  createFreshProgress,
} from './storage';
import {
  syncUserProfileToFirestore,
  getUserProgressFromFirestore,
  saveUserProgressToFirestore,
  saveDayNoteToFirestore,
} from './firestoreService';

interface AuthContextType {
  user: UserProfile | null;
  progress: UserProgress;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginAdmin: (usernameOrEmail: string, passcode: string) => { success: boolean; error?: string };
  logout: () => Promise<void>;
  logoutAdmin: () => void;
  enrollInProgram: () => void;
  toggleChapter: (dayNum: number, chapterId: string) => void;
  toggleDay: (dayNum: number) => void;
  saveNote: (dayNum: number, note: string) => void;
  resetProgress: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    // Check initial local cached user while Firebase initializes
    const localUser = getStoredUser();
    if (localUser) {
      setUser(localUser);
      const localProg = getStoredProgress(localUser.id);
      setProgress(localProg);
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const isOwner =
          fbUser.email === 'jerishbtech@gmail.com' ||
          fbUser.email === 'relationswithgod@gmail.com';

        const profile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Devotee',
          email: fbUser.email || '',
          role: isOwner ? 'admin' : 'user',
          joinedDate: new Date().toISOString().split('T')[0],
          avatar: fbUser.photoURL || undefined,
        };

        setUser(profile);
        setStoredUser(profile);
        registerUser(profile);

        // Sync to User-isolated Firestore document
        await syncUserProfileToFirestore(profile);

        // Fetch user-isolated progress from Firestore
        const localProg = getStoredProgress(fbUser.uid);
        if (localProg && (localProg.completedDays.length > 0 || localProg.completedChapters.length > 0)) {
          setProgress(localProg);
        }

        try {
          const firestoreProg = await getUserProgressFromFirestore(fbUser.uid);
          if (firestoreProg) {
            // Smart merge: merge local and firestore progress so user NEVER loses completed chapters or days!
            const mergedCompletedDays = Array.from(
              new Set([...(localProg?.completedDays || []), ...firestoreProg.completedDays])
            ).sort((a, b) => a - b);

            const mergedCompletedChapters = Array.from(
              new Set([...(localProg?.completedChapters || []), ...firestoreProg.completedChapters])
            );

            const mergedStreak = Math.max(localProg?.currentStreak || 0, firestoreProg.currentStreak || 0);

            const mergedNotes = {
              ...(localProg?.notes || {}),
              ...firestoreProg.notes,
            };

            const finalProg: UserProgress = {
              ...firestoreProg,
              completedDays: mergedCompletedDays,
              completedChapters: mergedCompletedChapters,
              currentStreak: mergedStreak,
              notes: mergedNotes,
            };

            setProgress(finalProg);
            setStoredProgress(finalProg);
            saveUserProgressToFirestore(fbUser.uid, finalProg);
          } else if (localProg) {
            setProgress(localProg);
            saveUserProgressToFirestore(fbUser.uid, localProg);
          }
        } catch (e) {
          console.warn('Sync progress warning, keeping local progress:', e);
          if (localProg) {
            setProgress(localProg);
          }
        }
      } else {
        // If not logged into Firebase and not admin session
        const currentLocal = getStoredUser();
        if (!currentLocal || currentLocal.id !== 'usr_jerishbtech') {
          setUser(null);
          clearStoredUser();
          setProgress(createFreshProgress('guest'));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // 1. Google Auth via Firebase
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        closeAuthModal();
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Email / Password Sign In via Firebase
  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      closeAuthModal();
    } finally {
      setLoading(false);
    }
  };

  // 3. Email / Password Sign Up via Firebase
  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (res.user && name.trim()) {
        await updateProfile(res.user, { displayName: name.trim() });
      }
      closeAuthModal();
    } finally {
      setLoading(false);
    }
  };

  // 4. Sign Out via Firebase
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    clearStoredUser();
    setUser(null);
    setProgress(createFreshProgress('guest'));
  };

  // Dedicated Jerishbtech Admin Login
  const loginAdmin = (usernameOrEmail: string, passcode: string): { success: boolean; error?: string } => {
    const cleanUser = usernameOrEmail.toLowerCase().trim();
    const isJerishbtech =
      cleanUser === 'jerishbtech' ||
      cleanUser === 'jerishbtech@gmail.com' ||
      cleanUser === 'relationswithgod@gmail.com';

    if (!isJerishbtech) {
      return {
        success: false,
        error: 'Access Restricted: Only jerishbtech is authorized to access the ministry console.',
      };
    }

    const validPasswords = [
      'jerishbtech',
      'jerish2026',
      'rwg2026',
      'rwg_jerish_obed_ministries',
      'relationswithgod',
      'admin123',
    ];

    if (!passcode || !validPasswords.includes(passcode.trim())) {
      return {
        success: false,
        error: 'Invalid password. Please enter the founder passcode.',
      };
    }

    const adminUser: UserProfile = {
      id: 'usr_jerishbtech',
      name: 'J Jerish Obed (jerishbtech)',
      email: 'jerishbtech@gmail.com',
      role: 'admin',
      joinedDate: '2024-01-01',
    };

    setUser(adminUser);
    setStoredUser(adminUser);
    return { success: true };
  };

  const logoutAdmin = () => {
    clearStoredUser();
    setUser(null);
    setProgress(createFreshProgress('guest'));
  };

  const enrollInProgram = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    const updated: UserProgress = {
      ...progress,
      enrolled: true,
      startDate: new Date().toISOString().split('T')[0],
    };
    setProgress(updated);
    setStoredProgress(updated);
    if (user?.id) {
      saveUserProgressToFirestore(user.id, updated);
    }
  };

  const toggleChapter = (dayNum: number, chapterId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    const updated = toggleChapterCompletion(progress, dayNum, chapterId);
    setProgress(updated);
    setStoredProgress(updated);
    if (user?.id) {
      saveUserProgressToFirestore(user.id, updated);
    }
  };

  const toggleDay = (dayNum: number) => {
    if (!user) {
      openAuthModal();
      return;
    }
    const updated = toggleDayCompletion(progress, dayNum);
    setProgress(updated);
    setStoredProgress(updated);
    if (user?.id) {
      saveUserProgressToFirestore(user.id, updated);
    }
  };

  const saveNote = (dayNum: number, note: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    const updated = saveDayNote(progress, dayNum, note);
    setProgress(updated);
    setStoredProgress(updated);
    if (user?.id) {
      saveUserProgressToFirestore(user.id, updated);
      saveDayNoteToFirestore(user.id, dayNum, note);
    }
  };

  const resetProgress = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    const targetId = user.id;
    const fresh = resetUserProgress(targetId);
    setProgress(fresh);
    saveUserProgressToFirestore(user.id, fresh);
  };

  const isJerishAdmin =
    user?.role === 'admin' &&
    (user.id === 'usr_jerishbtech' ||
      user.email === 'jerishbtech@gmail.com' ||
      user.email === 'relationswithgod@gmail.com');

  return (
    <AuthContext.Provider
      value={{
        user,
        progress,
        isAuthenticated: !!user,
        isAdmin: isJerishAdmin,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        loginAdmin,
        logout,
        logoutAdmin,
        enrollInProgram,
        toggleChapter,
        toggleDay,
        saveNote,
        resetProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
