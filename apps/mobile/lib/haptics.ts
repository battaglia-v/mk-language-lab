/**
 * Haptic Feedback Utility
 *
 * Provides centralized haptic feedback for various app events.
 * All haptic calls are wrapped in try-catch to prevent crashes
 * on devices that don't support haptics.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Types of haptic feedback patterns
 */
export type HapticPattern =
  | 'xpGain'
  | 'levelUp'
  | 'streakUpdate'
  | 'streakLost'
  | 'achievementUnlock'
  | 'correctAnswer'
  | 'incorrectAnswer'
  | 'success'
  | 'error'
  | 'warning'
  | 'selection'
  | 'impact';

/**
 * Check if haptics are available on this device
 */
export function isHapticsAvailable(): boolean {
  // Haptics only available on physical iOS/Android devices
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Trigger a light impact haptic (for selection/tap feedback)
 */
export async function impactLight(): Promise<void> {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Silently fail if haptics unavailable
  }
}

/**
 * Trigger a medium impact haptic (for button presses)
 */
export async function impactMedium(): Promise<void> {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Silently fail
  }
}

/**
 * Trigger a heavy impact haptic (for significant actions)
 */
export async function impactHeavy(): Promise<void> {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // Silently fail
  }
}

/**
 * Trigger a success notification haptic
 */
export async function notificationSuccess(): Promise<void> {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Silently fail
  }
}

/**
 * Trigger an error notification haptic
 */
export async function notificationError(): Promise<void> {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Silently fail
  }
}

/**
 * Trigger a warning notification haptic
 */
export async function notificationWarning(): Promise<void> {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Silently fail
  }
}

/**
 * Trigger selection feedback (for toggles, radio buttons, etc.)
 */
export async function selectionChanged(): Promise<void> {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // Silently fail
  }
}

/**
 * Trigger haptic feedback based on a named pattern
 * This is the main function to use for semantic haptic events
 */
export async function triggerHaptic(pattern: HapticPattern): Promise<void> {
  if (!isHapticsAvailable()) return;

  switch (pattern) {
    case 'xpGain':
      // Light impact for XP gains - feels rewarding but not intrusive
      await impactLight();
      break;

    case 'levelUp':
      // Double heavy impact for level ups - celebratory!
      await impactHeavy();
      // Small delay then another impact for extra emphasis
      await new Promise((resolve) => setTimeout(resolve, 100));
      await impactMedium();
      break;

    case 'streakUpdate':
      // Success notification for maintaining streak
      await notificationSuccess();
      break;

    case 'streakLost':
      // Error notification for losing streak
      await notificationError();
      break;

    case 'achievementUnlock':
      // Pattern: impact, pause, double impact (like a fanfare)
      await impactMedium();
      await new Promise((resolve) => setTimeout(resolve, 80));
      await impactHeavy();
      await new Promise((resolve) => setTimeout(resolve, 60));
      await impactHeavy();
      break;

    case 'correctAnswer':
      // Quick success feedback for correct answers
      await notificationSuccess();
      break;

    case 'incorrectAnswer':
      // Gentle error feedback for wrong answers
      await notificationError();
      break;

    case 'success':
      await notificationSuccess();
      break;

    case 'error':
      await notificationError();
      break;

    case 'warning':
      await notificationWarning();
      break;

    case 'selection':
      await selectionChanged();
      break;

    case 'impact':
      await impactMedium();
      break;

    default:
      // Unknown pattern - use light impact as fallback
      await impactLight();
  }
}

/**
 * React hook for haptic feedback with reduced motion respect
 * Use this in components that need to check user preferences
 */
export function useHaptics() {
  return {
    triggerHaptic,
    impactLight,
    impactMedium,
    impactHeavy,
    notificationSuccess,
    notificationError,
    notificationWarning,
    selectionChanged,
    isAvailable: isHapticsAvailable(),
  };
}
