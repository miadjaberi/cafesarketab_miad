/* کافه سرکتاب میعاد — نسخهٔ پوستهٔ استاتیک.
   داده‌های سوپابیس کش نمی‌شوند؛ عملیات خرید و حساب باید با تأیید سرور انجام شوند. */
const CACHE_VERSION = 'kafe-miad-v700.7-modal-ux-1';
const SHELL_CACHE = 'shell-' + CACHE_VERSION;

const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './main.js',
  './tools-extra.js',
  './app.js',
  './pwa-register.js',
  './ui-layer-fix.js',
  './ops-alerts.js',
  './ops-center.js',
  './session-recovery.js',
  './registration-recovery.js',
  './admin-entry-guard.js',
  './all-modal-ux.js',
  './offline-sync.js',
  './theme-atelier.css',
  './theme-lock.css',
  './button-feedback.css',
  './assets/splash.jpg',
  './manifest.webmanifest',
  './icon-miad.svg',
  './icon192.png',
  './icon512.png',
  './icon512-maskable.png',
  './apple-touch-icon.png',
  './favicon.png'
];

const CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css',
  'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.all(PRECACHE_URLS.map(async (u) => {
      try {
        const res = await fetch(u, { cache: 'no-cache' });
        if (res && res.ok) await cache.put(u, res);
      } catch (e) {}
    }));
    await Promise.all(CDN_URLS.map(async (u) => {
      try {
        const res = await fetch(u, { mode: 'no-cors', cache: 'no-cache' });
        if (res) await cache.put(u, res);
      } catch (e) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    const ready = await cache.match('./index.html');
    if (ready) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('shell-') && k !== SHELL_CACHE).map((k) => caches.delete(k)));
    }
    await self.clients.claim();
  })());
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

function isAppHost(url) {
  try {
    const u = new URL(url);
    return u.hostname === 'cdn.jsdelivr.net' || u.hostname === 'cdnjs.cloudflare.com' || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
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

async function cacheFirst(req, fallbacks) {
  const cache = await caches.open(SHELL_CACHE);
  let cached = await cache.match(req, { ignoreSearch: true });
  if (!cached && fallbacks) {
    for (const item of fallbacks) {
      cached = await cache.match(item);
      if (cached) break;
    }
  }
  const update = fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {});
    return res;
  }).catch(() => cached);
  if (cached) return cached;
  return Promise.race([
    update,
    new Promise((resolve) => setTimeout(() => resolve(cached || null), 4000))
  ]).then((res) => res || update);
}

// Navigation must prefer the live deployment. Cache-first HTML can keep an
// old loader/app visible after a release while the background update silently
// downloads a different version. Fall back to cached HTML only when offline.
async function networkFirstNavigation(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(req, { cache: 'no-store' });
    if (res && res.ok) {
      await cache.put(req, res.clone()).catch(() => {});
      await cache.put(new URL('./index.html', self.registration.scope).toString(), res.clone()).catch(() => {});
      return res;
    }
    throw new Error('navigation_http_' + (res ? res.status : 'empty'));
  } catch (e) {
    const cached = await cache.match(req, { ignoreSearch: true })
      || await cache.match(new URL('./index.html', self.registration.scope).toString())
      || await cache.match(new URL('./', self.registration.scope).toString());
    if (cached) return cached;
    throw e;
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  if (isSupabaseOrApi(url)) return;

  if (req.mode === 'navigate' || ((req.headers.get('accept') || '').includes('text/html') && !isAppHost(url))) {
    event.respondWith(networkFirstNavigation(req));
    return;
  }
  if (isStaticAsset(url) || isAppHost(url)) {
    event.respondWith(cacheFirst(req));
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
