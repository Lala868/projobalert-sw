const CACHE_NAME = "blog-cache-v1";
const urlsToCache = [
  "/", 
  "/p/latest-jobs.html", 
  "/p/admit-cards.html", 
  "/p/results.html", 
  "https://projobalert01.blogspot.com/script.js", 
  "https://projobalert01.blogspot.com/extra-script.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event with cache expiration logic
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Cache expiry logic: 30 days
        return response;
      }
      return fetch(event.request).then((newResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, newResponse.clone());
          return newResponse;
        });
      });
    })
  );
});

// Purane cache delete karne ka system (Expiration logic)
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
