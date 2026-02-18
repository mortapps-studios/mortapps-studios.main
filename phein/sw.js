// ============================================================================
// Phein Screener – Production Service Worker
// Version: phein-v1-mortzkey
// Cache strategy: Cache-first with network fallback & background refresh
// Auto‑update: skipWaiting() + clients.claim() – immediate activation
// ============================================================================

const CACHE_NAME = 'phein-v1-mortzkey';

// Assets to precache – all essential for offline use
const PRECACHE_ASSETS = [
  '/phein/',
  '/phein/index.html',
  '/phein/phein-icons/favicon.ico',
  '/phein/phein-icons/favicon-16x16.png',
  '/phein/phein-icons/favicon-32x32.png',
  '/phein/phein-icons/android-chrome-192x192.png',
  '/phein/phein-icons/android-chrome-512x512.png',
  '/phein/phein-icons/apple-touch-icon.png',
  '/phein/screenshot-wide.png',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'
];

// ---------- INSTALL ----------
self.addEventListener('install', event => {
  console.log('[SW] Installing Phein v1 (MortZKey)');
  // Precache all essential assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()) // Force immediate activation
  );
});

// ---------- ACTIVATE ----------
self.addEventListener('activate', event => {
  console.log('[SW] Activating Phein v1 (MortZKey)');
  // Clean up old caches (keep only current cache)
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => clients.claim()) // Take control immediately
  );
});

// ---------- FETCH ----------
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Cache‑first strategy: try cache, fallback to network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached response, then update cache in background
          event.waitUntil(updateCache(event.request));
          return cachedResponse;
        }

        // Not in cache – fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache successful responses for future
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              event.waitUntil(
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache))
              );
            }
            return networkResponse;
          });
      })
  );
});

// Helper: fetch and update cache in the background
async function updateCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      console.log('[SW] Background cache updated for:', request.url);
    }
  } catch (err) {
    // Silent fail – offline or network error
  }
}
