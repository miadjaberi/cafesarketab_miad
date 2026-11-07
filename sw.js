/* کافه سرکتاب میعاد — Service Worker */
const CACHE_VERSION = 'kafe-miad-v22.80-stable-20261107b';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './main.js',
  './brand-public-fix.js',
  './tools-extra.js',
  './dalil-images-fix.js',
  './pwa-icon-dynamic.js',
  './app.js',
  './vip-offline-cache.js?v=20261107a',
  './pwa-register.js',
  './ui-layer-fix.js',
  './boot-flow-fix.js?v=20261107a',
  './nav-swipe-fix.js?v=20261106e',
  './buy-nav-fix.js?v=20261106e',
  './final-nav-fix.js?v=20261106e',
  './kafe-seven-fixes.js?v=20261106e',
  './fix-four-bugs.js?v=20261106e',
  './hamzad-ui-fix.js?v=20261106e',
  './modal-menu-layout.js?v=20261106e',
  './modal-ui-theme.js?v=20261106e',
  './modal-guide-size-fix.js?v=20261106e',
  './rename-raml.js?v=20261106e',
  './ui-unify-v1.js?v=20261106e',
  './admin-ui-four-fixes.js?v=20261106e',
  './admin-messages-session-fix.js?v=20261107a',
  './brand-public-fix.js?v=fix2',
  './ui-feedback.js?v=fix2',
  './admin-messages-fix.js?v=fix2',
  './admin-save-feedback.js?v=fix2',
  './field-pattern.css?v=22.22-fix',
  './icon192.png',
  './icon512.png',
  './favicon.png',
  './apple-touch-icon.png',
  './theme-atelier.css',
  './assets/splash.jpg',
  './theme-lock.css',
  './fonts/vazirmatn.css',
  './fonts/Vazirmatn-wght.woff2',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(PRECACHE_URLS.map((url) =>
        cache.add(new Request(url, { cache: 'reload' })).catch((error) => {
          // یک فایل اختیاریِ ناموجود نباید کل کش پوسته را از نصب بازدارد.
          console.warn('[Kafe SW] precache skipped:', url, error);
        })
      ))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('shell-') && k !== SHELL_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
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
      fetch(req, { cache: 'reload' })
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

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
