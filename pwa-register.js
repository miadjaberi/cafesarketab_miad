/* pwa-register.js — فقط حذف Service Worker و کش. هیچ wipe و هیچ register. */
(function () {
  'use strict';
  if (window.__KAFE_PWA_UNREGISTER_ONLY__) return;
  window.__KAFE_PWA_UNREGISTER_ONLY__ = true;
  function clearCaches() {
    if (!window.caches || !caches.keys) return Promise.resolve();
    return caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }).catch(function () {});
  }
  function unregisterAll() {
    if (!navigator.serviceWorker || !navigator.serviceWorker.getRegistrations) return Promise.resolve();
    return navigator.serviceWorker.getRegistrations().then(function (regs) {
      return Promise.all((regs || []).map(function (r) { return r.unregister(); }));
    }).catch(function () {});
  }
  unregisterAll().then(clearCaches);
})();
