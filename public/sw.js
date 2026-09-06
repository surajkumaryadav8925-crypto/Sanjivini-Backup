// Service Worker for ArogyaSetu PWA
const CACHE_NAME = 'arogya-v1';
const STATIC_ASSETS = [
  '/',
  '/patient/dashboard',
  '/hospital/dashboard',
  '/admin/dashboard',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-operations') {
    event.waitUntil(syncOfflineOperations());
  }
});

async function syncOfflineOperations() {
  // This will be handled by the SyncManager in the app
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_REQUESTED' });
  });
}
