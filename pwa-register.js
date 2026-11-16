/* pwa-register.js — ریشه V700.8
   هیچ Service Worker ثبت نمی‌شود.
   فقط ثبت‌های قبلی و کش مرورگر پاک می‌شوند. */
(function () {
  'use strict';
  if (window.__KAFE_PWA_REGISTER_ROOT_7008__) return;
  window.__KAFE_PWA_REGISTER_ROOT_7008__ = true;

  function clearCaches() {
    if (typeof caches === 'undefined' || !caches.keys) return Promise.resolve();
    return caches.keys().then(function (keys) {
      return Promise.all((keys || []).map(function (k) {
        try { return caches.delete(k); } catch (e) { return null; }
      }));
    }).catch(function () {});
  }

  function unregisterAll() {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.getRegistrations) return Promise.resolve();
    return navigator.serviceWorker.getRegistrations().then(function (regs) {
      return Promise.all((regs || []).map(function (r) {
        try { return r.unregister(); } catch (e) { return null; }
      }));
    }).catch(function () {});
  }

  if (typeof window.__kafeWipeDeviceData === 'function') {
    try { window.__kafeWipeDeviceData(); } catch (e) {}
  }
  unregisterAll().then(clearCaches);
  window.addEventListener('pageshow', function () {
    unregisterAll().then(clearCaches);
  });
})();
