/* کافه سرکتاب میعاد — Service Worker
   هدف: نصب‌پذیری PWA + کش محدود برای فایل‌های استاتیک
   API/Supabase عمداً Network-First است تا داده آنلاین خراب نشود.
*/
const CACHE_VERSION = 'kafe-miad-v22.16-dalil-lightbox-pwa-icon';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;

/* فایل‌هایی که بعد از نصب در کش می‌مانند (در صورت وجود روی سرور) */
const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './main.js', './tools-extra.js',
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

/* آیکون میانبر: اگر مدیر از پنل آپلود کرده باشد، از Storage خوانده می‌شود. */
const PWA_ICON_BASE =
  'https://evxxvnlwtbaqpjbjaxdk.supabase.co/storage/v1/object/public/public-assets/app-media/pwa/';
const PWA_ICON_FILES = {
  'icon192.png': 'icon-192.png',
  'icon512.png': 'icon-512.png',
  'icon512-maskable.png': 'icon-maskable-512.png',
  'apple-touch-icon.png': 'apple-touch-icon.png',
  'favicon.png': 'favicon.png'
};

let iconVersionPromise = null;

function pwaIconFile(url) {
  try {
    const name = new URL(url).pathname.split('/').pop();
    return PWA_ICON_FILES[name] ? name : '';
  } catch (e) {
    return '';
  }
}

function isManifestRequest(url) {
  try {
    return new URL(url).pathname.endsWith('manifest.webmanifest');
  } catch (e) {
    return false;
  }
}

function loadIconVersion() {
  if (!iconVersionPromise) {
    iconVersionPromise = fetch(PWA_ICON_BASE + 'version.txt?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => (res.ok ? res.text() : ''))
      .then((text) => {
        const v = String(text || '').trim();
        if (!/^\d+$/.test(v)) {
          iconVersionPromise = null;
          return null;
        }
        return { v: v };
      })
      .catch(() => {
        iconVersionPromise = null;
        return null;
      });
  }
  return iconVersionPromise;
}

async function fetchCloudIcon(fileName, version) {
  const remoteName = PWA_ICON_FILES[fileName];
  if (!remoteName || !version) return null;
  const remote = PWA_ICON_BASE + remoteName + '?v=' + encodeURIComponent(version);
  const res = await fetch(remote, { cache: 'no-store' });
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('content-type') || 'image/png',
      'Cache-Control': 'no-cache'
    }
  });
}

async function handlePwaShell(req, iconFile) {
  const versionInfo = await loadIconVersion();
  const version = versionInfo && versionInfo.v;
  if (iconFile && version) {
    try {
      const cloud = await fetchCloudIcon(iconFile, version);
      if (cloud) return cloud;
    } catch (e) {}
  }
  if (!iconFile && version) {
    try {
      const res = await fetch(req, { cache: 'no-store' });
      const json = await res.json();
      json.icons = (json.icons || []).map((icon) => {
        const file = String(icon.src || '').split('/').pop().split('?')[0];
        const remoteName = PWA_ICON_FILES[file];
        if (!remoteName) return icon;
        return Object.assign({}, icon, {
          src: PWA_ICON_BASE + remoteName + '?v=' + encodeURIComponent(version),
          type: 'image/png'
        });
      });
      return new Response(JSON.stringify(json), {
        headers: {
          'Content-Type': 'application/manifest+json; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (e) {}
  }
  try {
    return await fetch(req);
  } catch (e) {
    const cached = await caches.match(req);
    return cached || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;
  const iconFile = pwaIconFile(url);
  if (iconFile || isManifestRequest(url)) {
    event.respondWith(handlePwaShell(req, iconFile));
    return;
  }

  /* Supabase / API: همیشه شبکه — بدون دخالت کش */
  if (isSupabaseOrApi(url)) {
    event.respondWith(fetch(req));
    return;
  }

  /* JavaScript: Network-First تا نسخه قدیمی کد ورود بعد از انتشار اجرا نشود.
     در قطع شبکه، آخرین نسخه کش‌شده همچنان fallback است. */
  if (/\\.js$/i.test(new URL(url).pathname)) {
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

  /* سایر فایل‌های استاتیک: Cache-First با به‌روزرسانی در پس‌زمینه */
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
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
  if (event.data && event.data.type === 'PWA_ICON_UPDATED' && event.data.v) {
    iconVersionPromise = Promise.resolve({ v: event.data.v });
  }
});
