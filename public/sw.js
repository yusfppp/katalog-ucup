const CACHE = "alfa-bites-v1";
const ASET_DASAR = ["/offline", "/icons/icon-192.png", "/icons/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASET_DASAR))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((kunci) => Promise.all(kunci.filter((item) => item !== CACHE).map((item) => caches.delete(item))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/admin")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((respons) => {
          const salinan = respons.clone();
          caches.open(CACHE).then((cache) => cache.put(request, salinan));
          return respons;
        })
        .catch(async () => {
          const tersimpan = await caches.match(request);
          return tersimpan || caches.match("/offline");
        })
    );
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/produk/")
  ) {
    event.respondWith(
      caches.match(request).then((tersimpan) => {
        if (tersimpan) return tersimpan;
        return fetch(request).then((respons) => {
          const salinan = respons.clone();
          caches.open(CACHE).then((cache) => cache.put(request, salinan));
          return respons;
        });
      })
    );
  }
});
