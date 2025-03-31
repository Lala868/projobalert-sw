const CACHE_NAME = "blog-cache-v2";  
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 din  

const STATIC_ASSETS = [  
  "/", // Home page  
  "/offline.html", // Offline page  
  "/css/style.css", // Main CSS  
  "/js/script.js", // Main JS  
  "/images/logo.png", // Logo  
];

// ✅ Install event - Static assets ko cache me store karna  
self.addEventListener("install", (event) => {  
  event.waitUntil(  
    caches.open(CACHE_NAME).then((cache) => {  
      return cache.addAll(STATIC_ASSETS);  
    })  
  );  
  self.skipWaiting(); // Instant activation  
});

// ✅ Fetch event - Smart caching strategy  
self.addEventListener("fetch", (event) => {  
  if (event.request.method !== "GET") return; // Sirf GET requests ko cache karo  

  event.respondWith(  
    caches.match(event.request).then((cachedResponse) => {  
      if (cachedResponse) {  
        return cachedResponse; // ⚡ Fast return from cache  
      }  
      
      return fetch(event.request).then((networkResponse) => {  
        return caches.open(CACHE_NAME).then((cache) => {  
          cache.put(event.request, networkResponse.clone());  
          return networkResponse;  
        });  
      }).catch(() => {  
        return caches.match("/offline.html"); // ⚠️ Agar network down ho to offline page  
      });  
    })  
  );  
});

// ✅ Activate event - Purane cache ko clear karna  
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
  self.clients.claim(); // Instant update  
});
