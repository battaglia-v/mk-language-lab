/**
 * PWA Haptic Feedback Utility
 *
 * Provides haptic feedback for web apps using the Vibration API.
 * Falls back gracefully on devices/browsers that don't support vibration.
 *
 * Note: Vibration API is supported on:
 * - Android Chrome/Firefox/Edge
 * - NOT supported on iOS Safari (as of 2024)
 */

export type HapticPattern =
  | 'light' // Quick, subtle feedback (button taps)
  | 'medium' // Standard feedback (selections)
  | 'heavy' // Strong feedback (important actions)
  | 'success' // Positive feedback (correct answer, achievement)
  | 'warning' // Alert feedback (wrong answer)
  | 'error' // Error feedback (validation error)
  | 'selection'; // Selection change

// Vibration patterns in milliseconds
// Format: [vibrate, pause, vibrate, pause, ...]
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10, // Quick pulse
  medium: 25, // Standard pulse
  heavy: 50, // Strong pulse
  success: [10, 50, 20], // Two quick pulses
  warning: [30, 50, 30], // Two medium pulses
  error: [50, 30, 50, 30, 50], // Three strong pulses
  selection: 15, // Quick selection feedback
};

/**
 * Check if the Vibration API is available
 */
export function isHapticsAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Check if reduced motion is preferred (respects accessibility settings)
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Trigger haptic feedback with a specific pattern
 *
 * @param pattern - The type of haptic feedback to trigger
 * @returns boolean - true if vibration was triggered, false otherwise
 *
 * @example
 * ```tsx
 * // On button click
 * const handleClick = () => {
 *   triggerHaptic('light');
 *   performAction();
 * };
 *
 * // On correct answer
 * if (isCorrect) {
 *   triggerHaptic('success');
 * }
 *
 * // On error
 * triggerHaptic('error');
 * ```
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): boolean {
  // Skip if reduced motion is preferred
  if (prefersReducedMotion()) return false;

  // Skip if Vibration API not available
  if (!isHapticsAvailable()) return false;

  try {
    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    return navigator.vibrate(vibrationPattern);
  } catch {
    // Silently fail if vibration is blocked or unavailable
    return false;
  }
}

/**
 * Stop any ongoing vibration
 */
export function stopHaptic(): boolean {
  if (!isHapticsAvailable()) return false;

  try {
    return navigator.vibrate(0);
  } catch {
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
  stop: stopHaptic,
};

export default haptic;
