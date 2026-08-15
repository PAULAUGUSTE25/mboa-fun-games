const CACHE_NAME = "la-terrasse-pos-v4";

// Install Event - Force update
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate Event - Purge all old caches instantly
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          console.log("[Service Worker] Purging old cache:", cache);
          return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First Strategy for HTML/JS/CSS to ensure immediate app updates
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.includes("/api/") || event.request.url.includes("/ws")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if completely offline
        return caches.match(event.request);
      })
  );
});
