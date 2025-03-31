const CACHE_NAME = "blog-cache-v7";
const STATIC_ASSETS = [
  "/", // Home Page
  "/offline.html", // Offline Fallback
  "/css/style.css", // CSS
  "/js/script.js", // JavaScript
  "/images/logo.png", // Logo
  "/fonts/custom-font.woff2", // Fonts
];

// ✅ Install Event - Static Files Cache Karo
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // ⚡ Force Activate Immediately
});

// ✅ Fetch Event - Serve Cache First, Then Update in Background
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone()); // Update Cache
            return networkResponse;
          });
        })
        .catch(() => cachedResponse || caches.match("/offline.html")); // Offline Mode

      return cachedResponse || networkFetch;
    })
  );
});

// ✅ Auto Refresh Cache After 30 Days
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Ensure New SW Takes Control
});
