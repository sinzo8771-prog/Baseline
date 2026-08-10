/* The Baseline service worker — an offline shell, not a fake news source.
 *
 * The edition itself is aggregated in the browser and cached in localStorage
 * (stale-while-revalidate). The worker's only job is to keep the app shell and
 * the feed-relay responses reachable so a returning/offline reader can always
 * re-render their last saved edition:
 *   - navigations: network-first, fall back to the cached shell
 *   - static assets: stale-while-revalidate
 *   - feed API: network-first, cached copy as fallback
 * Never cache an error response. Never pretend fresh news exists offline. */

const CACHE = "the-baseline-shell-v1";
const API_PREFIX = "/api/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests: serve the freshest shell, fall back to any cached one.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const fresh = await fetch(request);
          await cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await cache.match(request);
          return cached || new Response("Offline", { status: 503, headers: { "content-type": "text/plain" } });
        }
      })(),
    );
    return;
  }

  // Feed relay + source list: network-first, cached copy as offline fallback.
  if (url.pathname.startsWith(API_PREFIX)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const fresh = await fetch(request);
          if (fresh.ok) await cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          return Response.error();
        }
      })(),
    );
    return;
  }

  // Everything else (hashed JS/CSS, images, fonts): stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached || new Response("Offline", { status: 503, headers: { "content-type": "text/plain" } }));
      return cached || network;
    })(),
  );
});
