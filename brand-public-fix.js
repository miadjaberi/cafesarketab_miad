/* Public brand images for all users
   Accepts https and data:image URLs from admin:cafeSettings.
   Retries apply so applyDefaultImages cannot stick forever.
*/
(function () {
  'use strict';

  function isUsableImageUrl(u) {
    if (!u || typeof u !== 'string') return false;
    var s = String(u).trim();
    if (!s) return false;
    if (s.indexOf('http://') === 0 || s.indexOf('https://') === 0) return true;
    if (s.indexOf('data:image/') === 0) return true;
    return false;
  }

  function applyDirect(s) {
    if (!s || typeof s !== 'object') return;
    try {
      if (s.headerLogo) {
        var h = document.getElementById('headerLogoImg');
        if (h) h.src = s.headerLogo;
      }
      if (s.registerLogo) {
        var r = document.getElementById('registerLogoImg') || document.querySelector('#registerScreen img');
        if (r) r.src = s.registerLogo;
      }
      if (s.splashBg) {
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
      if (s.appBg) {
        try {
          document.documentElement.style.setProperty('--app-user-bg', 'url("' + s.appBg + '")');
          document.body.style.setProperty('background-image', 'url("' + s.appBg + '")', 'important');
          document.body.style.setProperty('background-size', 'cover', 'important');
          document.body.style.setProperty('background-position', 'center', 'important');
          var app = document.getElementById('app');
          if (app) {
            app.style.setProperty('background-image', 'url("' + s.appBg + '")', 'important');
            app.style.setProperty('background-size', 'cover', 'important');
            app.style.setProperty('background-position', 'center', 'important');
          }
        } catch (eBg) {}
      }
      if (s.appIcon) {
        try { localStorage.setItem('cafeAppIcon', s.appIcon); } catch (eI) {}
        try {
          if (typeof applyAppIcon === 'function') applyAppIcon(s.appIcon);
          else {
            document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"],link[rel="shortcut icon"]').forEach(function (l) {
              l.href = s.appIcon;
            });
          }
        } catch (eIc) {}
      }
    } catch (e) {
      console.warn('applyDirect brand', e);
    }
  }

  function applyBrandFromSettingsObject(val) {
    if (!val || typeof val !== 'object') return false;
    var s = {};
    try { s = JSON.parse(localStorage.getItem('cafeSettings') || '{}'); } catch (e) { s = {}; }
    var changed = false;
    ['headerLogo', 'registerLogo', 'splashBg', 'appBg', 'appIcon'].forEach(function (k) {
      if (isUsableImageUrl(val[k])) {
        s[k] = String(val[k]).trim();
        changed = true;
      }
    });
    if (val.managerPhone) { s.managerPhone = val.managerPhone; changed = true; }
    if (val.managerHours) { s.managerHours = val.managerHours; changed = true; }
    if (val.paymentGuide) { s.paymentGuide = val.paymentGuide; changed = true; }
    if (val.paymentOwner) { s.paymentOwner = val.paymentOwner; changed = true; }
    delete s.paymentCard;
    delete s.paymentSheba;
    if (changed) {
      try { localStorage.setItem('cafeSettings', JSON.stringify(s)); } catch (e2) {}
    }
    try {
      if (typeof window.applyGalleryImagesToUI === 'function') window.applyGalleryImagesToUI();
    } catch (e4) {}
    applyDirect(s);
    // دوباره بعد از applyDefaultImages احتمالی
    setTimeout(function () { applyDirect(s); }, 800);
    setTimeout(function () { applyDirect(s); }, 2000);
    return changed;
  }

  window.loadPublicBrandImages = async function loadPublicBrandImages() {
    try {
      var client = window.supabaseClient;
      if (!client) return false;
      var r = await client.from('app_settings').select('key,value').eq('key', 'admin:cafeSettings').maybeSingle();
      if (r.error || !r.data || !r.data.value) return false;
      var val = r.data.value;
      if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch (e) { return false; }
      }
      return applyBrandFromSettingsObject(val);
    } catch (e) {
      console.warn('loadPublicBrandImages', e);
      return false;
    }
  };

  function schedule() {
    var tries = 0;
    function tick() {
      tries++;
      if (window.supabaseClient) {
        window.loadPublicBrandImages().catch(function () {});
        return;
      }
      if (tries < 50) setTimeout(tick, 250);
    }
    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(schedule, 300); });
  } else {
    setTimeout(schedule, 300);
  }
})();
