const CACHE_NAME = 'projobalert-cache-v1';
const CACHE_URLS = [
    '/', // Home page
    '/index.html', // Main HTML file
    '/about.html', // About page (optional)
    '/assets/styles.css', // CSS file
    '/assets/scripts.js', // JavaScript file
    '/assets/images/logo.png', // Logo image
    '/assets/images/background.jpg', // Background image
    '/favicon.ico', // Favicon
];

// Install the service worker and cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_URLS); // Pre-cache essential resources
        })
    );
});

// Fetch event to serve cached resources
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // If cache is found, serve it
                return cachedResponse;
            }
            // If not found in cache, fetch from network and update cache
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    // Update cache with new response
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            });
        })
    );
});

// Activate the service worker and clear old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        // Delete old caches that are no longer needed
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
