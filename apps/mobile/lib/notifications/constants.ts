export const REMINDER_WINDOWS = [
  {
    id: 'midday',
    label: 'Midday focus',
    description: '11:00 reminder to keep the XP streak alive before lunch rush.',
    hour: 11,
    minute: 0,
  },
  {
    id: 'evening',
    label: 'Evening rescue',
    description: '20:00 nudge before the streak resets at midnight.',
    hour: 20,
    minute: 0,
  },
] as const;

export type ReminderWindow = (typeof REMINDER_WINDOWS)[number];
export type ReminderWindowId = ReminderWindow['id'];

export type ReminderPreference = ReminderWindow & {
  enabled: boolean;
};

export const REMINDER_STORAGE_KEY = 'mk.notifications.settings';
export const REMINDER_CHANNEL_ID = 'mission-reminders';
export const REMINDER_TASK_NAME = 'mission-reminder-sync';
