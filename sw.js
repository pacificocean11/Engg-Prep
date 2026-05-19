const CACHE_NAME = 'enggtv-cache-v1.5';
const urlsToCache = [
  './',
  './index.html',
  './login.html',
  './style.css',
  './app.js',
  './questions.js',
  './engg_tv_logo.png',
  './pwa-icon.png'
];

// Install the service worker and cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  // Only handle GET requests and local assets
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Check if the request is for one of our core assets
  const isCoreAsset = urlsToCache.some(url => {
    const assetPath = url.replace('./', '');
    return assetPath && event.request.url.endsWith(assetPath);
  });

  const isRoot = event.request.url.endsWith('/') || event.request.url.endsWith('/index.html');

  if (isCoreAsset || isRoot) {
    // Network First strategy for core local assets
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return caches.match(event.request);
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache First strategy for other local assets (images, etc.)
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return fetchResponse;
        });
      })
    );
  }
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
