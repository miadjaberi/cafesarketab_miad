/* کافه سرکتاب میعاد — PWA رسانه‌ها و Service Worker؛ بنر نصب سفارشی غیرفعال است */
(function () {
  'use strict';

  /* ---------- Manifest ---------- */
  if (!document.querySelector('link[rel="manifest"]')) {
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = './manifest.webmanifest';
    document.head.appendChild(link);
  }

  /* ---------- بارگذاری بازخورد لمس دکمه‌ها ---------- */
  if (!document.querySelector('link[href*="button-feedback"]')) {
    var fb = document.createElement('link');
    fb.rel = 'stylesheet';
    fb.href = './button-feedback.css';
    document.head.appendChild(fb);
  }

/* ---------- ایجاد بنر نصب ---------- */
  /* بنر نصب سفارشی حذف شده؛ همگام‌سازی رسانه‌های PWA مستقل ادامه دارد. */
  /* ---------- همگام‌سازی امن تصاویر PWA از تنظیمات سرور ---------- */
  var lastMediaSyncAt = 0;
  var MEDIA_PROJECT_URL = 'https://evxxvnlwtbaqpjbjaxdk.supabase.co';
  var MEDIA_PUBLIC_KEY = 'sb_publishable_yqampnRU4wIzRn-3ENi81g_ojYSM4le';
  var PUBLIC_MEDIA_RE = /^https:\/\/evxxvnlwtbaqpjbjaxdk\.supabase\.co\/storage\/v1\/object\/public\/public-assets\/app-media\/[A-Za-z0-9._-]+$/i;

  function isPublicAppMediaUrl(value) {
    return typeof value === 'string' && PUBLIC_MEDIA_RE.test(value);
  }

  function applyLiveAppBackground(url) {
    if (!isPublicAppMediaUrl(url)) return;
    var cssUrl = 'url("' + url + '")';
    try {
      document.documentElement.style.setProperty('--app-user-bg', cssUrl);
      document.body.style.setProperty('background-image', cssUrl, 'important');
      document.body.style.setProperty('background-size', 'cover', 'important');
      document.body.style.setProperty('background-attachment', 'fixed', 'important');
      document.body.style.setProperty('background-position', 'center', 'important');
      var app = document.getElementById('app');
      if (app) {
        app.style.setProperty('background-image', cssUrl, 'important');
        app.style.setProperty('background-size', 'cover', 'important');
        app.style.setProperty('background-position', 'center', 'important');
      }
      // Cache only the public image URL; never copy payment fields or the full row.
      try {
        var settings = JSON.parse(localStorage.getItem('cafeSettings') || '{}');
        settings.appBg = url;
        localStorage.setItem('cafeSettings', JSON.stringify(settings));
      } catch (e) {}
    } catch (e) {
      console.warn('Could not apply live PWA background', e);
    }
  }

  function clearLiveAppBackground() {
    try {
      document.documentElement.style.removeProperty('--app-user-bg');
      document.body.style.removeProperty('background-image');
      document.body.style.removeProperty('background-size');
      document.body.style.removeProperty('background-attachment');
      document.body.style.removeProperty('background-position');
      var app = document.getElementById('app');
      if (app) {
        app.style.removeProperty('background-image');
        app.style.removeProperty('background-size');
        app.style.removeProperty('background-position');
      }
      try {
        var settings = JSON.parse(localStorage.getItem('cafeSettings') || '{}');
        delete settings.appBg;
        localStorage.setItem('cafeSettings', JSON.stringify(settings));
      } catch (e) {}
    } catch (e) {
      console.warn('Could not clear removed PWA background', e);
    }
  }

  function clearLiveAppIcon() {
    try {
      localStorage.removeItem('cafeAppIcon');
      var settings = JSON.parse(localStorage.getItem('cafeSettings') || '{}');
      delete settings.appIcon;
      localStorage.setItem('cafeSettings', JSON.stringify(settings));
    } catch (e) {}
    var fallback = './icon-miad.svg?v=20261017-dynamic-icon-1';
    document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"],link[rel="shortcut icon"]').forEach(function (link) {
      link.href = fallback;
      if (link.rel === 'icon' || link.rel === 'shortcut icon') link.type = 'image/svg+xml';
    });
    var manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.href = MEDIA_PROJECT_URL + '/functions/v1/app-manifest?v=20261017-dynamic-icon-1&t=' + Date.now();
    }
  }

  async function syncLivePwaMedia(force) {
    var now = Date.now();
    if (!force && now - lastMediaSyncAt < 15000) return;
    lastMediaSyncAt = now;
    try {
      var endpoint = new URL(MEDIA_PROJECT_URL + '/rest/v1/app_settings');
      // JSON-path projection returns only the two public media URLs, not the full settings value.
      endpoint.searchParams.set('select', 'appBg:value->>appBg,appIcon:value->>appIcon,appIcon192:value->>appIcon192,appIcon512:value->>appIcon512');
      endpoint.searchParams.set('key', 'eq.admin:cafeSettings');
      endpoint.searchParams.set('limit', '1');
      var response = await fetch(endpoint.toString(), {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'apikey': MEDIA_PUBLIC_KEY,
          'Authorization': 'Bearer ' + MEDIA_PUBLIC_KEY,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('media_settings_http_' + response.status);
      var rows = await response.json();
      var media = rows && rows[0] ? rows[0] : null;
      if (!media) return;

      if (isPublicAppMediaUrl(media.appBg)) {
        applyLiveAppBackground(media.appBg);
      } else {
        // An empty server value means the administrator removed the custom background.
        clearLiveAppBackground();
      }
      if (isPublicAppMediaUrl(media.appIcon)) {
        // Reuse the app's existing icon updater and manifest cache-buster.
        if (typeof window.applyAppIcon === 'function') {
          window.applyAppIcon(media.appIcon);
        } else {
          document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"],link[rel="shortcut icon"]').forEach(function (link) {
            link.href = media.appIcon;
          });
          if (typeof window.syncKafeInstallIcon === 'function') window.syncKafeInstallIcon();
        }
      } else {
        clearLiveAppIcon();
      }
    } catch (e) {
      // Never block startup or overwrite the last-known appearance on a network failure.
      console.warn('Live PWA media sync skipped; keeping last-known appearance.', e);
    }
  }

  syncLivePwaMedia(true);
  window.addEventListener('pageshow', function () { syncLivePwaMedia(false); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') syncLivePwaMedia(false);
  });

  /* بنر نصب سفارشی عمداً نمایش داده نمی‌شود. */

  /* ---------- Service Worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('./sw.js?v=20261017-dynamic-icon-1', { scope: './' })
        .then(function (reg) {
          if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            console.log('✅ Service Worker ثبت شد', reg.scope);
          }
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
    });
  }
})();
