/* جلوگیری از روی‌هم افتادن پنل‌ها */
(function () {
  'use strict';
  try { localStorage.removeItem('kafeQA'); } catch (eLegacyQA) {}
  function closeSettings() {
    var panel = document.getElementById('settingsPanel');
    if (!panel) return;
    panel.style.display = 'none';
    panel.classList.remove('active');
  }
  function closeMenu() {
    if (typeof window.closeMenuDrawer === 'function') { window.closeMenuDrawer(); return; }
    var overlay = document.getElementById('menuDrawerOverlay');
    var drawer = document.getElementById('menuDrawer');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
  function closeAdmin() {
    var admin = document.getElementById('adminPanel');
    if (admin) { admin.style.display = 'none'; admin.classList.remove('active'); }
  }
  function closeAllLayersExcept(keep) {
    if (keep !== 'settings') closeSettings();
    if (keep !== 'admin') closeAdmin();
    if (keep !== 'menu') closeMenu();
  }
  function wrap(name) {
    var prev = window[name];
    if (typeof prev !== 'function') return;
    window[name] = function () {
      try {
        if (name === 'toggleUserSettings') {
          var panel = document.getElementById('settingsPanel');
          var willOpen = panel && !(panel.style.display === 'block' || panel.classList.contains('active'));
          if (willOpen) closeAllLayersExcept('settings');
        } else if (name === 'toggleMenuDrawer') {
          var drawer = document.getElementById('menuDrawer');
          var willOpenMenu = drawer && !drawer.classList.contains('active');
          if (willOpenMenu) closeAllLayersExcept('menu');
        } else if (name === 'toggleAdmin') {
          closeAllLayersExcept('admin');
        }
      } catch (e) {}
      return prev.apply(this, arguments);
    };
  }
  function applyWraps() {
    wrap('toggleUserSettings');
    wrap('toggleMenuDrawer');
    wrap('toggleAdmin');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(applyWraps, 0); });
  } else { setTimeout(applyWraps, 0); }

  (function loadKafePatches() {
    function inject(src, key) {
      try {
        if (document.querySelector('script[data-kafe-patch="' + key + '"]')) return;
        var s = document.createElement('script');
        s.async = false;
        s.src = src;
        s.defer = false;
        s.setAttribute('data-kafe-patch', key);
        (document.body || document.documentElement).appendChild(s);
      } catch (e) {}
    }
    inject('./boot-flow-fix.js?v=20261116-v49', 'boot-flow');
    inject('./product-modal-safe-fix.js?v=6', 'product-modal-safe');
    inject('./product-price-discount-fix.js?v=2', 'price-discount');

    var deferred = [
      ['./nav-swipe-fix.js?v=20261108c', 'nav-swipe'],
      ['./buy-nav-fix.js?v=20261108c', 'buy-nav'],
      ['./final-nav-fix.js?v=20261108c', 'final-nav'],
      ['./kafe-seven-fixes.js?v=20261106e', 'seven'],
      ['./fix-four-bugs.js?v=20261106e', 'four-bugs'],
      ['./hamzad-ui-fix.js?v=20261106e', 'hamzad-ui'],
      ['./modal-menu-layout.js?v=20261106e', 'modal-menu'],
      ['./modal-ui-theme.js?v=20261106e', 'modal-theme'],
      ['./modal-guide-size-fix.js?v=20261106e', 'modal-guide-size'],
      ['./rename-raml.js?v=20261106e', 'rename-raml'],
      ['./ui-unify-v1.js?v=20261106e', 'ui-unify'],
      ['./admin-ui-four-fixes.js?v=20261106e', 'admin-four'],
      ['./admin-messages-session-fix.js?v=20261107a', 'msg-session'],
      ['./nav-pages.js?v=20261110a', 'nav-pages']
    ];
    var loaded = false;
    function loadDeferredPatches() {
      if (loaded) return;
      loaded = true;
      for (var i = 0; i < deferred.length; i++) inject(deferred[i][0], deferred[i][1]);
    }
    var prevAuth = window.kafeAfterAuthSuccess;
    window.kafeAfterAuthSuccess = function (profile) {
      loadDeferredPatches();
      if (typeof prevAuth === 'function') return prevAuth.apply(this, arguments);
      return true;
    };
    function watchApp() {
      var app = document.getElementById('app');
      if (app && app.style.display && app.style.display !== 'none') {
        loadDeferredPatches();
        return;
      }
      setTimeout(watchApp, 800);
    }
    setTimeout(watchApp, 1500);
    setTimeout(loadDeferredPatches, 12000);
  })();
})();
