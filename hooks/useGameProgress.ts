import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

type Level = 'beginner' | 'intermediate' | 'advanced';

interface GameProgress {
  streak: number;
  xp: number;
  level: Level;
  hearts: number;
  lastPracticeDate: string | null;
  streakUpdatedAt: string | null;
}

interface UseGameProgressReturn {
  streak: number;
  xp: number;
  level: Level;
  hearts: number;
  isLoading: boolean;
  updateProgress: (updates: Partial<GameProgress>) => Promise<void>;
  syncToDatabase: () => Promise<void>;
}

const calculateLevel = (xp: number): Level => {
  if (xp >= 500) return 'advanced';
  if (xp >= 200) return 'intermediate';
  return 'beginner';
};

// Helper to get progress from localStorage
const getLocalProgress = (): GameProgress => {
  if (typeof window === 'undefined') {
    return { streak: 0, xp: 0, level: 'beginner', hearts: 5, lastPracticeDate: null, streakUpdatedAt: null };
  }

  const data = localStorage.getItem('practice-streak');
  if (!data) {
    return { streak: 0, xp: 0, level: 'beginner', hearts: 5, lastPracticeDate: null, streakUpdatedAt: null };
  }

  try {
    const parsed = JSON.parse(data);
    return {
      streak: parsed.streak || 0,
      xp: parsed.xp || 0,
      level: calculateLevel(parsed.xp || 0),
      hearts: parsed.hearts ?? 5,
      lastPracticeDate: parsed.lastPracticeDate || null,
      streakUpdatedAt: parsed.streakUpdatedAt || null,
    };
  } catch {
    return { streak: 0, xp: 0, level: 'beginner', hearts: 5, lastPracticeDate: null, streakUpdatedAt: null };
  }
};

// Helper to save progress to localStorage
const saveLocalProgress = (progress: GameProgress) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('practice-streak', JSON.stringify(progress));
  }
};

export function useGameProgress(): UseGameProgressReturn {
  const { data: session, status } = useSession();

  // Initialize with localStorage data to prevent showing 0 before load completes
  const initialProgress = typeof window !== 'undefined' ? getLocalProgress() : { streak: 0, xp: 0, level: 'beginner' as Level, hearts: 5, lastPracticeDate: null, streakUpdatedAt: null };

  const [streak, setStreak] = useState(initialProgress.streak);
  const [xp, setXP] = useState(initialProgress.xp);
  const [level, setLevel] = useState<Level>(initialProgress.level);
  const [hearts, setHearts] = useState(initialProgress.hearts);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMigrated, setHasMigrated] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch progress from database (for authenticated users)
  const fetchDatabaseProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/user/progress');
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      if (data.success && data.progress) {
        return {
          streak: data.progress.streak,
          xp: data.progress.xp,
          level: data.progress.level as Level,
          hearts: data.progress.hearts,
          lastPracticeDate: data.progress.lastPracticeDate,
          streakUpdatedAt: data.progress.streakUpdatedAt,
        };
      }
      return null;
    } catch (error) {
      console.error('[useGameProgress] Error fetching database progress:', error);
      return null;
    }
  }, []);

  // Sync progress to database (debounced)
  const syncToDatabase = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const progressData = {
        streak,
        xp,
        level,
        hearts,
        lastPracticeDate: new Date().toISOString(),
        streakUpdatedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        throw new Error('Failed to sync progress');
      }
    } catch (error) {
      console.error('[useGameProgress] Error syncing to database:', error);
    }
  }, [session, streak, xp, level, hearts]);

  // Migrate localStorage data to database (one-time)
  const migrateLocalStorageToDatabase = useCallback(async () => {
    if (!session?.user?.id || hasMigrated) return;

    const localProgress = getLocalProgress();

    // Check if user has any local progress worth migrating
    if (localProgress.xp > 0 || localProgress.streak > 0) {
      try {
        await fetch('/api/user/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streak: localProgress.streak,
            xp: localProgress.xp,
            level: localProgress.level,
            hearts: localProgress.hearts,
            lastPracticeDate: new Date().toISOString(),
            streakUpdatedAt: new Date().toISOString(),
          }),
        });
        console.log('[useGameProgress] Successfully migrated localStorage data to database');
      } catch (error) {
        console.error('[useGameProgress] Error migrating data:', error);
      }
    }

    setHasMigrated(true);
  }, [session, hasMigrated]);

  // Initial load: fetch from database or localStorage
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);

      if (status === 'loading') {
        return; // Wait for session to load
      }

      if (session?.user?.id) {
        // Authenticated: fetch from database
        const dbProgress = await fetchDatabaseProgress();

        if (dbProgress) {
          // Use database progress
          setStreak(dbProgress.streak);
          setXP(dbProgress.xp);
          setLevel(dbProgress.level);
          setHearts(dbProgress.hearts);
        } else {
          // Database fetch failed, use localStorage and try to migrate
          const localProgress = getLocalProgress();
          setStreak(localProgress.streak);
          setXP(localProgress.xp);
          setLevel(localProgress.level);
          setHearts(localProgress.hearts);
          await migrateLocalStorageToDatabase();
        }
      } else {
        // Not authenticated: use localStorage
        const localProgress = getLocalProgress();
        setStreak(localProgress.streak);
        setXP(localProgress.xp);
        setLevel(localProgress.level);
        setHearts(localProgress.hearts);
      }

      setIsLoading(false);
    };

    loadProgress();
  }, [session, status, fetchDatabaseProgress, migrateLocalStorageToDatabase]);

  // Update progress (both state and persistence)
  const updateProgress = useCallback(async (updates: Partial<GameProgress>) => {
    const newStreak = updates.streak ?? streak;
    const newXP = updates.xp ?? xp;
    const newLevel = updates.level ?? calculateLevel(newXP);
    const newHearts = updates.hearts ?? hearts;

    // Update state immediately
    if (updates.streak !== undefined) setStreak(newStreak);
    if (updates.xp !== undefined) {
      setXP(newXP);
      setLevel(newLevel);
    }
    if (updates.hearts !== undefined) setHearts(newHearts);

    // Save to localStorage immediately (fallback)
    const progressData = {
      streak: newStreak,
      xp: newXP,
      level: newLevel,
      hearts: newHearts,
      lastPracticeDate: new Date().toISOString(),
      streakUpdatedAt: new Date().toISOString(),
    };
    saveLocalProgress(progressData);

    // Debounced database sync for authenticated users
    if (session?.user?.id) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        await syncToDatabase();
      }, 1000); // Wait 1 second before syncing to avoid excessive API calls
    }
  }, [session, streak, xp, hearts, syncToDatabase]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    streak,
    xp,
    level,
    hearts,
    isLoading,
    updateProgress,
    syncToDatabase,
  };
}
