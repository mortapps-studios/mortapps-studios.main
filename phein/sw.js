// Phein Screener Service Worker v2.0
// MortApps Studios 2026

const CACHE_NAME = 'phein-cache-v2';
const STATIC_CACHE = 'phein-static-v2';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/phein/',
    '/phein/index.html',
    '/phein/manifest.json',
    '/phein/phein-icons/favicon.ico',
    '/phein/phein-icons/favicon-16x16.png',
    '/phein/phein-icons/favicon-32x32.png',
    '/phein/phein-icons/apple-touch-icon.png',
    '/phein/phein-icons/android-chrome-192x192.png',
    '/phein/phein-icons/android-chrome-512x512.png'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache local assets
            caches.open(STATIC_CACHE).then((cache) => {
                console.log('[ServiceWorker] Precaching local assets');
                return cache.addAll(PRECACHE_ASSETS.map(url => {
                    return new Request(url, { cache: 'reload' });
                })).catch(err => {
                    console.log('[ServiceWorker] Some local assets failed to cache:', err);
                });
            }),
            // Cache external assets
            caches.open(CACHE_NAME).then((cache) => {
                console.log('[ServiceWorker] Caching external assets');
                return Promise.all(
                    EXTERNAL_ASSETS.map(url => {
                        return fetch(url, { mode: 'cors' })
                            .then(response => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                }
                            })
                            .catch(err => {
                                console.log('[ServiceWorker] Failed to cache:', url);
                            });
                    })
                );
            })
        ]).then(() => {
            console.log('[ServiceWorker] Install complete');
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] Claiming clients');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip license server API calls - always use network
    if (url.hostname.includes('vercel.app') || 
        url.pathname.includes('/api/validate') || 
        url.pathname.includes('/api/check')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: 'NETWORK_ERROR',
                    message: 'Unable to connect to license server'
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }
    
    // For PDF.js library files, try cache first
    if (url.hostname.includes('cdnjs.cloudflare.com')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }
    
    // For local Phein resources
    if (url.pathname.startsWith('/phein/')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    // Fetch updated version in background
                    fetch(request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            caches.open(STATIC_CACHE).then((cache) => {
                                cache.put(request, networkResponse);
                            });
                        }
                    }).catch(() => {});
                    
                    return cachedResponse;
                }
                
                // No cache, fetch from network
                return fetch(request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        const responseToCache = networkResponse.clone();
                        caches.open(STATIC_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Return offline fallback for navigation requests
                    if (request.mode === 'navigate') {
                        return caches.match('/phein/index.html');
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
        );
        return;
    }
    
    // Default: network first, cache as fallback
    event.respondWith(
        fetch(request).catch(() => {
            return caches.match(request);
        })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Background sync for offline license validation (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'license-sync') {
        console.log('[ServiceWorker] Background sync: license-sync');
    }
});

console.log('[ServiceWorker] Phein Service Worker loaded');
