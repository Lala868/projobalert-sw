const CACHE_NAME = "blog-cache-v3";
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // ⏳ 30 din
const STATIC_ASSETS = [
  "/", // Home page
  "/offline.html", // Offline fallback
  "/css/style.css", // CSS
  "/js/script.js", // JavaScript
  "/images/logo.png", // Logo
  "/fonts/custom-font.woff2", // Fonts (Agar hain)
];

// ✅ Install Event - Static Files Cache Me Save Karo
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // ⚡ Immediate Activation
});

// ✅ Fetch Event - Smart Caching Strategy with 30 Days Expiry
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return; // ❌ POST requests cache nahi honi chahiye

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // ⚡ Cache se fast load
        }
        return fetchAndUpdateCache(event.request, cache);
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

// ✅ 30 Din Baad Cache Refresh Karega
function fetchAndUpdateCache(request, cache) {
  return fetch(request).then((response) => {
    if (!response || response.status !== 200 || response.type !== "basic") {
      return response;
    }
    
    const clonedResponse = response.clone();
    const headers = new Headers(clonedResponse.headers);
    headers.append("sw-fetch-time", new Date().toISOString()); // ✅ Cache me fetch time store karo
    cache.put(request, clonedResponse);
    
    return response;
  });
}
