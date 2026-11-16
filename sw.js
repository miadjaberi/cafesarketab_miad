/* sw.js — دائم خاموش. هیچ کش، هیچ آفلاین، هیچ شِل.
 * اگر مرورگری هنوز SW قدیمی دارد، با فعال شدن این فایل همه کش‌ها پاک و خودش unregister می‌شود.
 */
self.addEventListener('install', function (e) {
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
     .then(function () { return self.registration.unregister(); })
     .catch(function () {})
  );
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-store' }));
});
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
