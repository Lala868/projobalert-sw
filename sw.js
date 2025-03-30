const CACHE_NAME = "blog-cache-v1";
const urlsToCache = [
  "/", 
  "/p/latest-jobs.html", 
  "/p/admit-cards.html", 
  "/p/results.html", 
  "https://projobalert01.blogspot.com/script.js", 
  "https://projobalert01.blogspot.com/extra-script.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
