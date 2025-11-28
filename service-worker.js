// Define the cache name and the list of core assets to cache
const CACHE_NAME = 'inventory-pwa-local-v1'; // Changed cache name
const urlsToCache = [
  './local_inventory_final.html', // Updated HTML filename
  '/', // Alias for the main page
  'https://cdn.tailwindcss.com', // Tailwind CDN
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' // Font CSS
  // Firebase SDKs removed as they are no longer used
];

// --- Install Event ---
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// --- Fetch Event (Serving Assets) ---
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // No match in cache - fetch from network
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once.
            var responseToCache = response.clone();

            // Cache the new resource if it's not a storage endpoint
            if (urlsToCache.some(url => event.request.url.includes(url))) {
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
            }
            return response;
          }
        );
      })
  );
});

// --- Activate Event (Cleanup Old Caches) ---
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

