/**
 * First Session Hook
 * 
 * Tracks whether the user is in their first few sessions
 * to show onboarding hints and tooltips that fade after 2-3 sessions.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mk-session-count';
const MAX_HINT_SESSIONS = 3;

interface FirstSessionState {
  /** Current session count (1-indexed) */
  sessionCount: number;
  /** Whether we should show first-session hints */
  showHints: boolean;
  /** Whether hints have been dismissed by user */
  hintsDismissed: boolean;
  /** Dismiss hints permanently */
  dismissHints: () => void;
  /** Mark a hint as seen (to track progress) */
  markHintSeen: (hintId: string) => void;
  /** Check if a specific hint has been seen */
  isHintSeen: (hintId: string) => boolean;
}

/**
 * Hook to manage first-session onboarding state
 */
export function useFirstSession(): FirstSessionState {
  const [sessionCount, setSessionCount] = useState(1);
  const [hintsDismissed, setHintsDismissed] = useState(false);
  const [seenHints, setSeenHints] = useState<Set<string>>(new Set());

  // Initialize session count on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let count = 1;
      
      if (stored) {
        const data = JSON.parse(stored);
        count = (data.count || 0) + 1;
        setHintsDismissed(data.dismissed || false);
        setSeenHints(new Set(data.seenHints || []));
      }

      setSessionCount(count);

      // Save updated session count
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        count,
        dismissed: hintsDismissed,
        seenHints: Array.from(seenHints),
        lastSession: new Date().toISOString(),
      }));
    } catch {
      // localStorage not available, default to showing hints
      setSessionCount(1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissHints = useCallback(() => {
    setHintsDismissed(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data,
        dismissed: true,
      }));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const markHintSeen = useCallback((hintId: string) => {
    setSeenHints(prev => {
      const next = new Set(prev);
      next.add(hintId);
      
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...data,
          seenHints: Array.from(next),
        }));
      } catch {
        // Ignore storage errors
      }
      
      return next;
    });
  }, []);

  const isHintSeen = useCallback((hintId: string) => {
    return seenHints.has(hintId);
  }, [seenHints]);

  const showHints = !hintsDismissed && sessionCount <= MAX_HINT_SESSIONS;

  return {
    sessionCount,
    showHints,
    hintsDismissed,
    dismissHints,
    markHintSeen,
    isHintSeen,
  };
}

