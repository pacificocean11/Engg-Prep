const CACHE_NAME = 'engg-prep-cache-v49';
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './app.js',
  './questions.js',
  './advanced_questions.js',
  './exam_questions.js',
  './style.css',
  './firebase-config.js',
  './js/data-manager.js',
  './js/particles.js',
  './js/scratchpad.js',
  './js/global-search.js',
  './js/onboarding.js',
  './js/achievements.js',
  './js/tts.js',
  './js/weakness-srs.js',
  './js/daily-quests.js',
  './js/fe-simulator.js',
  './manifest.json',
  './engg_tv_logo.png'
];

// Install Event - Precache App Shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Pre-caching App Shell');
        // Use a simple addAll, gracefully handling failures for specific files if any
        return Promise.allSettled(APP_SHELL.map(url => cache.add(url).catch(err => console.warn(`Failed to cache ${url}`, err))));
      })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Firebase API requests (Firestore handles its own offline persistence)
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('securetoken.googleapis.com') || 
      event.request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Update the cache with the new response
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(err => {
        console.warn('Network fetch failed, falling back to cache if available.', err);
      });

      // Return the cached response immediately, or wait for the network response
      return cachedResponse || fetchPromise;
    })
  );
});

// Message Event - Allow app to trigger manual asset caching
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_ASSETS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return Promise.allSettled(event.data.urls.map(url => cache.add(url)));
      }).then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
});
