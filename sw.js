/* Service Worker — کافه سرکتاب میعاد
   نسخه کش: با هر تغییر مهم PRECACHE، CACHE_NAME را عوض کنید (مثلا v22.84).
*/
var CACHE_NAME = 'kafe-miad-v22.78-buy-v10';
var PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './theme-atelier.css',
  './theme-lock.css',
  './field-pattern.css',
  './main.js',
  './data.js',
  './app.js',
  './tools-extra.js',
  './pwa-register.js',
  './pwa-icon-dynamic.js',
  './dalil-images-fix.js',
  './ui-layer-fix.js',
  './boot-flow-fix.js',
  './product-modal-safe-fix.js',
  './icon192.png',
  './icon512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE).catch(function () { return null; });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_NAME) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = event.request.url;
  if (url.indexOf('supabase.co') !== -1) return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var net = fetch(event.request).then(function (res) {
        try {
          if (res && res.ok && (url.indexOf(self.location.origin) === 0)) {
            var copy = res.clone();
            caches.open(CACHE_NAME).then(function (c) { c.put(event.request, copy); });
          }
        } catch (e) {}
        return res;
      }).catch(function () { return cached || Response.error(); });
      return cached || net;
    })
  );
});
