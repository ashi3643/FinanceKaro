self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('financekaro-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/learn',
        '/calculate',
        '/scam-radar',
        '/rankings',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
