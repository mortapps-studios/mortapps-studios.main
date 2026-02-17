/**
 * Bioattex Service Worker v2.3
 * Auto-Update Enabled
 */

const CACHE_VERSION = 'bioattex-v2.3';
const STATIC_CACHE = CACHE_VERSION + '-static';
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';

const PRE_CACHE = [
    './index.html',
    './manifest.json',
    './bioattex-icons/favicon.ico',
    './bioattex-icons/favicon-16x16.png',
    './bioattex-icons/favicon-32x32.png',
    './bioattex-icons/apple-touch-icon.png',
    './bioattex-icons/android-chrome-192x192.png',
    './bioattex-icons/android-chrome-512x512.png'
];

const CDN_ASSETS = [
    'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js'
];

const MODELS = [
    'https://justadudewhohacks.github.io/face-api.js/models/tiny_face_detector_model-weights_manifest.json',
    'https://justadudewhohacks.github.io/face-api.js/models/tiny_face_detector_model-shard1',
    'https://justadudewhohacks.github.io/face-api.js/models/face_landmark_68_tiny_model-weights_manifest.json',
    'https://justadudewhohacks.github.io/face-api.js/models/face_landmark_68_tiny_model-shard1',
    'https://justadudewhohacks.github.io/face-api.js/models/face_recognition_model-weights_manifest.json',
    'https://justadudewhohacks.github.io/face-api.js/models/face_recognition_model-shard1',
    'https://justadudewhohacks.github.io/face-api.js/models/face_recognition_model-shard2'
];

// INSTALL
self.addEventListener('install', (e) => {
    e.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(c => c.addAll(PRE_CACHE).catch(() => {})),
            caches.open(DYNAMIC_CACHE).then(c => {
                [...CDN_ASSETS, ...MODELS].forEach(url => {
                    fetch(url, { mode: 'cors' }).then(r => { if (r.ok) c.put(url, r); }).catch(() => {});
                });
            })
        ]).then(() => self.skipWaiting())
    );
});

// ACTIVATE
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// FETCH
self.addEventListener('fetch', (e) => {
    const { request } = e;
    const url = new URL(request.url);
    
    if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;
    
    if (request.mode === 'navigate') {
        e.respondWith(
            fetch(request).then(r => {
                const clone = r.clone();
                caches.open(STATIC_CACHE).then(c => c.put(request, clone));
                return r;
            }).catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
        );
        return;
    }
    
    e.respondWith(
        caches.match(request).then(cached => {
            if (cached) {
                fetch(request).then(r => { if (r.ok) caches.open(DYNAMIC_CACHE).then(c => c.put(request, r)); }).catch(() => {});
                return cached;
            }
            return fetch(request).then(r => {
                if (r.ok) {
                    const clone = r.clone();
                    caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
                }
                return r;
            });
        })
    );
});

self.addEventListener('message', (e) => {
    if (e.data === 'skipWaiting') self.skipWaiting();
});
