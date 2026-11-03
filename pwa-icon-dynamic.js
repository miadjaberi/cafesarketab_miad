/**
 * pwa-icon-dynamic.js V2
 * آیکون نصب PWA از پنل ادمین → Supabase Storage
 * + بازنویسی runtime برای manifest / favicon / apple-touch
 * تا دیگر به فایل‌های قدیمی icon192.png روی گیت‌هاب برنگردد.
 *
 * محدودیت پلتفرم: میانبر از قبل نصب‌شده روی iOS عوض نمی‌شود؛
 * روی اندروید اغلب تا حذف و نصب دوباره ثابت می‌ماند.
 */
(function () {
  'use strict';
  if (window.__KAFE_PWA_ICON_DYNAMIC_V2__) return;
  window.__KAFE_PWA_ICON_DYNAMIC_V2__ = true;

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
    navigator.serviceWorker.ready
      .then(function (reg) {
        if (reg.active) reg.active.postMessage(msg);
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      })
      .catch(function () {});
  }

  function setLinkHref(selector, href) {
    var links = document.querySelectorAll(selector);
    if (!links.length) return;
    links.forEach(function (link) {
      link.href = href;
    });
  }

  function pointHeadIcons(version) {
    var q = version ? ('?v=' + encodeURIComponent(version)) : ('?t=' + Date.now());
    setLinkHref('link[rel="icon"]', BASE + 'favicon.png' + q);
    setLinkHref('link[rel="apple-touch-icon"]', BASE + 'apple-touch-icon.png' + q);
    // header logo optional — only if explicitly using static icon files
  }

  function pointManifest(version) {
    var q = version ? ('?v=' + encodeURIComponent(version)) : ('?t=' + Date.now());
    var manifest = {
      id: '/',
      name: 'کافه سرکتاب میعاد',
      short_name: 'کافه میعاد',
      description: 'آموزش، محتوا و فروش محصولات کافه سرکتاب میعاد',
      lang: 'fa',
      dir: 'rtl',
      start_url: './index.html',
      scope: './',
      display: 'standalone',
      orientation: 'portrait-primary',
      background_color: '#070B14',
      theme_color: '#070B14',
      categories: ['education', 'shopping', 'lifestyle'],
      icons: [
        {
          src: BASE + 'icon-192.png' + q,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: BASE + 'icon-512.png' + q,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: BASE + 'icon-maskable-512.png' + q,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      shortcuts: [
        {
          name: 'ورود به برنامه',
          short_name: 'ورود',
          url: './index.html',
          description: 'باز کردن کافه سرکتاب میعاد'
        }
      ]
    };
    try {
      var blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
      var url = URL.createObjectURL(blob);
      var link = document.querySelector('link[rel="manifest"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
      }
      link.href = url;
    } catch (e) {
      console.warn('[pwa-icon] manifest rewrite failed', e);
    }
  }

  async function saveVersion(version) {
    var blob = new Blob([String(version)], { type: 'text/plain' });
    await uploadBlob('app-media/pwa/version.txt', blob, 'text/plain');
    try {
      localStorage.setItem('cafePwaIconVersion', String(version));
    } catch (e) {}
    if (typeof cloudSaveAdminSetting === 'function') {
      try {
        await cloudSaveAdminSetting('pwaIconPack', {
          v: version,
          updated_at: new Date().toISOString()
        });
      } catch (e) {}
    }
    tellServiceWorker(version);
    pointHeadIcons(version);
    pointManifest(version);
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
    notify(
      'آیکون میانبر روی سرور ذخیره شد. نصب جدید همین را می‌گیرد. میانبر قبلی گوشی را حذف کنید و دوباره اضافه کنید.'
    );
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
    var version = null;
    try {
      var res = await fetch(BASE + 'version.txt?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        var text = ((await res.text()) || '').trim();
        if (/^\d+$/.test(text)) version = text;
      }
    } catch (e) {}
    if (!version) {
      try {
        version = localStorage.getItem('cafePwaIconVersion') || String(Date.now());
      } catch (e2) {
        version = String(Date.now());
      }
    }
    tellServiceWorker(version);
    pointHeadIcons(version);
    pointManifest(version);
  }

  window.publishPwaIcons = publishPwaIcons;
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
