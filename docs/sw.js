// Service Worker — bypass cache complet (force réseau, vide les caches au démarrage)
self.addEventListener('install', event => {
  self.skipWaiting(); // active la nouvelle version immédiatement
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Vide tous les caches existants à chaque activation
      caches.keys().then(names => Promise.all(names.map(n => caches.delete(n)))),
      // Prend le contrôle des pages déjà ouvertes
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', event => {
  // GET uniquement, on ignore le reste (POST etc.)
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store', credentials: event.request.credentials })
      .catch(() => caches.match(event.request))
  );
});
