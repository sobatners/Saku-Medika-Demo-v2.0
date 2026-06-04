const CACHE_NAME = 'sakumedika-v1';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './logo.svg'
];

// Tahap Install & Caching file utama
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Jalankan aplikasi secara offline/online
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});
