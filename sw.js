const CACHE_NAME = 'engg-prep-cache-v262';
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './style.css',
  './manifest.json',
  './engg_tv_logo.png',
  './firebase-config.js',
  './js/data-manager.js',
  './questions_common.js',
  './js/questions-loader.js',
  './app.js',
  './js/particles.js',
  './js/scratchpad.js',
  './js/global-search.js',
  './js/onboarding.js',
  './js/achievements.js',
  './js/weakness-srs.js',
  './js/daily-quests.js',
  './assets/videos/placeholder_poster.jpg',
  './assets/avatars/sabrish.jpg',
  './assets/avatars/linjo.jpg',
  './assets/avatars/adarsh.jpg',
  './assets/avatars/nainish.jpg',
  './assets/avatars/shariff.jpg'
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
          if (cache !== CACHE_NAME && cache !== 'engg-prep-offline-videos') {
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

    // Handle video streaming: check offline videos cache first, otherwise stream natively online
  if (event.request.url.includes('.mp4') || event.request.destination === 'video') {
    event.respondWith(
      caches.open('engg-prep-offline-videos').then(videoCache => {
        return videoCache.match(event.request).then(cached => {
          if (cached) return cached;
          const cleanUrl = event.request.url.split('?')[0];
          return videoCache.match(cleanUrl).then(cleanCached => {
            if (cleanCached) return cleanCached;
            return caches.match(cleanUrl).then(appCached => {
              if (appCached) return appCached;
              return fetch(event.request);
            });
          });
        });
      }).catch(() => fetch(event.request))
    );
    return;
  }

  // Network-First for HTML page navigations (e.g. login.html, index.html)
  // Ensures mobile devices and tablets immediately fetch fresh HTML when online, with offline cache fallback
  const isHtmlNav = event.request.mode === 'navigate' || 
                    event.request.destination === 'document' || 
                    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));
  if (isHtmlNav) {
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

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

// Helper: Fetch with timeout using AbortController to avoid hanging requests
function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal })
    .then(response => {
      clearTimeout(timeoutId);
      if (!response.ok && response.status !== 0) {
        throw new Error('HTTP ' + response.status);
      }
      return response;
    })
    .catch(err => {
      clearTimeout(timeoutId);
      throw err;
    });
}

// Helper: Safely cache single URL with timeout & error handling
async function cacheSingleUrl(cache, url) {
  try {
    const response = await fetchWithTimeout(url, 8000);
    await cache.put(url, response);
    return { url, success: true };
  } catch (err) {
    console.warn('[ServiceWorker] Failed to cache: ' + url, err.message);
    return { url, success: false, error: err.message };
  }
}

// Helper: Throttled download pool (concurrency control)
async function cacheUrlsInPool(cache, urls, concurrency = 4, onProgress = null) {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  const total = uniqueUrls.length;
  let completed = 0;
  let activeIndex = 0;

  async function worker() {
    while (activeIndex < uniqueUrls.length) {
      const idx = activeIndex++;
      const url = uniqueUrls[idx];
      await cacheSingleUrl(cache, url);
      completed++;
      if (typeof onProgress === 'function') {
        onProgress({
          completed,
          total,
          currentUrl: url,
          percent: Math.round((completed / total) * 100)
        });
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, uniqueUrls.length) }, () => worker());
  await Promise.all(workers);
  return { total, completed };
}

// Message Event - Allow app to trigger manual asset caching with concurrency control & progress
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_ASSETS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAME).then(async cache => {
        const port = event.ports && event.ports[0];
        const onProgress = (prog) => {
          if (port) {
            try {
              port.postMessage({ type: 'CACHE_PROGRESS', ...prog });
            } catch (e) {}
          }
        };

        const result = await cacheUrlsInPool(cache, urls, 4, onProgress);
        if (port) {
          try {
            port.postMessage({ type: 'CACHE_COMPLETE', success: true, ...result });
          } catch (e) {}
        }
      })
    );
  }
});
