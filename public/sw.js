// Service Worker for The Game Shelf PWA
// PRECACHE_MANIFEST is injected at build time by scripts/generate-sw-precache.mjs
const CACHE_VERSION = "v1";
const CACHE_NAME = `game-shelf-${CACHE_VERSION}`;

// This will be replaced by the build script with actual file list
const PRECACHE_URLS = self.__PRECACHE_MANIFEST || [];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Prefer per-URL add so one failure does not abort install
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn("[sw] precache failed:", url, err);
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("game-shelf-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
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
  return url.pathname.includes("/data/");
}

function isImmutableAsset(url) {
  return (
    url.pathname.includes("/_next/static/") ||
    /\.(png|jpe?g|webp|svg|ico|woff2?|css)$/i.test(url.pathname)
  );
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (request.mode === "navigate") {
      const shell =
        (await caches.match("/boardgames/")) ||
        (await caches.match("/boardgames/zh/")) ||
        (await caches.match("/boardgames/en/"));
      if (shell) return shell;
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
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

  event.respondWith(networkFirst(request));
});
