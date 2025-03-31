const CACHE_NAME = "blog-cache-v6";
const STATIC_ASSETS = [
  "/", // Home page
  "/offline.html", // Offline fallback
  "/css/style.css", // CSS
  "/js/script.js", // JavaScript
  "/images/logo.png", // Logo
  "/fonts/custom-font.woff2", // Fonts
];

// ✅ Install Event - Cache Static Files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ✅ Smart Fetch Event (Faster Loading + Background Refresh)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || caches.match("/offline.html"));

        return cachedResponse || networkFetch;
      });
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
  self.clients.claim();
});
