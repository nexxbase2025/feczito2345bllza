
const CACHE_NAME = "luxury-nails-studio-cache-v1";
const FILES_TO_CACHE = [
  "./",
  "index.html",
  "manifest.json",
  "service-worker.js",
  // Aquí pon las rutas de imágenes, css, íconos que uses
  "icons/icon-192.png",
  "icons/icon-512.png"
];

// Instalación: cachear los archivos principales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: borrar caches antiguos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: estrategias cache-first para imágenes, network-first para otros
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Cache first para imágenes
  if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
  } else {
    // Network first para todo lo demás
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
