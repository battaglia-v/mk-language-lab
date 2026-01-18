/**
 * Haptic Feedback Utility for React Native
 * 
 * Provides native haptic feedback using expo-haptics
 * Falls back gracefully on unsupported devices
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see lib/haptics.ts (PWA implementation using Vibration API)
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticPattern =
  | 'light'      // Quick, subtle feedback (button taps)
  | 'medium'     // Standard feedback (selections)
  | 'heavy'      // Strong feedback (important actions)
  | 'success'    // Positive feedback (correct answer, achievement)
  | 'warning'    // Alert feedback (wrong answer)
  | 'error'      // Error feedback (validation error)
  | 'selection'; // Selection change

/**
 * Check if haptics are available on this device
 */
export function isHapticsAvailable(): boolean {
  // Expo Haptics is available on iOS and Android
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Check if user prefers reduced motion
 * Note: React Native doesn't have direct access to system accessibility settings
 * This would need to be tracked via app settings
 */
let prefersReducedMotion = false;

export function setReducedMotion(value: boolean): void {
  prefersReducedMotion = value;
}

export function getReducedMotion(): boolean {
  return prefersReducedMotion;
}

/**
 * Trigger haptic feedback with a specific pattern
 */
export async function triggerHaptic(pattern: HapticPattern = 'light'): Promise<boolean> {
  // Skip if reduced motion is preferred
  if (prefersReducedMotion) return false;

  // Skip if haptics not available
  if (!isHapticsAvailable()) return false;

  try {
    switch (pattern) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      
      case 'success':
        // Success: notification success
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      
      case 'warning':
        // Warning: notification warning
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      
      case 'error':
        // Error: notification error
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      
      case 'selection':
        // Selection change
        await Haptics.selectionAsync();
        break;
      
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    return true;
  } catch (error) {
    // Silently fail if haptics unavailable
    console.warn('[Haptics] Failed to trigger:', error);
    return false;
  }
}

// Convenience functions for common haptic patterns
export const haptic = {
  light: () => triggerHaptic('light'),
  medium: () => triggerHaptic('medium'),
  heavy: () => triggerHaptic('heavy'),
  success: () => triggerHaptic('success'),
  warning: () => triggerHaptic('warning'),
  error: () => triggerHaptic('error'),
  selection: () => triggerHaptic('selection'),
};

export default haptic;
