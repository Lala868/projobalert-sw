const CACHE_NAME = "blog-cache-v8";
const STATIC_ASSETS = [
  "/", // Home Page
  "/offline.html", // Offline Fallback
  "/css/style.css", // CSS
  "/js/script.js", // JavaScript
  "/images/logo.png", // Logo
  "/fonts/custom-font.woff2", // Fonts
];

// ✅ Install Event - Static Assets Ko Cache Karo
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ✅ Fetch Event - **Cache First for Static Files, Fresh Fetch for Posts & Labels**
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isStaticAsset = STATIC_ASSETS.includes(url.pathname);

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse && isStaticAsset) {
        // ⚡ **Static Files Ke Liye Direct Cache Se Serve Karo**
        return cachedResponse;
      }

      // 🆕 **Baaki Ke Liye Fresh Fetch + Background Cache Update**
      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => cachedResponse || caches.match("/offline.html")); // ❌ Offline Mode
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
