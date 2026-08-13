const CACHE_NAME = "la-terrasse-pos-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/la-terrasse-logo.png",
  "/hero_bg.jpg",
  "/menu-bg.jpg",
  "/manifest.json"
];

// Install Event - Pre-cache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell & static assets");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate Network Strategy with offline fallback
self.addEventListener("fetch", (event) => {
  // Skip non-GET or API websocket requests
  if (event.request.method !== "GET" || event.request.url.includes("/api/") || event.request.url.includes("/ws")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return cached response if offline
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
