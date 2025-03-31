const CACHE_NAME = "blog-cache-v4";
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // ⏳ 30 din
const STATIC_ASSETS = [
  "/", // Home page
  "/offline.html", // Offline fallback
  "/css/style.css", // CSS
  "/js/script.js", // JavaScript
  "/images/logo.png", // Logo
  "/fonts/custom-font.woff2", // Fonts (Agar hain)
];

// ✅ Install Event - Static Files Cache Karo
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // ⚡ Immediate Activation
});

// ✅ Smart Fetch Event (Fresh Content for Posts & Labels)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return; // ❌ POST requests cache nahi honi chahiye

  const url = new URL(event.request.url);

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // ✅ Agar post ya label page hai toh cache update karo
            if (url.pathname.includes("/search/label/") || url.pathname.includes("/p/") || url.pathname.includes("/post-")) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || caches.match("/offline.html")); // ❌ Offline Mode

        // ✅ Static assets fast serve karo, baaki fresh fetch ho
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
