import type { StreakCalculationContext, StreakStatus } from './types.js';

/**
 * Calculate the current streak status and updated streak count
 */
export function calculateStreak(context: StreakCalculationContext): {
  streakDays: number;
  status: StreakStatus;
  shouldReset: boolean;
  isNewStreak: boolean;
} {
  const { lastPracticeDate, currentStreakDays, currentDate, timezone = 'UTC' } = context;

  // No previous practice - start new streak if practicing today
  if (!lastPracticeDate) {
    return {
      streakDays: 1,
      status: 'active',
      shouldReset: false,
      isNewStreak: true,
    };
  }

  const lastPracticeDay = getStartOfDay(lastPracticeDate, timezone);
  const today = getStartOfDay(currentDate, timezone);
  const daysSinceLastPractice = Math.floor(
    (today.getTime() - lastPracticeDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Practiced today already (same day)
  if (daysSinceLastPractice === 0) {
    return {
      streakDays: currentStreakDays,
      status: getStreakStatus(currentStreakDays, today, timezone),
      shouldReset: false,
      isNewStreak: false,
    };
  }

  // Practiced yesterday (consecutive day) - increment streak
  if (daysSinceLastPractice === 1) {
    const newStreak = currentStreakDays + 1;
    return {
      streakDays: newStreak,
      status: getStreakStatus(newStreak, today, timezone),
      shouldReset: false,
      isNewStreak: false,
    };
  }

  // Missed a day - reset streak
  return {
    streakDays: 1,
    status: 'active',
    shouldReset: true,
    isNewStreak: true,
  };
}

/**
 * Get the streak status based on current time and streak
 */
export function getStreakStatus(
  streakDays: number,
  currentDate: Date,
  timezone: string = 'UTC'
): StreakStatus {
  if (streakDays === 0) return 'broken';

  const now = currentDate;
  const endOfDay = getEndOfDay(currentDate, timezone);
  const hoursRemaining = (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Perfect streak (practiced with >12 hours remaining)
  if (hoursRemaining > 12) {
    return 'perfect';
  }

  // At risk (< 4 hours remaining)
  if (hoursRemaining < 4) {
    return 'at_risk';
  }

  return 'active';
}

/**
 * Get start of day in a given timezone
 */
function getStartOfDay(date: Date, timezone: string): Date {
  const dateString = date.toLocaleDateString('en-US', { timeZone: timezone });
  const [month, day, year] = dateString.split('/').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Get end of day in a given timezone
 */
function getEndOfDay(date: Date, timezone: string): Date {
  const dateString = date.toLocaleDateString('en-US', { timeZone: timezone });
  const [month, day, year] = dateString.split('/').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
}

/**
 * Check if the user has practiced today
 */
export function hasPracticedToday(
  lastPracticeDate: Date | null,
  currentDate: Date,
  timezone: string = 'UTC'
): boolean {
  if (!lastPracticeDate) return false;

  const lastPracticeDay = getStartOfDay(lastPracticeDate, timezone);
  const today = getStartOfDay(currentDate, timezone);

  return lastPracticeDay.getTime() === today.getTime();
}

/**
 * Get the league tier based on streak
 */
export function getLeagueTierFromStreak(streakDays: number): string {
  if (streakDays >= 100) return 'diamond';
  if (streakDays >= 50) return 'platinum';
  if (streakDays >= 21) return 'gold';
  if (streakDays >= 7) return 'silver';
  return 'bronze';
}

/**
 * Calculate streak bonus XP multiplier
 */
export function getStreakXPMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 1.5;
  if (streakDays >= 14) return 1.3;
  if (streakDays >= 7) return 1.2;
  if (streakDays >= 3) return 1.1;
  return 1.0;
}

/**
 * Get hours remaining in the day
 */
export function getHoursRemainingToday(currentDate: Date, timezone: string = 'UTC'): number {
  const endOfDay = getEndOfDay(currentDate, timezone);
  const hoursRemaining = (endOfDay.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
  return Math.max(0, Math.round(hoursRemaining * 10) / 10);
}
