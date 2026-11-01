/* کافه سرکتاب میعاد — Service Worker */
const CACHE_VERSION = 'kafe-miad-v22.27-hamzad-ui2';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './main.js', './brand-public-fix.js', './tools-extra.js',
  './dalil-images-fix.js',
  './pwa-icon-dynamic.js',
  './app.js',
  './pwa-register.js',
  './ui-layer-fix.js',
  './fix-four-bugs.js',
  './hamzad-ui-fix.js',
  './theme-atelier.css',
  './assets/splash.jpg',
  './theme-lock.css',
  './fonts/vazirmatn.css',
  './fonts/Vazirmatn-wght.woff2',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('shell-') && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
