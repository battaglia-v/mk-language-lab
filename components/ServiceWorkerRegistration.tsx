'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register service worker in production
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Wait for page load to avoid impacting performance
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[SW] Service Worker registered successfully:', registration.scope);

            // Check for updates periodically
            setInterval(() => {
              registration.update().catch((error) => {
                console.warn('[SW] Update check failed:', error);
                // Silently fail - this is expected if offline or during deployment
              });
            }, 60000); // Check every minute

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (
                    newWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    // New service worker available, show update notification
                    console.log('[SW] New service worker available');

                    // Optionally, prompt user to reload
                    if (confirm('A new version is available. Reload to update?')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('[SW] Service Worker registration failed:', error);
          });

        // Handle controller change (new service worker activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] New service worker activated');
        });
      });
    } else if (process.env.NODE_ENV === 'development') {
      console.log('[SW] Service Worker registration skipped in development mode');
    }
  }, []);

  return null;
}
