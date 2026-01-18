/**
 * Offline Status Toast Component
 * 
 * Shows toast notifications when network connectivity changes
 * Mirrors PWA's OfflineStatusToast behavior
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/providers/OfflineStatusToast.tsx (PWA implementation)
 */

import { useEffect, useRef } from 'react';
import { useNetworkState } from '../lib/offline';
import { useToast } from '../lib/toast';

export function OfflineStatusToast() {
  const { addToast } = useToast();
  const { isOnline } = useNetworkState();
  const hasShownOffline = useRef(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip first render to avoid false positive
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Initialize state based on current connectivity
      hasShownOffline.current = !isOnline;
      return;
    }

    if (isOnline === false && !hasShownOffline.current) {
      hasShownOffline.current = true;
      addToast({
        type: 'warning',
        title: 'No Connection',
        description: "You're offline. Some features may be unavailable.",
        duration: 6000,
      });
    } else if (isOnline === true && hasShownOffline.current) {
      hasShownOffline.current = false;
      addToast({
        type: 'success',
        title: 'Back online',
        description: 'Connection restored.',
        duration: 4000,
      });
    }
  }, [isOnline, addToast]);

  return null;
}
