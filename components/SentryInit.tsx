'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Client component to ensure Sentry is initialized on the client side
 * This directly initializes Sentry to ensure it loads properly
 */
export function SentryInit() {
  useEffect(() => {
    const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
    const ENVIRONMENT = process.env.NODE_ENV || 'development';

    if (!SENTRY_DSN) {
      console.warn('Sentry DSN not configured');
      return;
    }

    // Check if Sentry is already initialized
    const client = Sentry.getClient();
    if (client) {
      console.log('Sentry already initialized');
      return;
    }

    console.log('Initializing Sentry client...');

    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
      debug: true, // Enable debug mode to see what's happening
      sampleRate: 1.0,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 0.0,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
        Sentry.browserTracingIntegration(),
      ],
      beforeSend(event, hint) {
        if (ENVIRONMENT === 'development' && !process.env.NEXT_PUBLIC_SENTRY_ENABLED) {
          return null;
        }
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message);
          if (
            message.includes('chrome-extension://') ||
            message.includes('moz-extension://') ||
            message.includes('safari-extension://') ||
            message.includes('Failed to fetch') ||
            message.includes('NetworkError') ||
            message.includes('Network request failed')
          ) {
            return null;
          }
        }
        return event;
      },
      ignoreErrors: [
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'http://tt.epicplay.com',
        "Can't find variable: ZiteReader",
        'jigsaw is not defined',
        'ComboSearch is not defined',
        'atomicFindClose',
        'fb_xd_fragment',
        'bmi_SafeAddOnload',
        'EBCallBackMessageReceived',
        'conduitPage',
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
      beforeBreadcrumb(breadcrumb) {
        if (breadcrumb.category === 'console') {
          return null;
        }
        return breadcrumb;
      },
    });

    console.log('Sentry initialized successfully');

    // Expose Sentry to window for debugging
    if (typeof window !== 'undefined') {
      (window as typeof window & { Sentry: typeof Sentry }).Sentry = Sentry;
      console.log('Sentry exposed to window.Sentry');
    }
  }, []);

  return null;
}
