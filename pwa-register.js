/* pwa-register.js — فقط نابودی SW و کش. هیچ ثبت دائمی Service Worker. */
(function () {
  'use strict';
  if (window.__KAFE_PWA_ONLINE_ONLY__) return;
  window.__KAFE_PWA_ONLINE_ONLY__ = true;

  try {
    if (!document.querySelector('link[rel="manifest"]')) {
      var link = document.createElement('link');
      link.rel = 'manifest';
      link.href = './manifest.webmanifest';
      document.head.appendChild(link);
    }
  } catch (e0) {}

  function clearAllCaches() {
    if (typeof caches === 'undefined' || !caches.keys) return Promise.resolve();
    return caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        try { return caches.delete(k); } catch (e) { return null; }
      }));
    }).catch(function () {});
  }

  function unregisterAll() {
    if (!('serviceWorker' in navigator)) return Promise.resolve();
    return navigator.serviceWorker.getRegistrations().then(function (regs) {
      return Promise.all((regs || []).map(function (r) {
        try { return r.unregister(); } catch (e) { return null; }
      }));
    }).catch(function () {});
  }

  function killSwForever() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js?v=online-only-final', { scope: './' })
      .then(function (reg) {
        try {
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          if (reg.installing) reg.installing.postMessage({ type: 'SKIP_WAITING' });
          if (reg.active) reg.active.postMessage({ type: 'SKIP_WAITING' });
        } catch (e) {}
        return clearAllCaches();
      })
      .catch(function () { return clearAllCaches(); })
      .then(function () { return unregisterAll(); })
      .then(function () { return clearAllCaches(); })
      .catch(function () {});
  }

  killSwForever();
  setTimeout(killSwForever, 2000);
  setTimeout(function () { unregisterAll().then(clearAllCaches); }, 5000);
})();
