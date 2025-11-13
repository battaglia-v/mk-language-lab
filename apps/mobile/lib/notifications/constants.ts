export type ReminderWindowId = 'midday' | 'evening';

export type ReminderWindow = {
  id: ReminderWindowId;
  label: string;
  description: string;
  hour: number;
  minute: number;
  message: string;
};

export const REMINDER_WINDOWS: ReminderWindow[] = [
  {
    id: 'midday',
    label: 'Midday focus',
    description: 'Friendly nudge around lunch to keep the streak alive.',
    hour: 11,
    minute: 0,
    message: "Let's protect that streak before lunch. Knock out a quick drill!",
  },
  {
    id: 'evening',
    label: 'Evening rescue',
    description: 'Reminder at 20:00 to close the mission before the day ends.',
    hour: 20,
    minute: 0,
    message: 'Still time to finish the mission tonight. Continue your lesson!',
  },
];

export const REMINDER_STORAGE_KEY = '@mk/notifications:reminder-windows';
export const REMINDER_IDENTIFIER_KEY = '@mk/notifications:scheduled';
export const REMINDER_CHANNEL_ID = 'mission-reminders';
export const REMINDER_TASK_NAME = 'mission-reminder-sync';
export const REMINDER_DEEPLINK = '/(tabs)/practice';
