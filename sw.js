const CACHE_NAME = "blog-cache-v1";
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// Important pages ko manually pre-cache karenge
const PRECACHE_URLS = [
  "/",  
  "/p/latest-jobs.html",
  "/p/admit-cards.html",
  "/p/results.html",
  "/p/about-us.html"
];

// Install event - Pre-cache important pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// Fetch event - Sabhi pages ko cache me dalna
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

// Activate event - Purana cache delete karna (30 din ke baad automatic refresh)
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
