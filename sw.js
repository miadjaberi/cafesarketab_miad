/* کافه سرکتاب میعاد — Service Worker */
const CACHE_VERSION = 'kafe-miad-v22.17-public-brand-bust';
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
  './theme-atelier.css',
  './assets/splash.jpg',
  './theme-lock.css',
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

function isSupabaseOrApi(url) {
  try {
    const u = new URL(url);
    return (
      u.hostname.includes('supabase.co') ||
      u.hostname.includes('supabase.in') ||
      u.hostname.includes('api.quran.com') ||
      u.pathname.includes('/rest/v1/') ||
      u.pathname.includes('/auth/v1/') ||
      u.pathname.includes('/storage/v1/') ||
      u.pathname.includes('/realtime/v1/')
    );
  } catch (e) {
    return false;
  }
}

function isStaticAsset(url) {
  try {
    const u = new URL(url);
    return /\.(?:css|js|png|jpg|jpeg|webp|svg|woff2?|ttf|ico|webmanifest)$/i.test(u.pathname);
  } catch (e) {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  if (isSupabaseOrApi(url)) {
    event.respondWith(fetch(req));
    return;
  }
  if (/\.js$/i.test(new URL(url).pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const net = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || net;
      })
    );
    return;
  }
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((c) => c || caches.match('./index.html'))
      )
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
