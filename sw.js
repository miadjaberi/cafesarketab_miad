/* کافه سرکتاب میعاد — Service Worker
   آیکون نصب فقط از سوپابیس خوانده می‌شود، نه از icon192.png گیت‌هاب. */
const CACHE_VERSION = 'kafe-miad-v22.57-supabase-icon';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const PACK = 'https://evxxvnlwtbaqpjbjaxdk.supabase.co/storage/v1/object/public/public-assets/app-media/pwa/';

const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './main.js', './brand-public-fix.js', './tools-extra.js',
  './dalil-images-fix.js',
  './app.js',
  './pwa-register.js',
  './ui-layer-fix.js',
  './theme-atelier.css',
  './assets/splash.jpg',
  './theme-lock.css',
  './fonts/vazirmatn.css',
  './fonts/Vazirmatn-wght.woff2',
  './manifest.webmanifest'
];

const LOCAL_ICON = {
  'icon192.png': 'icon-192.png',
  'icon512.png': 'icon-512.png',
  'icon512-maskable.png': 'icon-maskable-512.png',
  'apple-touch-icon.png': 'apple-touch-icon.png',
  'favicon.png': 'favicon.png'
};

let overrideIconUrl = '';

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

function fileName(url) {
  try {
    const path = new URL(url).pathname;
    return path.slice(path.lastIndexOf('/') + 1);
  } catch (e) {
    return '';
  }
}

async function readOverride() {
  if (overrideIconUrl && overrideIconUrl.indexOf('https://') === 0) return overrideIconUrl;
  try {
    const cache = await caches.open(SHELL_CACHE);
    const hit = await cache.match('pwa-icon-override');
    if (hit) {
      const text = ((await hit.text()) || '').trim();
      if (text.indexOf('https://') === 0) overrideIconUrl = text;
    }
  } catch (e) {}
  return overrideIconUrl;
}

async function versionQuery() {
  try {
    const res = await fetch(PACK + 'version.txt?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return '';
    const text = ((await res.text()) || '').trim();
    return /^\d+$/.test(text) ? ('?v=' + encodeURIComponent(text)) : '';
  } catch (e) {
    return '';
  }
}

async function manifestResponse() {
  const q = await versionQuery();
  const over = await readOverride();
  const icon192 = q ? (PACK + 'icon-192.png' + q) : (over || (PACK + 'icon-192.png'));
  const icon512 = q ? (PACK + 'icon-512.png' + q) : (over || (PACK + 'icon-512.png'));
  const mask = q ? (PACK + 'icon-maskable-512.png' + q) : (over || (PACK + 'icon-maskable-512.png'));
  const body = {
    id: '/',
    name: 'کافه سرکتاب میعاد',
    short_name: 'کافه میعاد',
    description: 'آموزش، محتوا و فروش محصولات کافه سرکتاب میعاد',
    lang: 'fa',
    dir: 'rtl',
    start_url: './index.html',
    scope: './',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#070B14',
    theme_color: '#070B14',
    categories: ['education', 'shopping', 'lifestyle'],
    icons: [
      { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: mask, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  const name = fileName(url);

  if (name === 'manifest.webmanifest') {
    event.respondWith(manifestResponse());
    return;
  }

  if (LOCAL_ICON[name]) {
    event.respondWith((async () => {
      const q = await versionQuery();
      const over = await readOverride();
      const target = q ? (PACK + LOCAL_ICON[name] + q) : (over || (PACK + LOCAL_ICON[name]));
      return fetch(target, { cache: 'no-store' });
    })());
    return;
  }

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

function isStaticAsset(url) {
  try {
    const u = new URL(url);
    return /\.(?:css|js|png|jpg|jpeg|webp|svg|woff2?|ttf|ico|webmanifest)$/i.test(u.pathname);
  } catch (e) {
    return false;
  }
}

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'PWA_ICON_URL' && typeof data.url === 'string' && data.url.indexOf('https://') === 0) {
    overrideIconUrl = data.url;
    caches.open(SHELL_CACHE).then((cache) => {
      cache.put('pwa-icon-override', new Response(data.url, { headers: { 'Content-Type': 'text/plain' } }));
    }).catch(() => {});
  }
  if (data.type === 'PWA_ICON_UPDATED') {
    overrideIconUrl = '';
    caches.open(SHELL_CACHE).then((cache) => cache.delete('pwa-icon-override')).catch(() => {});
  }
});
