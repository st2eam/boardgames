// Service Worker for The Game Shelf PWA
// PRECACHE_MANIFEST is injected at build time by scripts/generate-sw-precache.mjs
const CACHE_VERSION = "v1";
const CACHE_NAME = `game-shelf-${CACHE_VERSION}`;

// This will be replaced by the build script with actual file list
const PRECACHE_URLS = self.__PRECACHE_MANIFEST || [];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("game-shelf-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip external requests (e.g., DeepSeek API for AI chat)
  if (url.origin !== self.location.origin) return;

  // Skip chrome-extension and other non-http schemes
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Don't cache error responses
          if (!response || response.status !== 200) return response;

          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/boardgames/") || new Response("Offline", { status: 503 });
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});
