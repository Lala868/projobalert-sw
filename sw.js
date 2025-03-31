const CACHE_NAME = "blog-cache-v5";
const STATIC_ASSETS = [
  "/", // Home page
  "/offline.html", // Offline fallback page
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
  self.skipWaiting();
});

// ✅ Smart Fetch Event (Posts & Labels Cached + Background Refresh)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // ✅ Agar post ya label page hai, to cache update karo
            if (url.pathname.includes("/search/label/") || url.pathname.includes("/p/") || url.pathname.includes("/post-")) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || caches.match("/offline.html")); // Offline Mode

        return cachedResponse || fetchPromise;
      });
    })
  );
});

// ✅ Purane Cache Delete Karne Ka System (30 Din Baad Auto Refresh)
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
