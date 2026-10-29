/* ثبت Service Worker + لینک Manifest + الگوی فیلدها */
(function () {
  'use strict';

  if (!document.querySelector('link[rel="manifest"]')) {
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = './manifest.webmanifest';
    document.head.appendChild(link);
  }

  /* الگوی یکدست فیلد شیری + متن تیره */
  if (!document.querySelector('link[href*="field-pattern.css"]')) {
    var fp = document.createElement('link');
    fp.rel = 'stylesheet';
    fp.href = './field-pattern.css';
    document.head.appendChild(fp);
  }

  if (!document.querySelector('script[src*="brand-public-fix.js"]')) {
    var brand = document.createElement('script');
    brand.src = './brand-public-fix.js';
    brand.async = true;
    document.head.appendChild(brand);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .then(function (reg) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          reg.addEventListener('updatefound', function () {
            var nw = reg.installing;
            if (!nw) return;
            nw.addEventListener('statechange', function () {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('ℹ️ نسخه جدید PWA آماده است');
              }
            });
          });
        })
        .catch(function (err) {
          console.warn('Service Worker ثبت نشد:', err);
        });

      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        refreshing = true;
        try { window.location.reload(); } catch (e) {}
      });
    });
  }
})();
