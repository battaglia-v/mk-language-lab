import { getStreakStatus, getHoursRemainingToday } from '@mk/gamification';

export type ReminderType = 'streak_at_risk' | 'quest_expiring' | 'daily_nudge' | 'achievement_earned';

export type ReminderContext = {
  userId: string;
  streakDays: number;
  lastPracticeDate: Date | null;
  dailyXP: number;
  dailyXPTarget: number;
  timezone: string;
};

export type QuietHoursConfig = {
  enabled: boolean;
  startHour: number; // 0-23
  endHour: number; // 0-23
};

/**
 * Check if a reminder should be sent based on streak status
 */
export function shouldSendStreakReminder(context: ReminderContext): boolean {
  const now = new Date();
  const hoursRemaining = getHoursRemainingToday(now, context.timezone);

  // Only send if < 4 hours remaining and user hasn't practiced today
  if (hoursRemaining > 4) return false;

  const status = getStreakStatus(context.streakDays, now, context.timezone);

  // Send reminder if streak is at risk and user has a streak to protect
  return status === 'at_risk' && context.streakDays >= 3;
}

/**
 * Check if current time falls within quiet hours
 */
export function isQuietHours(quietHours: QuietHoursConfig, timezone: string): boolean {
  if (!quietHours.enabled) return false;

  const now = new Date();
  const currentHour = parseInt(
    now.toLocaleString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    })
  );

  const { startHour, endHour } = quietHours;

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (startHour > endHour) {
    return currentHour >= startHour || currentHour < endHour;
  }

  // Normal quiet hours (e.g., 08:00 - 22:00)
  return currentHour >= startHour && currentHour < endHour;
}

/**
 * Generate streak reminder notification content
 */
export function generateStreakReminderNotification(context: ReminderContext): {
  type: ReminderType;
  title: string;
  body: string;
  actionUrl: string;
} {
  const hoursRemaining = Math.floor(getHoursRemainingToday(new Date(), context.timezone));

  return {
    type: 'streak_at_risk',
    title: `🔥 ${context.streakDays}-day streak at risk!`,
    body: `Only ${hoursRemaining} hours left to practice today. Complete one quick session to keep your streak alive.`,
    actionUrl: '/practice',
  };
}

/**
 * Generate daily XP progress reminder
 */
export function generateDailyNudgeNotification(context: ReminderContext): {
  type: ReminderType;
  title: string;
  body: string;
  actionUrl: string;
} {
  const remaining = context.dailyXPTarget - context.dailyXP;
  const percentComplete = Math.round((context.dailyXP / context.dailyXPTarget) * 100);

  if (percentComplete >= 100) {
    return {
      type: 'daily_nudge',
      title: '🎯 Daily goal complete!',
      body: `You've earned ${context.dailyXP} XP today. Keep the momentum going!`,
      actionUrl: '/profile',
    };
  }

  return {
    type: 'daily_nudge',
    title: '⚡ Quick practice reminder',
    body: `You're ${percentComplete}% toward your daily goal. Earn ${remaining} more XP to complete it!`,
    actionUrl: '/practice',
  };
}

/**
 * Calculate optimal reminder time based on user's practice history
 * Returns the hour of day (0-23) when user is most likely to practice
 */
export function calculateOptimalReminderHour(
  practiceHistory: Array<{ attemptedAt: Date }>,
  timezone: string
): number {
  if (practiceHistory.length === 0) {
    // Default to 7 PM if no history
    return 19;
  }

  // Count practice sessions by hour
  const hourCounts = new Map<number, number>();

  practiceHistory.forEach((session) => {
    const hour = parseInt(
      session.attemptedAt.toLocaleString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      })
    );
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  // Find most common hour
  let maxCount = 0;
  let bestHour = 19; // default

  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      bestHour = hour;
    }
  });

  return bestHour;
}

/**
 * Check if enough time has passed since last reminder
 */
export function canSendReminder(
  lastReminderSentAt: Date | null,
  minimumGapHours: number = 4
): boolean {
  if (!lastReminderSentAt) return true;

  const hoursSinceLastReminder =
    (Date.now() - lastReminderSentAt.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastReminder >= minimumGapHours;
}
