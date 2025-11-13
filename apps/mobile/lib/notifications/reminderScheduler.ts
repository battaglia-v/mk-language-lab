import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import type { MissionStatus } from '@mk/api-client';
import {
  REMINDER_CHANNEL_ID,
  REMINDER_DEEPLINK,
  REMINDER_STORAGE_KEY,
  REMINDER_TASK_NAME,
  REMINDER_WINDOWS,
  type ReminderWindowId,
} from './constants';

export type MissionReminderSnapshot = {
  missionId: string;
  fireAt: string;
};

export type ReminderSettingsStorage = {
  enabledWindows: ReminderWindowId[];
  lastMissionReminder?: MissionReminderSnapshot;
  lastSyncedAt?: string;
};

const DEFAULT_SETTINGS: ReminderSettingsStorage = {
  enabledWindows: ['evening'],
};

const isNativeRuntime = Platform.OS !== 'web';

if (isNativeRuntime) {
  TaskManager.defineTask(REMINDER_TASK_NAME, async () => {
    try {
      const settings = await loadReminderSettings();
      await syncReminderSchedule(settings.enabledWindows);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.warn('Mission reminder background task failed', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export async function loadReminderSettings(): Promise<ReminderSettingsStorage> {
  if (!isNativeRuntime) {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored) as ReminderSettingsStorage;
    return {
      enabledWindows: parsed.enabledWindows ?? DEFAULT_SETTINGS.enabledWindows,
      lastMissionReminder: parsed.lastMissionReminder,
      lastSyncedAt: parsed.lastSyncedAt,
    };
  } catch (error) {
    console.warn('Failed to read reminder settings', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveReminderSettings(settings: ReminderSettingsStorage): Promise<void> {
  if (!isNativeRuntime) {
    return;
  }

  try {
    await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to persist reminder settings', error);
  }
}

export async function syncReminderSchedule(enabledWindows: ReminderWindowId[]): Promise<void> {
  if (!isNativeRuntime) {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const groupedByWindow = new Map<ReminderWindowId, Notifications.NotificationRequest[]>();

  for (const request of scheduled) {
    const windowId = request.content.data?.windowId as ReminderWindowId | undefined;
    if (windowId) {
      const existing = groupedByWindow.get(windowId) ?? [];
      groupedByWindow.set(windowId, [...existing, request]);
    }
  }

  await Promise.all(
    REMINDER_WINDOWS.map(async (window) => {
      const currentlyScheduled = groupedByWindow.get(window.id) ?? [];
      const shouldBeScheduled = enabledWindows.includes(window.id);

      if (shouldBeScheduled && currentlyScheduled.length === 0) {
        const trigger: Notifications.DailyTriggerInput = {
          hour: window.hour,
          minute: window.minute,
          repeats: true,
        };

        if (Platform.OS === 'android') {
          trigger.channelId = REMINDER_CHANNEL_ID;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Time for Macedonian practice',
            body: buildReminderCopy(window.id),
            sound: 'default',
            data: {
              type: 'daily-reminder',
              windowId: window.id,
              deeplink: REMINDER_DEEPLINK,
            },
          },
          trigger,
        });
      } else if (!shouldBeScheduled && currentlyScheduled.length > 0) {
        await Promise.all(
          currentlyScheduled.map((request) =>
            Notifications.cancelScheduledNotificationAsync(request.identifier)
          )
        );
      }
    })
  );
}

export async function ensureReminderBackgroundTask(): Promise<void> {
  if (!isNativeRuntime) {
    return;
  }

  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      console.info('Background fetch not available; reminder sync will run on launch only.');
      return;
    }

    const registeredTasks = await TaskManager.getRegisteredTasksAsync();
    const alreadyRegistered = registeredTasks.some((task) => task.taskName === REMINDER_TASK_NAME);
    if (!alreadyRegistered) {
      await BackgroundFetch.registerTaskAsync(REMINDER_TASK_NAME, {
        minimumInterval: 60 * 60, // hourly
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (error) {
    console.warn('Failed to register reminder background task', error);
  }
}

export async function scheduleMissionDeadlineReminder(
  mission: MissionStatus,
  previous?: MissionReminderSnapshot
): Promise<MissionReminderSnapshot | undefined> {
  if (!isNativeRuntime || !mission.cycle?.endsAt) {
    return previous;
  }

  if (previous?.missionId === mission.missionId) {
    return previous;
  }

  const missionEnd = new Date(mission.cycle.endsAt).getTime();
  // Nudge users 60 minutes before the mission resets.
  const fireAt = missionEnd - 60 * 60 * 1000;
  if (fireAt <= Date.now()) {
    return previous;
  }

  await clearMissionDeadlineReminders();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Protect your streak 🔥',
      body: buildDeadlineCopy(mission),
      sound: 'default',
      data: {
        type: 'mission-deadline',
        missionId: mission.missionId,
        deeplink: REMINDER_DEEPLINK,
      },
    },
    trigger: new Date(fireAt),
  });

  return {
    missionId: mission.missionId,
    fireAt: new Date(fireAt).toISOString(),
  };
}

async function clearMissionDeadlineReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const missionReminders = scheduled.filter(
    (request) => request.content.data?.type === 'mission-deadline'
  );

  await Promise.all(
    missionReminders.map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier))
  );
}

function buildReminderCopy(windowId: ReminderWindowId): string {
  switch (windowId) {
    case 'morning':
      return 'Morning boost! Lock in XP before the day takes over.';
    case 'lunch':
      return 'Lunch break reminder: take five and keep the streak alive.';
    case 'evening':
    default:
      return 'Evening rescue! Earn a few XP before the streak resets.';
  }
}

function buildDeadlineCopy(mission: MissionStatus): string {
  const xpRemaining = Math.max(mission.xp.target - mission.xp.earned, 0);

  if (xpRemaining <= 0) {
    return 'Finish any checklist item to lock in this streak.';
  }

  return `You still need ${xpRemaining} XP to protect the streak. Jump back in before midnight!`;
}

export { DEFAULT_SETTINGS as DEFAULT_REMINDER_SETTINGS };
