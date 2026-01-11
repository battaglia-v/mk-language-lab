'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/toast';

export function OfflineStatusToast() {
  const { addToast } = useToast();
  const hasShownOffline = useRef(false);

  useEffect(() => {
    const notifyOffline = () => {
      if (hasShownOffline.current) return;
      hasShownOffline.current = true;
      addToast({
        type: 'warning',
        title: 'No Connection',
        description: "You're offline. Some features may be unavailable.",
        duration: 6000,
      });
    };

    const notifyOnline = () => {
      if (!hasShownOffline.current) return;
      hasShownOffline.current = false;
      addToast({
        type: 'success',
        title: 'Back online',
        description: 'Connection restored.',
        duration: 4000,
      });
    };

    if (typeof window !== 'undefined' && !navigator.onLine) {
      notifyOffline();
    }

    window.addEventListener('offline', notifyOffline);
    window.addEventListener('online', notifyOnline);

    return () => {
      window.removeEventListener('offline', notifyOffline);
      window.removeEventListener('online', notifyOnline);
    };
  }, [addToast]);

  return null;
}
