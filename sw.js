// sw.js - Service Worker básico para PWA
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open('crm-imob-v1').then(cache =>
      cache.match(event.request).then(resp =>
        resp || fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        })
      )
    )
  );
});
