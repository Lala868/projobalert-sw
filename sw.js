const CACHE_NAME = 'projobalert-cache-v2';
const CACHE_URLS = [
    '/', '/index.html', '/about.html', 
    '/assets/styles.css', '/assets/scripts.js', 
    '/assets/images/logo.png', '/assets/images/background.jpg',
    '/favicon.ico', '/offline.html'
];

// Install: Pre-cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                await cache.addAll(CACHE_URLS);
            } catch (error) {
                console.error('Failed to pre-cache:', error);
            }
        })
    );
});

// Fetch: Serve from cache first, update in background
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => cachedResponse || caches.match('/offline.html'));

                return cachedResponse || fetchPromise;
            });
        })
    );
});

// Activate: Remove old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
