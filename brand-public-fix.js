/* Public brand images for all users (not only admin panel)
   Loads logo/splash/bg/icon URLs from admin:cafeSettings and applies to UI.
   Safe: does not expose payment card/sheba beyond existing payment refresh behavior.
*/
(function () {
  'use strict';

  function applyBrandFromSettingsObject(val) {
    if (!val || typeof val !== 'object') return false;
    var s = {};
    try { s = JSON.parse(localStorage.getItem('cafeSettings') || '{}'); } catch (e) { s = {}; }
    var changed = false;
    ['headerLogo', 'registerLogo', 'splashBg', 'appBg', 'appIcon'].forEach(function (k) {
      if (val[k] && String(val[k]).indexOf('http') === 0) {
        s[k] = val[k];
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
      try {
        if (s.appIcon && String(s.appIcon).indexOf('http') === 0) {
          localStorage.setItem('cafeAppIcon', s.appIcon);
        }
      } catch (e3) {}
    }
    try {
      if (typeof window.applyGalleryImagesToUI === 'function') window.applyGalleryImagesToUI();
    } catch (e4) {}
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
      if (tries < 40) setTimeout(tick, 250);
    }
    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(schedule, 400); });
  } else {
    setTimeout(schedule, 400);
  }
})();
