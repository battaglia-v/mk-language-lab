/**
 * Push Notification Infrastructure for React Native
 * 
 * Uses expo-notifications for push notification support.
 * Requires Expo Dev Client (not Expo Go) for full functionality.
 * 
 * Features:
 * - Push token registration
 * - Local notification scheduling
 * - Notification handling (foreground/background)
 * - Daily reminder notifications
 * 
 * @see PARITY_CHECKLIST.md - Push notifications
 * @see https://docs.expo.dev/push-notifications/overview/
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Types
export interface PushToken {
  token: string;
  platform: 'ios' | 'android';
  registeredAt: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string; // HH:MM format
  streakReminder: boolean;
  achievementAlerts: boolean;
}

export interface ScheduledNotification {
  id: string;
  type: 'daily_reminder' | 'streak_reminder' | 'achievement';
  scheduledFor: string;
}

// Storage keys
const STORAGE_KEYS = {
  PUSH_TOKEN: 'mkll:push-token',
  NOTIFICATION_PREFS: 'mkll:notification-prefs',
  SCHEDULED_NOTIFICATIONS: 'mkll:scheduled-notifications',
} as const;

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  dailyReminder: true,
  dailyReminderTime: '09:00',
  streakReminder: true,
  achievementAlerts: true,
};

/**
 * Check if push notifications are available
 * Requires Expo Dev Client for full support
 */
export async function isPushNotificationsAvailable(): Promise<boolean> {
  try {
    // Check if we're in Expo Go (limited support) or Dev Client (full support)
    const isExpoGo = Constants.appOwnership === 'expo';
    
    if (isExpoGo) {
      console.log('[Notifications] Running in Expo Go - limited push notification support');
      return false;
    }

    // For Dev Client or standalone builds, notifications should work
    return true;
  } catch {
    return false;
  }
}

/**
 * Request notification permissions
 * Returns true if granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const Notifications = await import('expo-notifications').catch(() => null);
    
    if (!Notifications) {
      console.log('[Notifications] expo-notifications not available');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error);
    return false;
  }
}

/**
 * Get the Expo push token for this device
 * Requires notification permissions to be granted
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const Notifications = await import('expo-notifications').catch(() => null);
    
    if (!Notifications) {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('[Notifications] Permissions not granted');
      return null;
    }

    // Get project ID from app.config.ts
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.warn('[Notifications] No EAS project ID found - push tokens require EAS setup');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return tokenData.data;
  } catch (error) {
    console.error('[Notifications] Failed to get push token:', error);
    return null;
  }
}

/**
 * Register push token with the server
 */
export async function registerPushToken(apiBaseUrl: string): Promise<boolean> {
  try {
    const token = await getExpoPushToken();
    
    if (!token) {
      return false;
    }

    const pushToken: PushToken = {
      token,
      platform: Platform.OS as 'ios' | 'android',
      registeredAt: new Date().toISOString(),
    };

    // Save locally
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, JSON.stringify(pushToken));

    // Register with server
    const response = await fetch(`${apiBaseUrl}/api/mobile/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushToken),
    });

    if (!response.ok) {
      console.warn('[Notifications] Server registration failed:', response.status);
      return false;
    }

    console.log('[Notifications] Push token registered successfully');
    return true;
  } catch (error) {
    console.error('[Notifications] Registration failed:', error);
    return false;
  }
}

/**
 * Get stored push token
 */
export async function getStoredPushToken(): Promise<PushToken | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  updates: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  try {
    const current = await getNotificationPreferences();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(updated));
    
    // Reschedule notifications based on new preferences
    await scheduleNotificationsFromPreferences(updated);
    
    return updated;
  } catch (error) {
    console.error('[Notifications] Failed to update preferences:', error);
    throw error;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger: { seconds?: number; hour?: number; minute?: number; repeats?: boolean }
): Promise<string | null> {
  try {
    const Notifications = await import('expo-notifications').catch(() => null);
    
    if (!Notifications) {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger.seconds 
        ? { seconds: trigger.seconds }
        : { 
            hour: trigger.hour!, 
            minute: trigger.minute!, 
            repeats: trigger.repeats ?? false,
          },
    });

    return notificationId;
  } catch (error) {
    console.error('[Notifications] Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  try {
    const Notifications = await import('expo-notifications').catch(() => null);
    
    if (Notifications) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  } catch (error) {
    console.error('[Notifications] Failed to cancel notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    const Notifications = await import('expo-notifications').catch(() => null);
    
    if (Notifications) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    
    await AsyncStorage.removeItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS);
  } catch (error) {
    console.error('[Notifications] Failed to cancel all notifications:', error);
  }
}

/**
 * Schedule daily reminder notification
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<string | null> {
  const notificationId = await scheduleLocalNotification(
    '🇲🇰 Time to practice!',
    'Keep your streak alive. A few minutes of Macedonian practice today goes a long way!',
    { hour, minute, repeats: true }
  );
  
  if (notificationId) {
    const scheduled: ScheduledNotification = {
      id: notificationId,
      type: 'daily_reminder',
      scheduledFor: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    };
    
    const existing = await getScheduledNotifications();
    const filtered = existing.filter(n => n.type !== 'daily_reminder');
    await AsyncStorage.setItem(
      STORAGE_KEYS.SCHEDULED_NOTIFICATIONS,
      JSON.stringify([...filtered, scheduled])
    );
  }
  
  return notificationId;
}

/**
 * Schedule streak reminder notification
 * Fires in the evening if user hasn't practiced
 */
export async function scheduleStreakReminder(): Promise<string | null> {
  const notificationId = await scheduleLocalNotification(
    '🔥 Don\'t lose your streak!',
    'You haven\'t practiced today. Just 2 minutes keeps your streak alive!',
    { hour: 20, minute: 0, repeats: true }
  );
  
  if (notificationId) {
    const scheduled: ScheduledNotification = {
      id: notificationId,
      type: 'streak_reminder',
      scheduledFor: '20:00',
    };
    
    const existing = await getScheduledNotifications();
    const filtered = existing.filter(n => n.type !== 'streak_reminder');
    await AsyncStorage.setItem(
      STORAGE_KEYS.SCHEDULED_NOTIFICATIONS,
      JSON.stringify([...filtered, scheduled])
    );
  }
  
  return notificationId;
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Schedule notifications based on user preferences
 */
export async function scheduleNotificationsFromPreferences(
  prefs: NotificationPreferences
): Promise<void> {
  // Cancel existing notifications first
  await cancelAllScheduledNotifications();
  
  if (!prefs.enabled) {
    return;
  }
  
  // Daily reminder
  if (prefs.dailyReminder && prefs.dailyReminderTime) {
    const [hour, minute] = prefs.dailyReminderTime.split(':').map(Number);
    await scheduleDailyReminder(hour, minute);
  }
  
  // Streak reminder
  if (prefs.streakReminder) {
    await scheduleStreakReminder();
  }
}

/**
 * Send immediate local notification (for achievements, etc.)
 */
export async function sendImmediateNotification(
  title: string,
  body: string
): Promise<void> {
  await scheduleLocalNotification(title, body, { seconds: 1 });
}

/**
 * Show achievement unlock notification
 */
export async function showAchievementNotification(
  achievementTitle: string,
  xpReward: number
): Promise<void> {
  const prefs = await getNotificationPreferences();
  
  if (prefs.enabled && prefs.achievementAlerts) {
    await sendImmediateNotification(
      '🏆 Achievement Unlocked!',
      `${achievementTitle} (+${xpReward} XP)`
    );
  }
}

/**
 * Initialize notification handlers
 * Call this in the root layout
 */
export async function initializeNotifications(): Promise<void> {
  try {
    const Notifications = await import('expo-notifications').catch(() => null);
    
    if (!Notifications) {
      console.log('[Notifications] expo-notifications not available - skipping initialization');
      return;
    }

    // Set notification handler for when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#f6d83b',
      });
    }

    // Schedule notifications based on saved preferences
    const prefs = await getNotificationPreferences();
    await scheduleNotificationsFromPreferences(prefs);

    console.log('[Notifications] Initialized successfully');
  } catch (error) {
    console.error('[Notifications] Initialization failed:', error);
  }
}
