// Service Worker for Energy Playbook
// Handles notifications and offline functionality

const CACHE_NAME = 'energy-playbook-v5';
const STATIC_CACHE = 'energy-static-v5';
const DYNAMIC_CACHE = 'energy-dynamic-v5';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      // Clear all old caches first
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Create new caches
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll([
          '/'
        ]).catch((error) => {
          console.log('Some files failed to cache:', error);
          // Kontynuuj nawet jeśli niektóre pliki się nie powiodły
        });
      })
    ]).then(() => {
      console.log('Service Worker installed');
      return self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ALL old caches (force fresh start)
          if (!cacheName.includes('v5')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated - all old caches cleared');
      return self.clients.claim();
    })
  );
});

// Fetch event - smarter caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip API calls - always fetch from network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // For assets, use cache-first strategy
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((fetchResponse) => {
          // Don't cache if not successful
          if (!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }
          // Cache successful responses
          const responseClone = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
    return;
  }
  
  // For HTML pages, use network-first strategy
  event.respondWith(
    fetch(request).then((response) => {
      // Don't cache if not successful
      if (!response || response.status !== 200) {
        return response;
      }
      // Cache successful responses
      const responseClone = response.clone();
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
      return response;
    }).catch(() => {
      // If network fails, try cache
      return caches.match(request);
    })
  );
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'energy-notification') {
    event.waitUntil(handleNotificationSync());
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle notification sync
async function handleNotificationSync() {
  // This would handle sending notifications when the app is in background
  console.log('Notification sync triggered');
}
