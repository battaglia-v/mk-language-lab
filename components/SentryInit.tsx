'use client';

import { useEffect } from 'react';
// import * as Sentry from '@sentry/nextjs'; // Disabled - Sentry temporarily removed

/**
 * Client component to ensure Sentry is initialized on the client side
 * This directly initializes Sentry to ensure it loads properly
 * CURRENTLY DISABLED - Sentry temporarily removed to fix 429 errors
 */
export function SentryInit() {
  // Sentry initialization completely disabled
  return null;
}
