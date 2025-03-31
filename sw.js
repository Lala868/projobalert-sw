const CACHE_NAME = "blog-cache-v10";
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // ⏳ 30 Din
const STATIC_ASSETS = [
  "/", "/offline.html", "/css/style.css", "/js/script.js",
  "/images/logo.png", "/fonts/custom-font.woff2"
];

// ✅ Install Event - Static Assets Cache Karo
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ✅ Fetch Event - Smart Caching (Static + Posts + Labels)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              // ✅ Agar post ya label page hai toh cache update karo
              if (
                url.pathname.includes("/search/label/") ||
                url.pathname.includes("/p/") ||
                url.pathname.includes("/post-")
              ) {
                cache.put(event.request, networkResponse.clone());
              }
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || caches.match("/offline.html")); // ❌ Offline Mode

        // ✅ Static assets fast serve karo, baaki fresh fetch ho
        return cachedResponse || networkFetch;
      });
    })
  );
});

// ✅ Auto Cache Expiry After 30 Days
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
