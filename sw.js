const CACHE_NAME = "blog-cache-v9";
const STATIC_ASSETS = [
  "/", "/offline.html", "/css/style.css", "/js/script.js",
  "/images/logo.png", "/fonts/custom-font.woff2"
];

// ✅ Install Event - Static Assets Ko Cache Karo
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ✅ Fetch Event - Cache First Policy
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // ✅ Hamesha Pehle Cache Se Load Karo
      }
      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match("/offline.html")); // ❌ Agar Offline Hai
    })
  );
});

// ✅ Activate Event - Old Cache Clear
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
  self.clients.claim();
});
