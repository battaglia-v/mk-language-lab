// Service Worker for Macedonian Language Lab PWA
const CACHE_NAME = 'mk-language-lab-v3'; // Updated version to invalidate old caches
const RUNTIME_CACHE = 'mk-language-lab-runtime-v3';

// Core assets to cache on install
// NOTE: '/' is intentionally excluded - next-intl middleware must handle locale redirects
const CORE_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v3...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching core assets');
      return cache.addAll(CORE_ASSETS).catch((error) => {
        console.error('[SW] Failed to cache core assets:', error);
        // Don't fail installation if caching fails
        return Promise.resolve();
      });
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // CRITICAL: Skip root path - let next-intl middleware handle locale redirects
  // This prevents caching '/' and breaking the locale routing
  if (url.pathname === '/') {
    return;
  }

  // CRITICAL: Skip authentication routes - prevent OAuth flow interference
  // Service workers must NOT intercept NextAuth callbacks and redirects
  if (url.pathname.startsWith('/api/auth/')) {
    return;
  }

  // Skip Next.js internal requests and hot reload in development
  if (
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/_next/static/webpack/') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // API requests - Network first, fallback to cache (GET only)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request, { redirect: 'follow' }) // Explicitly follow redirects
        .then((response) => {
          // Only cache successful GET requests that aren't redirects
          if (
            request.method === 'GET' &&
            response.status === 200 &&
            !response.redirected
          ) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails (only for GET)
          if (request.method === 'GET') {
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return a custom offline response for API calls
              return new Response(
                JSON.stringify({ error: 'Offline', offline: true }),
                {
                  headers: { 'Content-Type': 'application/json' },
                  status: 503,
                }
              );
            });
          }
          // For non-GET requests, just fail
          return new Response(
            JSON.stringify({ error: 'Offline', offline: true }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
            }
          );
        })
    );
    return;
  }

  // Static assets and pages - Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update cache in background
        fetch(request, { redirect: 'follow' })
          .then((response) => {
            // Only cache successful responses that aren't redirects
            if (response && response.status === 200 && !response.redirected) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, response.clone());
              });
            }
          })
          .catch(() => {
            // Silently fail background update
          });
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request, { redirect: 'follow' })
        .then((response) => {
          // Don't cache non-successful responses or redirects
          if (
            !response ||
            response.status !== 200 ||
            response.type === 'error' ||
            response.redirected
          ) {
            return response;
          }

          // Cache successful responses (GET only)
          if (request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Network failed, return offline fallback for navigation requests
          if (request.mode === 'navigate') {
            // Fallback to default locale page instead of root
            return caches.match('/mk').then((response) => {
              return response || new Response('Offline - Please check your internet connection', {
                headers: { 'Content-Type': 'text/plain' },
                status: 503,
              });
            });
          }

          return new Response('Offline', {
            headers: { 'Content-Type': 'text/plain' },
            status: 503,
          });
        });
    })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  // Can be used to sync user data when connection is restored
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
