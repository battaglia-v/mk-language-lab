import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import type { ReminderWindowId } from './constants';

type RegisterPushTokenOptions = {
  reminderWindows: ReminderWindowId[];
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  '';

function resolveProjectId(): string | undefined {
  return (
    Constants.easConfig?.projectId ??
    // @ts-expect-error – `extra.eas` only exists at runtime after Expo config loads.
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.expoConfig?.projectId
  );
}

export async function registerPushTokenWithBackend({
  reminderWindows,
}: RegisterPushTokenOptions): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  if (!Device.isDevice) {
    console.info('Skipping push token registration on simulators/emulators.');
    return null;
  }

  const projectId = resolveProjectId();
  if (!projectId) {
    console.warn('Missing EAS project ID; cannot fetch Expo push token.');
    return null;
  }

  let expoPushToken: string | null = null;
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    expoPushToken = data;
  } catch (error) {
    console.warn('Failed to fetch Expo push token', error);
    return null;
  }

  if (!API_BASE_URL) {
    console.info('No API base URL configured; storing push token is skipped.');
    return expoPushToken;
  }

  try {
    await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/mobile/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expoPushToken,
        platform: Platform.OS,
        reminderWindows,
        appVersion: Constants.expoConfig?.version ?? 'dev',
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
      }),
    });
  } catch (error) {
    console.warn('Failed to register push token with backend', error);
  }

  return expoPushToken;
}
