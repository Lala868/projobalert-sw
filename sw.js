const CACHE_NAME = "blog-cache-v1";
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 din

// Install event - Service Worker Install hone par trigger hoga
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/", // Home page
      ]);
    })
  );
});

// Fetch event - Sabhi pages ko cache karo aur fast loading ensure karo
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Agar cache me hai to wahi return karo
        return response;
      }
      return fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Sirf GET requests ko cache me daalo (POST ya API calls nahi cache honi chahiye)
          if (event.request.method === "GET") {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Agar network down ho to cache se load karne ka try karo
      return caches.match("/");
    })
  );
});

// Activate event - Purane cache delete karne ka system (30 din ke baad automatic refresh)
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
