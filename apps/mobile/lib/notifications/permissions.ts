import * as Notifications from 'expo-notifications';

export async function getNotificationPermissionsStatus(): Promise<Notifications.NotificationPermissionsStatus> {
  try {
    return await Notifications.getPermissionsAsync();
  } catch (error) {
    console.warn('Failed to read notification permissions', error);
    return {
      status: Notifications.PermissionStatus.UNDETERMINED,
      granted: false,
      expires: 'never',
      canAskAgain: true,
    };
  }
}

export async function requestNotificationPermission(): Promise<Notifications.NotificationPermissionsStatus> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) {
      return existing;
    }

    return await Notifications.requestPermissionsAsync({
      ios: {
        allowProvisional: true,
        allowCriticalAlerts: false,
      },
    });
  } catch (error) {
    console.warn('Failed to request notification permissions', error);
    return {
      status: Notifications.PermissionStatus.DENIED,
      granted: false,
      expires: 'never',
      canAskAgain: false,
    };
  }
}
