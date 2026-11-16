/* kafe-root-online-7008
   این ورکر هیچ فایلی سرو نمی‌کند و هیچ کشی نمی‌سازد.
   فقط کش‌های قبلی را پاک می‌کند، صفحه را از شبکه دوباره باز می‌کند و خودش حذف می‌شود.
   دوباره register نکنید. */
self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    } catch (e) {}
    try {
      var clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await Promise.all(clients.map(function (client) {
        try {
          var url = new URL(client.url);
          url.searchParams.set('fresh', String(Date.now()));
          return client.navigate(url.href);
        } catch (err) {
          return null;
        }
      }));
    } catch (e2) {}
    try { await self.registration.unregister(); } catch (e3) {}
  })());
});
