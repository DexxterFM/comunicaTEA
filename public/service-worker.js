const CACHE_NAME = 'teajudando-pwa-v1';
const BASE_URL = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const appPath = (path) => `${BASE_URL}${path}`;

const APP_SHELL = [
  appPath('/'),
  appPath('/index.html'),
  appPath('/manifest.json'),
  appPath('/icons/icon-192.png'),
  appPath('/icons/icon-512.png'),
  appPath('/pwa_icon.png'),
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key === CACHE_NAME ? undefined : caches.delete(key))))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const apiBase = appPath('/api');
  if (requestUrl.pathname.startsWith(apiBase) || requestUrl.pathname.startsWith('/api')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(appPath('/'), copy));
          return response;
        })
        .catch(() => caches.match(appPath('/')) || caches.match(appPath('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(appPath('/')));
    })
  );
});
