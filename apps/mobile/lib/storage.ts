import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export interface StoredUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export async function getUser(): Promise<StoredUser | null> {
  try {
    const data = await SecureStore.getItemAsync(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setUser(user: StoredUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function clearAll(): Promise<void> {
  await Promise.all([clearToken(), clearUser()]);
}

/**
 * Clear all AsyncStorage data except auth tokens
 * Used for "Clear Cache" in settings
 */
export async function clearAllExceptAuth(): Promise<void> {
  // Import AsyncStorage dynamically to avoid circular deps
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;

  try {
    const keys = await AsyncStorage.getAllKeys();
    // Filter out auth-related keys (we use SecureStore for those, but be safe)
    const keysToRemove = keys.filter((key) => !key.includes('auth'));
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.error('[Storage] Failed to clear cache:', error);
    throw error;
  }
}
