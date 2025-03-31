const CACHE_NAME = "blog-cache-v8";
const STATIC_ASSETS = [
  "https://yourblog.blogspot.com/", 
  "https://yourblog.blogspot.com/offline.html", 
  "https://yourblog.blogspot.com/css/style.css", 
  "https://yourblog.blogspot.com/js/script.js", 
  "https://yourblog.blogspot.com/images/logo.png"
];

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isStaticAsset = STATIC_ASSETS.some(asset => url.pathname.includes(asset));

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse && isStaticAsset) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            throw new Error("Fetch Failed");
          }
          return caches.open(CACHE_NAME).then((cache) => {
            if (url.pathname.startsWith("/search/label/") || url.pathname.startsWith("/post/")) {
              cache.put(event.request, networkResponse.clone()); // 🆕 Dynamic Cache for Posts
            }
            return networkResponse;
          });
        })
        .catch(() => caches.match("/offline.html"));
    })
  );
});
