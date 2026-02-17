/**
 * Bioattex Service Worker - Auto-Update Version
 * Version: 2.2
 * 
 * HOW TO DEPLOY UPDATES:
 * 1. Make changes to your app files
 * 2. Increment CACHE_VERSION below (e.g., 'v2.2' -> 'v2.3')
 * 3. Upload all files to server
 * 4. Users will automatically get the update on next page load
 * 
 * IMPORTANT: Server must serve this file with:
 * Cache-Control: no-cache, no-store, must-revalidate
 */

const CACHE_VERSION = 'bioattex-v2.2';
const STATIC_CACHE = CACHE_VERSION + '-static';
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';

// Essential assets to pre-cache
const PRE_CACHE_ASSETS = [
    './index.html',
    './manifest.json',
    './bioattex-icons/favicon.ico',
    './bioattex-icons/favicon-16x16.png',
    './bioattex-icons/favicon-32x32.png',
    './bioattex-icons/apple-touch-icon.png',
    './bioattex-icons/android-chrome-192x192.png',
    './bioattex-icons/android-chrome-512x512.png'
];

// External CDN assets to cache
const CDN_ASSETS = [
    'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js'
];

// Face-API models to cache
const MODEL_ASSETS = [
    'https://justadudewhohacks.github.io/face-api.js/models/tiny_face_detector_model-weights_manifest.json',
    'https://justadudewhohacks.github.io/face-api.js/models/tiny_face_detector_model-shard1',
    'https://justadudewhohacks.github.io/face-api.js/models/face_landmark_68_tiny_model-weights_manifest.json',
    'https://justadudewhohacks.github.io/face-api.js/models/face_landmark_68_tiny_model-shard1',
    'https://justadudewhohacks.github.io/face-api.js/models/face_recognition_model-weights_manifest.json',
    'https://justadudewhohacks.github.io/face-api.js/models/face_recognition_model-shard1',
    'https://justadudewhohacks.github.io/face-api.js/models/face_recognition_model-shard2'
];

// =====================================================
// INSTALL EVENT - Pre-cache essential assets
// =====================================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing version:', CACHE_VERSION);
    
    event.waitUntil(
        Promise.all([
            // Pre-cache static assets
            caches.open(STATIC_CACHE).then((cache) => {
                console.log('[SW] Pre-caching static assets');
                return cache.addAll(PRE_CACHE_ASSETS).catch(err => {
                    console.log('[SW] Some static assets failed to cache:', err);
                });
            }),
            // Pre-cache CDN assets
            caches.open(DYNAMIC_CACHE).then((cache) => {
                console.log('[SW] Pre-caching CDN assets');
                return Promise.all(
                    [...CDN_ASSETS, ...MODEL_ASSETS].map(url =>
                        fetch(url, { mode: 'cors' })
                            .then(response => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                }
                            })
                            .catch(() => {
                                console.log('[SW] Failed to cache:', url);
                            })
                    )
                );
            })
        ]).then(() => {
            // FORCE IMMEDIATE ACTIVATION - No waiting
            console.log('[SW] Skip waiting - forcing activation');
            return self.skipWaiting();
        })
    );
});

// =====================================================
// ACTIVATE EVENT - Clean old caches & take control
// =====================================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating version:', CACHE_VERSION);
    
    event.waitUntil(
        Promise.all([
            // Delete ALL old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete any cache that doesn't match current version
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // TAKE CONTROL OF ALL CLIENTS IMMEDIATELY
            self.clients.claim().then(() => {
                console.log('[SW] Claimed all clients');
            })
        ]).then(() => {
            console.log('[SW] Activation complete');
        })
    );
});

// =====================================================
// FETCH EVENT - Cache-first with background update
// =====================================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // For navigation requests (HTML pages) - Network first, then cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache the response
                    const responseClone = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then((cachedResponse) => {
                        return cachedResponse || caches.match('./index.html');
                    });
                })
        );
        return;
    }
    
    // For face-api models and CDN - Cache first, background refresh
    if (url.href.includes('face-api') || url.href.includes('cdn.jsdelivr') || url.href.includes('cdnjs.cloudflare')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                // Return cached version immediately
                if (cachedResponse) {
                    // Fetch fresh version in background for next time
                    fetch(request)
                        .then(response => {
                            if (response.ok) {
                                caches.open(DYNAMIC_CACHE).then(cache => {
                                    cache.put(request, response);
                                });
                            }
                        })
                        .catch(() => {});
                    
                    return cachedResponse;
                }
                
                // Not cached, fetch from network
                return fetch(request)
                    .then((response) => {
                        if (response.ok) {
                            const responseClone = response.clone();
                            caches.open(DYNAMIC_CACHE).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    });
            })
        );
        return;
    }
    
    // For other requests - Cache-first strategy with background refresh
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            // Return cached response if available
            if (cachedResponse) {
                // Refresh cache in background
                fetch(request)
                    .then(response => {
                        if (response.ok) {
                            caches.open(DYNAMIC_CACHE).then(cache => {
                                cache.put(request, response);
                            });
                        }
                    })
                    .catch(() => {});
                
                return cachedResponse;
            }
            
            // Not in cache, fetch from network
            return fetch(request)
                .then((response) => {
                    // Cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return offline fallback for images
                    if (request.destination === 'image') {
                        return new Response(
                            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#f1f5f9" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="#64748b" font-size="10">Offline</text></svg>',
                            { headers: { 'Content-Type': 'image/svg+xml' } }
                        );
                    }
                    
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
        })
    );
});

// =====================================================
// MESSAGE HANDLER - For manual cache clearing
// =====================================================
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                // Notify the client
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage('cacheCleared');
                    });
                });
            })
        );
    }
});

// =====================================================
// PUSH NOTIFICATIONS (Future feature)
// =====================================================
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Bioattex notification',
        icon: './bioattex-icons/android-chrome-192x192.png',
        badge: './bioattex-icons/favicon-32x32.png',
        vibrate: [100, 50, 100],
        data: { dateOfArrival: Date.now() }
    };
    
    event.waitUntil(
        self.registration.showNotification('Bioattex', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./index.html')
    );
});

console.log('[SW] Service Worker loaded - Version:', CACHE_VERSION);
