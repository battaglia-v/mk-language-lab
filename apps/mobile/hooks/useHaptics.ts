/**
 * useHaptics - Hook for haptic feedback in components
 * 
 * Wraps the haptics utility for convenient use in React components.
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see hooks/use-haptics.ts (PWA implementation)
 */

import { useCallback } from 'react';
import { triggerHaptic, type HapticPattern } from '../lib/haptics';

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
