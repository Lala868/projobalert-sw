const CACHE_NAME = 'projobalert-cache-v1';
const CACHE_URLS = [
    '/', 
    '/index.html', 
    '/about.html', 
    '/assets/styles.css', 
    '/assets/scripts.js', 
    '/assets/images/logo.png', 
    '/assets/images/background.jpg', 
    '/favicon.ico', 
    '/offline.html' // Offline fallback
];

// Install: Pre-cache essential resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                await cache.addAll(CACHE_URLS);
            } catch (error) {
                console.error('Failed to pre-cache resources:', error);
            }
        })
    );
});

// Fetch: Try Cache First, then Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Serve from cache
            }
            return fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        let responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => caches.match('/offline.html')); // Offline fallback
        })
    );
});

// Activate: Remove old caches & update
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
