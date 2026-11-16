/* sw.js — kill-switch: نابودی کش آفلاین v22 و توقف کامل Service Worker
 * هدف: دیگر هیچ شِل قدیمی از کش سرو نشود؛ فقط شبکه.
 */
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }).then(function () {
      return self.clients.claim();
    }).then(function () {
      return self.registration.unregister();
    }).then(function () {
      return self.clients.matchAll({ type: 'window' });
    }).then(function (clients) {
      clients.forEach(function (c) {
        try {
          if (c && c.navigate) c.navigate(c.url);
        } catch (e) {}
      });
    }).catch(function () {})
  );
});

/* هیچ پاسخی از کش نده — فقط شبکه */
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).catch(function () {
      return new Response('Offline — کش آفلاین غیرفعال است', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
