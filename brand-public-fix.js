/* Brand images — نسخه سبک‌تر (P1): یک بار از local، یک بار از cloud، حداکثر یک تثبیت */
(function () {
  'use strict';

  var KEYS = ['headerLogo', 'registerLogo', 'splashBg', 'appBg', 'appIcon'];
  var lastApplied = '';
  var cloudDone = false;

  function isUsableImageUrl(u) {
    if (!u || typeof u !== 'string') return false;
    var s = String(u).trim();
    return (
      s.indexOf('https://') === 0 ||
      s.indexOf('http://') === 0 ||
      s.indexOf('data:image/') === 0
    );
  }

  function readLocalSettings() {
    try {
      return JSON.parse(localStorage.getItem('cafeSettings') || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function writeLocalSettings(s) {
    try {
      var clean = Object.assign({}, s);
      delete clean.paymentCard;
      delete clean.paymentSheba;
      localStorage.setItem('cafeSettings', JSON.stringify(clean));
    } catch (e) {}
  }

  function snapshot(s) {
    return KEYS.map(function (k) {
      return k + '=' + (s[k] ? String(s[k]).slice(0, 40) : '');
    }).join('|');
  }

  function applyAllBrand(s, force) {
    if (!s || typeof s !== 'object') return false;
    var sig = snapshot(s);
    if (!force && sig === lastApplied) return true;
    lastApplied = sig;
    try {
      if (s.headerLogo && isUsableImageUrl(s.headerLogo)) {
        var h = document.getElementById('headerLogoImg');
        if (h) h.src = s.headerLogo;
      }
      if (s.registerLogo && isUsableImageUrl(s.registerLogo)) {
        var r = document.getElementById('registerLogoImg') || document.querySelector('#registerScreen img');
        if (r) r.src = s.registerLogo;
      }
      if (s.splashBg && isUsableImageUrl(s.splashBg)) {
        var spImg = document.getElementById('splashBgImg');
        if (spImg) {
          spImg.src = s.splashBg;
          spImg.style.display = 'block';
          spImg.style.opacity = '1';
        }
        var sp = document.getElementById('splashScreen');
        if (sp) {
          sp.style.backgroundImage = 'url("' + s.splashBg + '")';
          sp.style.backgroundSize = 'cover';
          sp.style.backgroundPosition = 'center';
        }
      }
      if (s.appBg && isUsableImageUrl(s.appBg)) {
        try {
          document.documentElement.style.setProperty('--app-user-bg', 'url("' + s.appBg + '")');
          document.body.style.setProperty('background-image', 'url("' + s.appBg + '")', 'important');
          document.body.style.setProperty('background-size', 'cover', 'important');
          document.body.style.setProperty('background-position', 'center', 'important');
          var app = document.getElementById('app');
          if (app) {
            app.style.setProperty('background-image', 'url("' + s.appBg + '")', 'important');
            app.style.setProperty('background-size', 'cover', 'important');
          }
        } catch (eBg) {}
      }
      if (s.appIcon && isUsableImageUrl(s.appIcon)) {
        try {
          localStorage.setItem('cafeAppIcon', s.appIcon);
        } catch (eI) {}
        try {
          if (typeof applyAppIcon === 'function') applyAppIcon(s.appIcon);
          else {
            document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(function (l) {
              l.href = s.appIcon;
            });
          }
        } catch (eIc) {}
      }
    } catch (e) {
      console.warn('applyAllBrand', e);
      return false;
    }
    try {
      if (typeof window.applyGalleryImagesToUI === 'function') window.applyGalleryImagesToUI();
    } catch (eG) {}
    return true;
  }

  function mergeCloudIntoLocal(val) {
    if (!val || typeof val !== 'object') return readLocalSettings();
    var s = readLocalSettings();
    KEYS.forEach(function (k) {
      if (isUsableImageUrl(val[k])) s[k] = String(val[k]).trim();
    });
    if (val.managerPhone) s.managerPhone = val.managerPhone;
    if (val.managerHours) s.managerHours = val.managerHours;
    if (val.paymentGuide) s.paymentGuide = val.paymentGuide;
    if (val.paymentOwner) s.paymentOwner = val.paymentOwner;
    delete s.paymentCard;
    delete s.paymentSheba;
    writeLocalSettings(s);
    return s;
  }

  window.loadPublicBrandImages = async function loadPublicBrandImages() {
    if (cloudDone) return true;
    try {
      var client = window.supabaseClient;
      if (!client) return false;
      var r = await client.from('app_settings').select('key,value').eq('key', 'admin:cafeSettings').maybeSingle();
      if (r.error || !r.data || !r.data.value) return false;
      var val = r.data.value;
      if (typeof val === 'string') {
        try {
          val = JSON.parse(val);
        } catch (e) {
          return false;
        }
      }
      var s = mergeCloudIntoLocal(val);
      cloudDone = true;
      applyAllBrand(s, true);
      return true;
    } catch (e) {
      console.warn('loadPublicBrandImages', e);
      return false;
    }
  };

  function boot() {
    var local = readLocalSettings();
    if (KEYS.some(function (k) {
      return isUsableImageUrl(local[k]);
    })) {
      applyAllBrand(local, true);
    }
    var tries = 0;
    function waitClient() {
      tries++;
      if (window.supabaseClient) {
        window.loadPublicBrandImages().catch(function () {});
        return;
      }
      if (tries < 30) setTimeout(waitClient, 300);
    }
    waitClient();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
