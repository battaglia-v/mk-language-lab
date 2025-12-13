'use client';

/**
 * Practice Activity Tracker
 * 
 * Tracks daily practice sessions for streak calendar/heatmap visualization.
 * Stores the last 365 days of activity data.
 */

const STORAGE_KEY = 'mkll:practice-activity';
const MAX_DAYS = 365;

export type DailyActivity = {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Number of cards reviewed */
  cardsReviewed: number;
  /** Number of correct answers */
  correctCount: number;
  /** Total practice time in seconds */
  timeSpentSeconds: number;
  /** Number of practice sessions */
  sessions: number;
};

export type ActivityData = Record<string, DailyActivity>;

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Read all activity data from localStorage
 */
export function readActivityData(): ActivityData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ActivityData;
  } catch (error) {
    console.warn('[Activity] Failed to read data', error);
    return {};
  }
}

/**
 * Write activity data to localStorage (prunes old data)
 */
export function writeActivityData(data: ActivityData): void {
  if (typeof window === 'undefined') return;
  
  // Prune data older than MAX_DAYS
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS);
  const cutoffKey = cutoffDate.toISOString().split('T')[0];
  
  const prunedData: ActivityData = {};
  for (const [date, activity] of Object.entries(data)) {
    if (date >= cutoffKey) {
      prunedData[date] = activity;
    }
  }
  
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prunedData));
}

/**
 * Record a practice session
 */
export function recordPracticeSession(
  cardsReviewed: number,
  correctCount: number,
  timeSpentSeconds: number
): DailyActivity {
  const data = readActivityData();
  const today = getTodayKey();
  
  const existing = data[today] || {
    date: today,
    cardsReviewed: 0,
    correctCount: 0,
    timeSpentSeconds: 0,
    sessions: 0,
  };
  
  const updated: DailyActivity = {
    date: today,
    cardsReviewed: existing.cardsReviewed + cardsReviewed,
    correctCount: existing.correctCount + correctCount,
    timeSpentSeconds: existing.timeSpentSeconds + timeSpentSeconds,
    sessions: existing.sessions + 1,
  };
  
  data[today] = updated;
  writeActivityData(data);
  
  return updated;
}

/**
 * Get activity for the last N days
 */
export function getActivityRange(days: number): DailyActivity[] {
  const data = readActivityData();
  const result: DailyActivity[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    
    result.push(
      data[key] || {
        date: key,
        cardsReviewed: 0,
        correctCount: 0,
        timeSpentSeconds: 0,
        sessions: 0,
      }
    );
  }
  
  return result.reverse(); // Oldest first
}

/**
 * Calculate current streak (consecutive days with activity)
 */
export function getCurrentStreak(): number {
  const data = readActivityData();
  let streak = 0;
  const today = new Date();
  
  // Check if practiced today
  const todayKey = today.toISOString().split('T')[0];
  const practicedToday = data[todayKey]?.sessions > 0;
  
  // Start checking from today or yesterday
  const startOffset = practicedToday ? 0 : 1;
  
  for (let i = startOffset; i < MAX_DAYS; i++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - i);
    const key = checkDate.toISOString().split('T')[0];
    
    if (data[key]?.sessions > 0) {
      streak++;
    } else if (i === startOffset && !practicedToday) {
      // Haven't practiced yet today, check if streak is broken
      break;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Get longest streak ever
 */
export function getLongestStreak(): number {
  const data = readActivityData();
  const dates = Object.keys(data).sort();
  
  if (dates.length === 0) return 0;
  
  let maxStreak = 0;
  let currentStreak = 0;
  let previousDate: Date | null = null;
  
  for (const dateStr of dates) {
    const activity = data[dateStr];
    if (activity.sessions === 0) continue;
    
    const currentDate = new Date(dateStr);
    
    if (previousDate) {
      const diffDays = Math.floor(
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    
    previousDate = currentDate;
  }
  
  return Math.max(maxStreak, currentStreak);
}

/**
 * Get total stats
 */
export function getTotalStats(): {
  totalCards: number;
  totalCorrect: number;
  totalTimeMinutes: number;
  totalSessions: number;
  daysActive: number;
} {
  const data = readActivityData();
  const activities = Object.values(data);
  
  return {
    totalCards: activities.reduce((sum, a) => sum + a.cardsReviewed, 0),
    totalCorrect: activities.reduce((sum, a) => sum + a.correctCount, 0),
    totalTimeMinutes: Math.round(
      activities.reduce((sum, a) => sum + a.timeSpentSeconds, 0) / 60
    ),
    totalSessions: activities.reduce((sum, a) => sum + a.sessions, 0),
    daysActive: activities.filter((a) => a.sessions > 0).length,
  };
}

/**
 * Get activity level for a day (0-4 for heatmap intensity)
 */
export function getActivityLevel(cardsReviewed: number): 0 | 1 | 2 | 3 | 4 {
  if (cardsReviewed === 0) return 0;
  if (cardsReviewed < 5) return 1;
  if (cardsReviewed < 15) return 2;
  if (cardsReviewed < 30) return 3;
  return 4;
}

/**
 * Clear all activity data
 */
export function clearActivityData(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
