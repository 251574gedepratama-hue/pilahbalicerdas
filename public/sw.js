/* Pilah Cerdas Bali service worker — makes the app installable and usable offline.
 * Rules: GET only, same-origin only. Navigations are network-first (always
 * fresh when online, cached page when offline). Static assets are cache-first.
 * Server functions / AI calls are never intercepted. */

const VERSION = "pilahin-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const MAX_PAGES = 6;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/assets/") ||
      url.pathname.startsWith("/icons/") ||
      /\.(?:css|js|woff2?|ttf|png|jpe?g|webp|svg|ico)$/i.test(url.pathname))
  );
}

async function trimPages(cache) {
  const keys = (await cache.keys()).slice(0, -MAX_PAGES);
  await Promise.all(keys.map((req) => cache.delete(req)));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.searchParams.has("__rsc") || url.searchParams.has("__stream")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
      await trimPages(cache);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(
      "<!doctype html><html lang='id'><head><meta charset='utf-8'>" +
        "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
        "<title>Pilah Cerdas Bali</title></head>" +
        "<body style=\"font:15px/1.6 system-ui,sans-serif;background:#f9f5e8;color:#13351f;" +
        "display:grid;place-items:center;min-height:100vh;margin:0;padding:1.5rem\">" +
        "<div style='max-width:26rem;text-align:center'><h1 style='font-size:1.2rem;margin:0 0 .5rem'>" +
        "Kamu sedang offline</h1><p style='margin:0 0 1.25rem'>" +
        "Pilah Cerdas Bali butuh koneksi untuk mengenali sampah dengan AI. Periksa koneksi lalu coba lagi.</p>" +
        "<a href='/' style='display:inline-block;background:#135c30;color:#f9f5e8;padding:.6rem 1.1rem;" +
        "border-radius:.75rem;text-decoration:none;font-weight:700'>Coba lagi</a></div></body></html>",
      { status: 503, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    // Refresh in the background so the next visit gets the newest build.
    fetch(request)
      .then((fresh) => {
        if (fresh && fresh.ok) cache.put(request, fresh.clone());
      })
      .catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}
