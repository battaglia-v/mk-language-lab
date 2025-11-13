import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { MissionStatus } from '@mk/api-client';
import {
  REMINDER_CHANNEL_ID,
  REMINDER_WINDOWS,
  type ReminderPreference,
  type ReminderWindowId,
} from './constants';
import { getNotificationPermissionsStatus, requestNotificationPermission } from './permissions';
import { registerPushTokenWithBackend } from './registerPushToken';
import {
  DEFAULT_REMINDER_SETTINGS,
  ensureReminderBackgroundTask,
  loadReminderSettings,
  saveReminderSettings,
  scheduleMissionDeadlineReminder,
  syncReminderSchedule,
  type ReminderSettingsStorage,
} from './reminderScheduler';

type NotificationContextValue = {
  permissions: Notifications.NotificationPermissionsStatus | null;
  reminderPreferences: ReminderPreference[];
  isHydrated: boolean;
  requestPermission: () => Promise<Notifications.NotificationPermissionsStatus>;
  toggleReminderWindow: (windowId: ReminderWindowId, enabled: boolean) => Promise<void>;
  scheduleMissionReminder: (mission: MissionStatus) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const isNativeRuntime = Platform.OS !== 'web';

if (isNativeRuntime) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Mission reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  } catch (error) {
    console.warn('Failed to configure Android notification channel', error);
  }
}

type NotificationProviderProps = {
  children: ReactNode;
};

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [permissions, setPermissions] = useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [settings, setSettings] = useState<ReminderSettingsStorage>(DEFAULT_REMINDER_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(!isNativeRuntime);
  const settingsRef = useRef<ReminderSettingsStorage>(DEFAULT_REMINDER_SETTINGS);
  const lastRegisteredSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!isNativeRuntime) {
      return;
    }

    let isMounted = true;

    (async () => {
      const [storedSettings, status] = await Promise.all([
        loadReminderSettings(),
        getNotificationPermissionsStatus(),
      ]);

      if (!isMounted) {
        return;
      }

      setSettings(storedSettings);
      settingsRef.current = storedSettings;
      setPermissions(status);
      setIsHydrated(true);

      await ensureAndroidChannel();
      await syncReminderSchedule(storedSettings.enabledWindows);
      await ensureReminderBackgroundTask();
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isNativeRuntime || !isHydrated || permissions?.status !== Notifications.PermissionStatus.GRANTED) {
      return;
    }

    const signature = settings.enabledWindows.slice().sort().join(',');
    if (signature === lastRegisteredSignatureRef.current) {
      return;
    }

    lastRegisteredSignatureRef.current = signature;
    void registerPushTokenWithBackend({ reminderWindows: settings.enabledWindows });
  }, [isHydrated, permissions?.status, settings.enabledWindows]);

  const reminderPreferences = useMemo<ReminderPreference[]>(
    () =>
      REMINDER_WINDOWS.map((window) => ({
        ...window,
        enabled: settings.enabledWindows.includes(window.id),
      })),
    [settings.enabledWindows]
  );

  const handleRequestPermission = useCallback(async () => {
    const status = await requestNotificationPermission();
    setPermissions(status);
    if (status.status === Notifications.PermissionStatus.GRANTED) {
      await ensureReminderBackgroundTask();
      await syncReminderSchedule(settingsRef.current.enabledWindows);
    }

    return status;
  }, []);

  const toggleReminderWindow = useCallback(
    async (windowId: ReminderWindowId, enabled: boolean) => {
      if (!isNativeRuntime) {
        return;
      }

      const current = settingsRef.current;
      const nextEnabled = enabled
        ? Array.from(new Set([...current.enabledWindows, windowId]))
        : current.enabledWindows.filter((id) => id !== windowId);

      const nextSettings = { ...current, enabledWindows: nextEnabled };

      settingsRef.current = nextSettings;
      setSettings(nextSettings);
      await saveReminderSettings(nextSettings);
      await syncReminderSchedule(nextEnabled);
    },
    []
  );

  const scheduleMissionReminder = useCallback(
    async (mission: MissionStatus) => {
      if (!isNativeRuntime || permissions?.status !== Notifications.PermissionStatus.GRANTED) {
        return;
      }

      const snapshot = await scheduleMissionDeadlineReminder(
        mission,
        settingsRef.current.lastMissionReminder
      );

      if (snapshot) {
        const nextSettings: ReminderSettingsStorage = {
          ...settingsRef.current,
          lastMissionReminder: snapshot,
        };
        settingsRef.current = nextSettings;
        setSettings(nextSettings);
        await saveReminderSettings(nextSettings);
      }
    },
    [permissions?.status]
  );

  const value: NotificationContextValue = {
    permissions,
    reminderPreferences,
    isHydrated,
    requestPermission: handleRequestPermission,
    toggleReminderWindow,
    scheduleMissionReminder,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  return context;
}
