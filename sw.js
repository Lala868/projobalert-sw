const CACHE_NAME = 'projobalert-cache-v3'; 
const CACHE_URLS = [
    '/', '/index.html', '/about.html', 
    '/assets/styles.css', '/assets/scripts.js', 
    '/assets/images/logo.png', '/assets/images/background.jpg', 
    '/favicon.ico', '/offline.html' // Offline fallback
];

// 🟢 Install Event: Cache Important Files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                await cache.addAll(CACHE_URLS);
                console.log('✅ Files Cached Successfully');
            } catch (error) {
                console.error('❌ Caching Failed:', error);
            }
        })
    );
    self.skipWaiting(); // Immediately activate new SW
});

// 🟢 Fetch Event: Serve from Cache First, then Update in Background
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone()); // Update cache in background
                    }
                    return networkResponse;
                }).catch(() => cachedResponse || caches.match('/offline.html')); // Offline fallback
                
                return cachedResponse || fetchPromise; // Serve cache first, update in background
            });
        })
    );
});

// 🟢 Activate Event: Delete Old Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑 Deleting Old Cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
