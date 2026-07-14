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

function isNavigation(request, url) {
  return (
    request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith("/")
  );
}

function isMutableData(url) {
  // Game JSON / manifests must refresh after deploy
  return url.pathname.includes("/data/");
}

function isImmutableAsset(url) {
  // Content-hashed Next bundles + static media
  return (
    url.pathname.includes("/_next/static/") ||
    /\.(png|jpe?g|webp|svg|ico|woff2?|css)$/i.test(url.pathname)
  );
}

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then(
        (cached) =>
          cached ||
          (request.mode === "navigate"
            ? caches.match("/boardgames/") ||
              new Response("Offline", { status: 503 })
            : new Response("Offline", { status: 503 }))
      )
    );
}

function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    });
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (!url.protocol.startsWith("http")) return;

  // Never cache the SW script itself
  if (url.pathname.endsWith("/sw.js")) return;

  // HTML + game data: always try network first so deploys show up
  if (isNavigation(request, url) || isMutableData(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Hashed bundles / images: cache-first for speed & offline
  if (isImmutableAsset(url) || url.pathname.endsWith(".js")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});
