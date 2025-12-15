const CACHE_NAME = 'taskearn-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install SW
self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // We only strictly require the local app shell. 
        // External CDNs will be cached dynamically (runtime) to prevent install failures.
        return cache.addAll(STATIC_ASSETS);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate SW
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tell the active service worker to take control of the page immediately
  self.clients.claim();
});

// Fetch Strategy: Stale-While-Revalidate / Dynamic Caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Calls: Network Only (Never cache Supabase data in SW)
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // 2. Static Assets & External Scripts (Tailwind, Fonts): Cache First, then Network, then Cache Put
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache Hit - Return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque') {
              return response;
            }

            // Clone the response because it's a stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Dynamically cache this request (e.g., tailwind css, fonts)
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
           // Fallback for offline if not in cache (could return a custom offline page here if needed)
           // For now, index.html is already cached via install step
        });
      })
  );
});