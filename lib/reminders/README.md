# Reminder Intelligence System

This directory contains the reminder logic for gamification features like streak warnings, quest notifications, and daily nudges.

## Architecture

The reminder system is built on top of the existing mobile push notification infrastructure at `app/api/cron/reminders/route.ts`.

### Components

1. **reminder-logic.ts** - Pure functions for determining when and what reminders to send
2. **settings API** (`app/api/reminders/settings/route.ts`) - User preferences for quiet hours
3. **Existing cron job** (`app/api/cron/reminders/route.ts`) - Handles push notification delivery

## How It Works

### 1. Reminder Logic Functions

```typescript
import {
  shouldSendStreakReminder,
  isQuietHours,
  generateStreakReminderNotification,
} from '@/lib/reminders/reminder-logic';

// Check if user needs a streak reminder
const shouldSend = shouldSendStreakReminder({
  userId: user.id,
  streakDays: user.gameProgress.streak,
  lastPracticeDate: user.gameProgress.lastPracticeDate,
  dailyXP: 100,
  dailyXPTarget: 240,
  timezone: 'America/New_York',
});

// Generate notification content
if (shouldSend) {
  const notification = generateStreakReminderNotification(context);
  // { type, title, body, actionUrl }
}
```

### 2. Quiet Hours

Users can configure quiet hours to prevent reminders during sleep or work:

```typescript
const quietHours = { enabled: true, startHour: 22, endHour: 8 };
const inQuietTime = isQuietHours(quietHours, 'America/New_York');
```

### 3. Integration with Existing Cron

The existing cron job at `app/api/cron/reminders/route.ts` already handles:
- Expo push notification sending
- Token revocation on errors
- Rate limiting (4-hour minimum gap)
- Reminder window scheduling

To add gamification reminders, extend that cron job to:

1. Query users with active streaks
2. Call `shouldSendStreakReminder()` for each user
3. Create in-app notifications via `prisma.notification.create()`
4. Optionally send push notifications via existing Expo integration

## API Endpoints

### GET /api/reminders/settings
Fetch user's reminder preferences (quiet hours, nudge preferences)

### POST /api/reminders/settings
Update reminder settings

```json
{
  "quietHoursEnabled": true,
  "quietHoursStart": 22,
  "quietHoursEnd": 8,
  "streakRemindersEnabled": true,
  "dailyNudgesEnabled": true
}
```

## Notification Types

| Type | Trigger | Example |
|------|---------|---------|
| `streak_at_risk` | <4 hours left, no practice today, streak ≥3 days | "🔥 7-day streak at risk!" |
| `quest_expiring` | Quest ends in <24 hours | "🎯 Complete your weekly quest" |
| `daily_nudge` | Optimal practice time (ML-based) | "⚡ Quick practice reminder" |
| `achievement_earned` | Badge unlocked, level up | "🏆 You earned Streak Guardian!" |

## Future Enhancements

1. **ML-based optimal timing** - Use `calculateOptimalReminderHour()` to learn best practice times
2. **Push notification integration** - Send both in-app AND push notifications
3. **Quest expiry warnings** - Extend to quest deadlines
4. **Persistent settings** - Store in dedicated `ReminderSettings` table vs Mission metadata

## Environment Variables

```bash
CRON_SECRET=your-secret-token  # Already exists for mobile push cron
```

## Deployment

The cron job runs via Vercel Cron (configured in `vercel.json`):

```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 * * * *"  // Every hour
  }]
}
```
