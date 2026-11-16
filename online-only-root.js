/* online-only-root.js — ریشه: فقط آنلاین، بدون ذخیره آفلاین مرورگر برای داده اپ */
(function () {
  'use strict';
  if (window.__KAFE_ONLINE_ONLY_ROOT__) return;
  window.__KAFE_ONLINE_ONLY_ROOT__ = true;

  window.kafeIsOffline = function () { return false; };
  window.enterAppForLocalModals = function () {
    if (typeof showNotification === 'function') {
      showNotification('برنامه فقط آنلاین است؛ اتصال اینترنت لازم است', 'error');
    }
    return false;
  };

  function hideOfflineUi() {
    try {
      var ids = ['offlineBanner', 'offlineNoteSection'];
      ids.forEach(function (id) {
        var n = document.getElementById(id);
        if (n) { n.style.display = 'none'; n.setAttribute('aria-hidden', 'true'); n.innerHTML = ''; }
      });
      document.querySelectorAll('[data-offline], .offline-only').forEach(function (n) {
        n.style.display = 'none';
      });
    } catch (e) {}
  }

  var OFFLINE_KEYS = [
    'kafeVipOfflineCache',
    'kafeVipPendingNoticeShown',
    'cafeProducts',
    'mokashefeData',
    'kafeDoagoContent',
    'kafeProductPriceMeta',
    'discountSettings',
    'cafeOrders',
    'cafeCart',
    'adminSubscriptions',
    'kafe_pay_contact'
  ];

  function purgeOfflineKeys() {
    try {
      OFFLINE_KEYS.forEach(function (k) {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var key = localStorage.key(i);
        if (!key) continue;
        if (key.indexOf('kafeVipOfflineCache') === 0 || key.indexOf('quranOffline') === 0 || key.indexOf('shell-kafe') === 0) {
          try { localStorage.removeItem(key); } catch (e2) {}
        }
      }
    } catch (e3) {}
  }

  function killSw() {
    try {
      if (!('serviceWorker' in navigator)) return;
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        (regs || []).forEach(function (r) { try { r.unregister(); } catch (e) {} });
      }).catch(function () {});
      if (window.caches && caches.keys) {
        caches.keys().then(function (keys) {
          keys.forEach(function (k) { try { caches.delete(k); } catch (e) {} });
        }).catch(function () {});
      }
    } catch (e) {}
  }

  window.quranDownloadAll = function () {
    if (typeof showNotification === 'function') {
      showNotification('ذخیره آفلاین قرآن غیرفعال است؛ فقط آنلاین', 'error');
    }
  };

  hideOfflineUi();
  purgeOfflineKeys();
  killSw();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      hideOfflineUi();
      purgeOfflineKeys();
      killSw();
    });
  }
  setTimeout(hideOfflineUi, 500);
  setTimeout(killSw, 1500);
  setTimeout(purgeOfflineKeys, 2000);

  window.addEventListener('offline', function () {
    try { document.body.classList.remove('is-offline'); } catch (e) {}
    if (typeof showNotification === 'function') {
      showNotification('اتصال اینترنت قطع است؛ برنامه فقط آنلاین کار می‌کند', 'error');
    }
  });
})();
