/* کافه سرکتاب میعاد — Service Worker */
const CACHE_VERSION = 'kafe-miad-v22.56-seven-fixes';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const PWA_ICON_BASE =
  'https://evxxvnlwtbaqpjbjaxdk.supabase.co/storage/v1/object/public/public-assets/app-media/pwa/';

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
  './pwa-register.js',
  './ui-layer-fix.js',
  './boot-flow-fix.js',
  './nav-swipe-fix.js',
  './buy-nav-fix.js',
  './kafe-seven-fixes.js',
  './fix-four-bugs.js',
  './hamzad-ui-fix.js',
  './modal-menu-layout.js',
  './modal-ui-theme.js',
  './rename-raml.js',
  './ui-unify-v1.js',
  './admin-ui-four-fixes.js',
  './theme-atelier.css',
  './assets/splash.jpg',
  './theme-lock.css',
  './fonts/vazirmatn.css',
  './fonts/Vazirmatn-wght.woff2',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('shell-') && k !== SHELL_CACHE).map((k) => caches.delete(k))
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

function isStaticAsset(url) {
  try {
    const u = new URL(url);
    return /\.(?:css|js|png|jpg|jpeg|webp|svg|woff2?|ttf|ico|webmanifest)$/i.test(u.pathname);
  } catch (e) {
    return false;
  }
}

/** آیکون‌های نصب: same-origin در manifest، محتوا از Supabase */
function mapLocalIconToRemote(pathname) {
  if (pathname.endsWith('/icon192.png') || pathname.endsWith('icon192.png'))
    return PWA_ICON_BASE + 'icon-192.png';
  if (pathname.endsWith('/icon512.png') || pathname.endsWith('icon512.png'))
    return PWA_ICON_BASE + 'icon-512.png';
  if (pathname.endsWith('/icon512-maskable.png') || pathname.endsWith('icon512-maskable.png'))
    return PWA_ICON_BASE + 'icon-maskable-512.png';
  if (pathname.endsWith('/apple-touch-icon.png') || pathname.endsWith('apple-touch-icon.png'))
    return PWA_ICON_BASE + 'apple-touch-icon.png';
  if (pathname.endsWith('/favicon.png') || pathname.endsWith('favicon.png'))
    return PWA_ICON_BASE + 'favicon.png';
  return null;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  let u;
  try {
    u = new URL(url);
  } catch (e) {
    return;
  }

  // آیکون PWA: از پک ادمین روی Supabase سرو کن (همگام با پنل)
  const remoteIcon = mapLocalIconToRemote(u.pathname);
  if (remoteIcon) {
    event.respondWith(
      fetch(remoteIcon, { cache: 'no-store' })
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          }
          return caches.match(req).then((c) => c || fetch(req));
        })
        .catch(() => caches.match(req).then((c) => c || fetch(req)))
    );
    return;
  }

  if (isSupabaseOrApi(url)) {
    event.respondWith(fetch(req));
    return;
  }
  if (/\.js$/i.test(u.pathname)) {
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
      .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'PWA_ICON_UPDATED') {
    // پاک کردن کش آیکون‌های محلی تا نسخهٔ جدید از Supabase بیاید
    caches.open(SHELL_CACHE).then((cache) => {
      ;['./icon192.png', './icon512.png', './icon512-maskable.png', './apple-touch-icon.png', './favicon.png'].forEach(
        (p) => {
          cache.delete(p).catch(() => {});
        }
      );
    });
  }
});
