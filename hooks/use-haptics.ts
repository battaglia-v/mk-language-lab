'use client';

import { useCallback } from 'react';
import { triggerHaptic, type HapticPattern } from '@/lib/haptics';

/**
 * useHaptics - Hook for haptic feedback in components
 *
 * Wraps the haptics utility for convenient use in React components.
 * Respects user's reduced motion preferences automatically.
 *
 * @example
 * const { haptic } = useHaptics();
 *
 * const handleCorrect = () => {
 *   haptic('success');
 *   showCelebration();
 * };
 *
 * const handleIncorrect = () => {
 *   haptic('warning');
 *   showExplanation();
 * };
 */
export function useHaptics() {
  const haptic = useCallback((pattern: HapticPattern = 'light') => {
    return triggerHaptic(pattern);
  }, []);

  return {
    /** Trigger haptic feedback with specified pattern */
    haptic,
    /** Convenience: light tap feedback */
    tap: useCallback(() => triggerHaptic('light'), []),
    /** Convenience: selection change feedback */
    select: useCallback(() => triggerHaptic('selection'), []),
    /** Convenience: success feedback (correct answer) */
    success: useCallback(() => triggerHaptic('success'), []),
    /** Convenience: warning feedback (incorrect answer) */
    warning: useCallback(() => triggerHaptic('warning'), []),
    /** Convenience: error feedback (validation error) */
    error: useCallback(() => triggerHaptic('error'), []),
  };
}

export default useHaptics;
