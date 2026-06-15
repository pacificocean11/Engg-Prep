// Self-destruct service worker to force-clear browser cache
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
      .then(() => {
        console.log('🧹 Cache cleared and Service Worker unregistered successfully.');
      })
  );
});
