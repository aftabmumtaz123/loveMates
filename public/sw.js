const CACHE = 'couplenest-v6';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['/', '/couplenest-heart.svg', '/manifest.webmanifest'])
    )
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
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
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
