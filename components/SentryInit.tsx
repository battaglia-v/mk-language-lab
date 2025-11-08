'use client';

import { useEffect } from 'react';

/**
 * Client component to ensure Sentry is initialized on the client side
 * This explicitly imports the Sentry client config to ensure it loads
 */
export function SentryInit() {
  useEffect(() => {
    // Import Sentry client config to ensure it's loaded
    import('../sentry.client.config');
  }, []);

  return null;
}
