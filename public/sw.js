const CACHE_NAME = 'talib-club-cache-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Pre-caching failed during installation, continuing...', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (for offline support & PWA install requirements)
self.addEventListener('fetch', (e) => {
  // Let browser handle non-GET and cross-origin requests normally
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  const url = new URL(e.request.url);
  // Skip dev files, built assets, APIs, and auth endpoints from caching
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/__/auth/') ||
    e.request.url.includes('/@vite') ||
    e.request.url.includes('/node_modules/')
  ) {
    return;
  }

  const isHtmlRequest = e.request.mode === 'navigate' || (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html'));

  if (isHtmlRequest) {
    // Network-First for HTML to prevent Stale-While-Revalidate from serving an old index.html
    // that points to deleted JS/CSS chunks (which causes a white screen on first load).
    e.respondWith(
      fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(e.request).then(cachedResponse => {
          return cachedResponse || caches.match('/');
        });
      })
    );
  } else {
    // Stale-While-Revalidate for other static assets (images, fonts, etc.)
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch fresh copy in background to update cache
          fetch(e.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, networkResponse);
              });
            }
          }).catch(() => {/* Ignore network errors during background update */});
          return cachedResponse;
        }
        
        return fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch((err) => {
          throw err;
        });
      })
    );
  }
});

// Push Event
self.addEventListener('push', (e) => {
  let data = { title: 'Talib Club', body: 'มีการแจ้งเตือนใหม่' };
  if (e.data) {
    try {
      data = e.data.json();
    } catch (err) {
      data = { title: 'Talib Club', body: e.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  
  let targetUrl = '/';
  if (e.notification.data && e.notification.data.url) {
    targetUrl = e.notification.data.url;
  }

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, navigate/focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const clientPath = new URL(client.url).pathname + new URL(client.url).search;
        if (clientPath === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
