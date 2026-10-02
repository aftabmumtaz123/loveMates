const CACHE = 'couplenest-v7';
const PRECACHE = ['/', '/couplenest-heart.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // Never let a transient 403/5xx from the hosting provider prevent the
      // service worker from installing. Only successful responses are cached.
      await Promise.all(PRECACHE.map(async (url) => {
        try {
          const response = await fetch(new Request(url, { cache: 'no-store' }));
          if (response.ok) await cache.put(url, response.clone());
        } catch {
          // The app can still install and retry the resource on the next fetch.
        }
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (
    event.request.method !== 'GET' ||
    new URL(event.request.url).pathname.startsWith('/api/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Never cache errors/challenges. This prevents a temporary Vercel 403
        // from becoming a persistent cached response for the user.
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((response) => response || caches.match('/')))
  );
});

self.addEventListener('push', (event) => {
  const fallback = {
    title: 'CoupleNest',
    body: 'Something new is waiting in your little world ♥',
    url: '/notifications',
  };

  let data = fallback;

  if (event.data) {
    try {
      data = { ...fallback, ...event.data.json() };
    } catch {
      data = { ...fallback, body: event.data.text() };
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/couplenest-heart.svg',
      badge: '/couplenest-heart.svg',
      data: { url: data.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const target = event.notification.data?.url || '/';

      for (const client of clients) {
        if ('focus' in client) {
          try {
            client.navigate(target);
          } catch {
            // Ignore navigation errors and still focus the client.
          }
          return client.focus();
        }
      }

      return self.clients.openWindow(target);
    })
  );
});
