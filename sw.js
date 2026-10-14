/* کافه سرکتاب میعاد — Service Worker
   هدف: نصب‌پذیری PWA + کش محدود برای فایل‌های استاتیک
   API/Supabase عمداً Network-First است تا داده آنلاین خراب نشود.
*/
const CACHE_VERSION = 'kafe-miad-v700.7-fast2';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;

/* فایل‌هایی که بعد از نصب در کش می‌مانند (در صورت وجود روی سرور) */
const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './main.js', './tools-extra.js',
  './app.js',
  './pwa-register.js',
  './ui-layer-fix.js',
  './ops-alerts.js',
  './theme-atelier.css',
  './assets/splash.jpg',
  './theme-lock.css',
  './manifest.webmanifest',
  './icon192.png',
  './icon512.png',
  './icon512-maskable.png',
  './apple-touch-icon.png',
  './favicon.png'
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
      u.hostname.includes('alquran.cloud') ||
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

  /* Supabase / API: همیشه شبکه — بدون دخالت کش */
  if (isSupabaseOrApi(url)) {
    event.respondWith(fetch(req));
    return;
  }

  /* فایل‌های برنامه: Network-First تا نسخهٔ تازهٔ JS/CSS اولویت داشته باشد.
     در قطع اینترنت، نسخهٔ ذخیره‌شده فقط نقش پشتیبان دارد. */
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(SHELL_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          var network = fetch(req).then((res) => {
            if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
            return res;
          }).catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  /* صفحات HTML: Network-First، در خطا از کش */
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
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
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
