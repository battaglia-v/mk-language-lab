/**
 * useReducedMotion - Hook for checking reduced motion preference
 * 
 * Returns whether the user prefers reduced motion
 * Uses AccessibilityInfo on React Native
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see hooks/use-reduced-motion.ts (PWA implementation)
 */

import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial value
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setPrefersReducedMotion(enabled);
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setPrefersReducedMotion(enabled);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
