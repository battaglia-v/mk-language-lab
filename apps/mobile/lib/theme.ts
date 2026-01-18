/**
 * Theme management for React Native
 * 
 * Mirrors PWA's theme preference storage
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

const STORAGE_KEY = 'mk-theme';

export type ThemeMode = 'light' | 'dark' | 'system';

let currentTheme: ThemeMode = 'system';
let listeners: Array<(theme: ThemeMode, resolved: ColorSchemeName) => void> = [];

/**
 * Get the stored theme preference
 */
export async function getStoredTheme(): Promise<ThemeMode> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      currentTheme = stored;
      return stored;
    }
  } catch (error) {
    console.warn('[Theme] Failed to read stored theme:', error);
  }
  return 'system';
}

/**
 * Set the theme preference
 */
export async function setTheme(mode: ThemeMode): Promise<void> {
  try {
    currentTheme = mode;
    await AsyncStorage.setItem(STORAGE_KEY, mode);
    notifyListeners();
  } catch (error) {
    console.warn('[Theme] Failed to save theme:', error);
  }
}

/**
 * Get the current theme preference
 */
export function getTheme(): ThemeMode {
  return currentTheme;
}

/**
 * Resolve the actual color scheme based on preference
 */
export function resolveTheme(mode: ThemeMode = currentTheme): ColorSchemeName {
  if (mode === 'system') {
    return Appearance.getColorScheme() ?? 'dark';
  }
  return mode;
}

/**
 * Subscribe to theme changes
 */
export function subscribeToTheme(
  callback: (theme: ThemeMode, resolved: ColorSchemeName) => void
): () => void {
  listeners.push(callback);
  
  // Listen to system appearance changes
  const subscription = Appearance.addChangeListener(() => {
    if (currentTheme === 'system') {
      notifyListeners();
    }
  });

  return () => {
    listeners = listeners.filter((l) => l !== callback);
    subscription.remove();
  };
}

function notifyListeners(): void {
  const resolved = resolveTheme();
  listeners.forEach((listener) => listener(currentTheme, resolved));
}

/**
 * Initialize theme on app startup
 */
export async function initializeTheme(): Promise<ThemeMode> {
  const stored = await getStoredTheme();
  currentTheme = stored;
  return stored;
}
