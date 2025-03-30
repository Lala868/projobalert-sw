const CACHE_NAME = "blog-cache-v1";
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 din

// ✅ Pre-cache important pages
const urlsToCache = [
  "/", // Home page
  "/p/latest-jobs.html",
  "/p/admit-cards.html",
  "/p/results.html",
];

// Install event - Automatically cache important pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - Serve from cache first, then fetch & update cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

// ✅ Purane cache delete karne ka system (30 din ke baad automatic refresh)
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
});
