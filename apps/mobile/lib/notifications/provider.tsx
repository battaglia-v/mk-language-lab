import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { brandColors } from '@mk/tokens';
import {
  REMINDER_CHANNEL_ID,
  REMINDER_DEEPLINK,
  REMINDER_IDENTIFIER_KEY,
  REMINDER_STORAGE_KEY,
  REMINDER_WINDOWS,
  type ReminderWindowConfig,
  type ReminderWindowId,
} from './constants';
import { getNotificationPermissionStatus, requestNotificationPermission } from './permissions';
import { registerPushTokenWithBackend } from './registerPushToken';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type ReminderWindowState = ReminderWindowConfig & {
  isEnabled: boolean;
  isPending: boolean;
};

type NotificationContextValue = {
  isHydrated: boolean;
  permissionStatus: Notifications.NotificationPermissionsStatus | null;
  reminderWindows: ReminderWindowState[];
  toggleReminderWindow: (id: ReminderWindowId, isEnabled: boolean) => Promise<void>;
  requestPermission: () => Promise<Notifications.NotificationPermissionsStatus>;
  registeringPushToken: boolean;
  lastRegisteredToken: string | null;
};

const NotificationSettingsContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: PropsWithChildren) {
  const [permissionStatus, setPermissionStatus] = useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [enabledWindowIds, setEnabledWindowIds] = useState<Set<ReminderWindowId>>(new Set());
  const [scheduledIdentifiers, setScheduledIdentifiers] = useState<Record<ReminderWindowId, string>>({});
  const [pendingWindowId, setPendingWindowId] = useState<ReminderWindowId | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [registeringPushToken, setRegisteringPushToken] = useState(false);
  const [lastRegisteredToken, setLastRegisteredToken] = useState<string | null>(null);

  useEffect(() => {
    async function hydrate() {
      try {
        const [[, storedWindows], [, storedIdentifiers]] = await AsyncStorage.multiGet([
          REMINDER_STORAGE_KEY,
          REMINDER_IDENTIFIER_KEY,
        ]);
        if (storedWindows) {
          const parsed = JSON.parse(storedWindows) as ReminderWindowId[];
          setEnabledWindowIds(new Set(parsed));
        }
        if (storedIdentifiers) {
          const parsed = JSON.parse(storedIdentifiers) as Record<ReminderWindowId, string>;
          setScheduledIdentifiers(parsed);
        }
      } catch (error) {
        console.warn('[notifications] Failed to hydrate reminder state', error);
      } finally {
        setIsHydrated(true);
      }
    }
    async function loadPermissions() {
      try {
        const status = await getNotificationPermissionStatus();
        setPermissionStatus(status);
      } catch (error) {
        console.warn('[notifications] Failed to read notification permissions', error);
      }
    }
    hydrate();
    loadPermissions();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Mission reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: brandColors.red,
      enableVibrate: true,
      showBadge: false,
    }).catch((error) => {
      console.warn('[notifications] Failed to configure Android channel', error);
    });
  }, []);

  const persistState = useCallback(
    async (windowIds: ReminderWindowId[], identifierMap: Record<ReminderWindowId, string>) => {
      setEnabledWindowIds(new Set(windowIds));
      setScheduledIdentifiers(identifierMap);
      await AsyncStorage.multiSet([
        [REMINDER_STORAGE_KEY, JSON.stringify(windowIds)],
        [REMINDER_IDENTIFIER_KEY, JSON.stringify(identifierMap)],
      ]);
    },
    []
  );

  const requestPermission = useCallback(async () => {
    const status = await requestNotificationPermission();
    setPermissionStatus(status);
    return status;
  }, []);

  const ensurePermission = useCallback(async () => {
    const status = await requestPermission();
    return status.granted ?? false;
  }, [requestPermission]);

  const reminderWindows = useMemo<ReminderWindowState[]>(
    () =>
      REMINDER_WINDOWS.map((window) => ({
        ...window,
        isEnabled: enabledWindowIds.has(window.id),
        isPending: pendingWindowId === window.id,
      })),
    [enabledWindowIds, pendingWindowId]
  );

  const registerPushToken = useCallback(
    async (windowIds: ReminderWindowId[]) => {
      setRegisteringPushToken(true);
      try {
        const token = await registerPushTokenWithBackend({ reminderWindows: windowIds });
        if (token) {
          setLastRegisteredToken(token);
        }
      } finally {
        setRegisteringPushToken(false);
      }
    },
    []
  );

  const toggleReminderWindow = useCallback(
    async (windowId: ReminderWindowId, nextValue: boolean) => {
      const config = REMINDER_WINDOWS.find((window) => window.id === windowId);
      if (!config) {
        return;
      }
      setPendingWindowId(windowId);
      try {
        if (nextValue) {
          const granted = permissionStatus?.granted ?? (await ensurePermission());
          if (!granted) {
            return;
          }
          const identifier = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Mission reminder',
              body: config.message,
              data: { type: 'mission-reminder', deeplink: REMINDER_DEEPLINK, reminderId: windowId },
            },
            trigger: {
              channelId: REMINDER_CHANNEL_ID,
              hour: config.hour,
              minute: config.minute,
              repeats: true,
            },
          });
          const nextIds = Array.from(new Set([...enabledWindowIds, windowId]));
          const identifierMap = { ...scheduledIdentifiers, [windowId]: identifier };
          await persistState(nextIds, identifierMap);
          await registerPushToken(nextIds);
        } else {
          const identifier = scheduledIdentifiers[windowId];
          if (identifier) {
            await Notifications.cancelScheduledNotificationAsync(identifier);
          }
          const nextIds = Array.from(enabledWindowIds).filter((id) => id !== windowId) as ReminderWindowId[];
          const identifierMap = { ...scheduledIdentifiers };
          delete identifierMap[windowId];
          await persistState(nextIds, identifierMap);
          await registerPushToken(nextIds);
        }
      } catch (error) {
        console.warn('[notifications] Failed to toggle reminder window', error);
      } finally {
        setPendingWindowId(null);
      }
    },
    [
      ensurePermission,
      enabledWindowIds,
      permissionStatus?.granted,
      persistState,
      registerPushToken,
      scheduledIdentifiers,
    ]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      isHydrated,
      permissionStatus,
      reminderWindows,
      toggleReminderWindow,
      requestPermission,
      registeringPushToken,
      lastRegisteredToken,
    }),
    [
      isHydrated,
      lastRegisteredToken,
      permissionStatus,
      registeringPushToken,
      reminderWindows,
      requestPermission,
      toggleReminderWindow,
    ]
  );

  return <NotificationSettingsContext.Provider value={value}>{children}</NotificationSettingsContext.Provider>;
}

export function useNotificationSettings() {
  const context = useContext(NotificationSettingsContext);
  if (!context) {
    throw new Error('useNotificationSettings must be used within a NotificationProvider');
  }
  return context;
}
