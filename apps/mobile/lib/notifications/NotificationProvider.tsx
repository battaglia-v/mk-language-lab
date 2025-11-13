import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { MissionStatus } from '@mk/api-client';
import {
  REMINDER_CHANNEL_ID,
  REMINDER_WINDOWS,
  type ReminderPreference,
  type ReminderWindow,
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
  permissionStatus: Notifications.PermissionStatus | null;
  reminderPreferences: ReminderPreference[];
  reminderWindows: ReminderWindowId[];
  availableWindows: ReminderWindow[];
  isHydrated: boolean;
  isScheduling: boolean;
  isRegisteringToken: boolean;
  lastSyncedAt?: string;
  requestPermission: () => Promise<Notifications.NotificationPermissionsStatus>;
  toggleReminderWindow: (windowId: ReminderWindowId, enabled?: boolean) => Promise<void>;
  refreshScheduledReminders: () => Promise<void>;
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
  const [isScheduling, setIsScheduling] = useState(false);
  const [isRegisteringToken, setIsRegisteringToken] = useState(false);
  const settingsRef = useRef<ReminderSettingsStorage>(DEFAULT_REMINDER_SETTINGS);
  const lastRegisteredSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!isNativeRuntime) {
      return;
    }

    let cancelled = false;

    (async () => {
      const [storedSettings, status] = await Promise.all([
        loadReminderSettings(),
        getNotificationPermissionsStatus(),
      ]);

      if (cancelled) {
        return;
      }

      const nextSettings = { ...storedSettings };
      settingsRef.current = nextSettings;
      setSettings(nextSettings);
      setPermissions(status);
      setIsHydrated(true);

      await ensureAndroidChannel();
      await ensureReminderBackgroundTask();
      await syncReminderSchedule(nextSettings.enabledWindows);

      if (!cancelled) {
        const stamped = { ...nextSettings, lastSyncedAt: new Date().toISOString() };
        settingsRef.current = stamped;
        setSettings(stamped);
        await saveReminderSettings(stamped);
      }
    })();

    return () => {
      cancelled = true;
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

    let cancelled = false;
    setIsRegisteringToken(true);
    (async () => {
      try {
        await registerPushTokenWithBackend({ reminderWindows: settings.enabledWindows });
        if (!cancelled) {
          lastRegisteredSignatureRef.current = signature;
        }
      } finally {
        if (!cancelled) {
          setIsRegisteringToken(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, permissions?.status, settings.enabledWindows]);

  const reminderPreferences = useMemo<ReminderPreference[]>(
    () =>
      REMINDER_WINDOWS.map((window) => ({
        ...window,
        enabled: settings.enabledWindows.includes(window.id),
      })),
    [settings.enabledWindows]
  );

  const refreshScheduledReminders = useCallback(async () => {
    if (!isNativeRuntime) {
      return;
    }

    setIsScheduling(true);
    try {
      await syncReminderSchedule(settingsRef.current.enabledWindows);
      const stamped: ReminderSettingsStorage = {
        ...settingsRef.current,
        lastSyncedAt: new Date().toISOString(),
      };
      settingsRef.current = stamped;
      setSettings(stamped);
      await saveReminderSettings(stamped);
    } finally {
      setIsScheduling(false);
    }
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const status = await requestNotificationPermission();
    setPermissions(status);
    if (status.status === Notifications.PermissionStatus.GRANTED) {
      await ensureReminderBackgroundTask();
      await refreshScheduledReminders();
    }

    return status;
  }, [refreshScheduledReminders]);

  const toggleReminderWindow = useCallback(
    async (windowId: ReminderWindowId, explicitValue?: boolean) => {
      const current = settingsRef.current;
      const shouldEnable =
        explicitValue ?? !current.enabledWindows.includes(windowId);

      const nextEnabled = shouldEnable
        ? Array.from(new Set([...current.enabledWindows, windowId]))
        : current.enabledWindows.filter((id) => id !== windowId);

      if (!isNativeRuntime) {
        const nextSettings = { ...current, enabledWindows: nextEnabled };
        settingsRef.current = nextSettings;
        setSettings(nextSettings);
        return;
      }

      setIsScheduling(true);
      try {
        const nextSettings: ReminderSettingsStorage = {
          ...current,
          enabledWindows: nextEnabled,
        };
        settingsRef.current = nextSettings;
        setSettings(nextSettings);
        await saveReminderSettings(nextSettings);
        await syncReminderSchedule(nextEnabled);
        const stamped: ReminderSettingsStorage = {
          ...nextSettings,
          lastSyncedAt: new Date().toISOString(),
        };
        settingsRef.current = stamped;
        setSettings(stamped);
        await saveReminderSettings(stamped);
      } finally {
        setIsScheduling(false);
      }
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
    permissionStatus: permissions?.status ?? null,
    reminderPreferences,
    reminderWindows: settings.enabledWindows,
    availableWindows: REMINDER_WINDOWS,
    isHydrated,
    isScheduling,
    isRegisteringToken,
    lastSyncedAt: settings.lastSyncedAt,
    requestPermission: handleRequestPermission,
    toggleReminderWindow,
    refreshScheduledReminders,
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
