/**
 * pwa-icon-dynamic.js
 * آیکون نصب PWA را از پنل ادمین به Supabase Storage می‌فرستد.
 * main.js تغییر نمی‌کند. فایل‌های icon192.png / icon512.png روی گیت‌هاب لازم نیست عوض شوند.
 *
 * محدودیت پلتفرم: میانبری که از قبل روی صفحهٔ گوشی نصب شده،
 * روی iOS اصلاً و روی اغلب اندروید‌ها عملاً تا حذف و افزودن دوباره عوض نمی‌شود.
 * نصب‌های جدید بعد از ذخیره، آیکون پنل را می‌گیرند.
 */
(function () {
  'use strict';

  var BASE =
    'https://evxxvnlwtbaqpjbjaxdk.supabase.co/storage/v1/object/public/public-assets/app-media/pwa/';
  var SPECS = [
    { file: 'icon-192.png', size: 192, mode: 'cover' },
    { file: 'icon-512.png', size: 512, mode: 'cover' },
    { file: 'icon-maskable-512.png', size: 512, mode: 'maskable' },
    { file: 'apple-touch-icon.png', size: 180, mode: 'cover' },
    { file: 'favicon.png', size: 128, mode: 'cover' }
  ];

  function notify(msg, kind) {
    if (typeof showNotification === 'function') showNotification(msg, kind);
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      if (String(src).indexOf('data:') !== 0) img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('image')); };
      img.src = src;
    });
  }

  function drawSquare(img, size, mode) {
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#070B14';
    ctx.fillRect(0, 0, size, size);
    var box = mode === 'maskable' ? size * 0.8 : size;
    var ox = (size - box) / 2;
    var oy = ox;
    var scale = Math.max(box / img.width, box / img.height);
    var w = img.width * scale;
    var h = img.height * scale;
    ctx.drawImage(img, ox + (box - w) / 2, oy + (box - h) / 2, w, h);
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) reject(new Error('blob'));
        else resolve(blob);
      }, 'image/png');
    });
  }

  async function uploadBlob(path, blob, contentType) {
    if (!window.supabaseClient) throw new Error('no supabase');
    var up = await supabaseClient.storage.from('public-assets').upload(path, blob, {
      upsert: true,
      contentType: contentType || blob.type || 'application/octet-stream',
      cacheControl: path.indexOf('version.txt') >= 0 ? '0' : '60'
    });
    if (up.error) throw up.error;
    var pub = supabaseClient.storage.from('public-assets').getPublicUrl(path);
    return pub.data && pub.data.publicUrl ? pub.data.publicUrl : BASE + path.split('/').pop();
  }

  function currentIconSrc() {
    try {
      var s = JSON.parse(localStorage.getItem('cafeSettings') || '{}');
      if (s && s.appIcon) return s.appIcon;
    } catch (e) {}
    return localStorage.getItem('cafeAppIcon') || '';
  }

  function tellServiceWorker(version) {
    if (!('serviceWorker' in navigator)) return;
    var msg = { type: 'PWA_ICON_UPDATED', v: version };
    try {
      if (navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage(msg);
    } catch (e) {}
    navigator.serviceWorker.ready.then(function (reg) {
      if (reg.active) reg.active.postMessage(msg);
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }).catch(function () {});
  }

  function pointAppleTouchIcon(version) {
    var href = BASE + 'apple-touch-icon.png?v=' + encodeURIComponent(version);
    var links = document.querySelectorAll('link[rel="apple-touch-icon"]');
    if (!links.length) {
      var link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = href;
      document.head.appendChild(link);
      return;
    }
    links.forEach(function (link) { link.href = href; });
  }

  async function saveVersion(version) {
    var blob = new Blob([String(version)], { type: 'text/plain' });
    await uploadBlob('app-media/pwa/version.txt', blob, 'text/plain');
    try { localStorage.setItem('cafePwaIconVersion', String(version)); } catch (e) {}
    if (typeof cloudSaveAdminSetting === 'function') {
      try { await cloudSaveAdminSetting('pwaIconPack', { v: version, updated_at: new Date().toISOString() }); } catch (e) {}
    }
    tellServiceWorker(version);
    pointAppleTouchIcon(version);
  }

  async function publishPwaIcons() {
    var src = currentIconSrc();
    if (!src) return false;
    if (!window.supabaseClient) {
      notify('اتصال سرور برای آیکون میانبر نیست', 'error');
      return false;
    }
    notify('⏳ در حال ساخت آیکون‌های میانبر...');
    var img = await loadImage(src);
    for (var i = 0; i < SPECS.length; i++) {
      var spec = SPECS[i];
      var png = await drawSquare(img, spec.size, spec.mode);
      await uploadBlob('app-media/pwa/' + spec.file, png, 'image/png');
    }
    var version = Date.now();
    await saveVersion(version);
    notify('آیکون میانبر روی سرور ذخیره شد. نصب جدید همین را می‌گیرد. میانبر قبلی گوشی را حذف کنید و دوباره اضافه کنید.');
    return true;
  }

  function wrapSaver() {
    var orig = window.saveAndApplyAllMediaImages;
    if (typeof orig !== 'function' || orig.__pwaIconWrapped) return;
    var wrapped = async function () {
      var result = await orig.apply(this, arguments);
      try {
        await publishPwaIcons();
      } catch (e) {
        console.warn('[pwa-icon]', e);
        notify('ذخیره لوگو انجام شد، ولی ساخت آیکون میانبر ناموفق بود', 'error');
      }
      return result;
    };
    wrapped.__pwaIconWrapped = true;
    window.saveAndApplyAllMediaImages = wrapped;
  }

  async function boot() {
    wrapSaver();
    try {
      var res = await fetch(BASE + 'version.txt?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      var version = (await res.text() || '').trim();
      if (!/^\d+$/.test(version)) return;
      tellServiceWorker(version);
      pointAppleTouchIcon(version);
    } catch (e) {}
  }

  window.publishPwaIcons = publishPwaIcons;
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
