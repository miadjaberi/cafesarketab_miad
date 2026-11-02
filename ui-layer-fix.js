/* جلوگیری از روی‌هم افتادن پنل‌ها: هر بار فقط یک لایه اصلی باز باشد */
(function () {
  'use strict';

  function closeSettings() {
    var panel = document.getElementById('settingsPanel');
    if (!panel) return;
    panel.style.display = 'none';
    panel.classList.remove('active');
  }

  function closeMenu() {
    if (typeof window.closeMenuDrawer === 'function') {
      window.closeMenuDrawer();
      return;
    }
    var overlay = document.getElementById('menuDrawerOverlay');
    var drawer = document.getElementById('menuDrawer');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  function closeAdmin() {
    var admin = document.getElementById('adminPanel');
    if (admin) {
      admin.style.display = 'none';
      admin.classList.remove('active');
    }
  }

  function closeSubOrders() {
    var p = document.getElementById('subOrdersPanel');
    if (p) p.style.display = 'none';
  }

  function closeAllLayersExcept(keep) {
    if (keep !== 'settings') closeSettings();
    if (keep !== 'admin') closeAdmin();
    if (keep !== 'menu') closeMenu();
    if (keep !== 'suborders') closeSubOrders();
  }

  function wrap(name, keep) {
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
        } else if (name === 'openSubOrdersPanel') {
          closeAllLayersExcept('suborders');
        }
      } catch (e) {}
      return prev.apply(this, arguments);
    };
  }

  function applyWraps() {
    wrap('toggleUserSettings', 'settings');
    wrap('toggleMenuDrawer', 'menu');
    wrap('toggleAdmin', 'admin');
    wrap('openSubOrdersPanel', 'suborders');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(applyWraps, 0); });
  } else {
    setTimeout(applyWraps, 0);
  }
  window.addEventListener('load', function () { setTimeout(applyWraps, 50); });

  (function loadKafePatches() {
    function inject(src, key) {
      try {
        if (document.querySelector('script[data-kafe-patch="'+key+'"]')) return;
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.setAttribute('data-kafe-patch', key);
        (document.body || document.documentElement).appendChild(s);
      } catch (e) {}
    }
    inject('./fix-four-bugs.js?v=20261102f', 'four-bugs');
    inject('./hamzad-ui-fix.js?v=20261102f', 'hamzad-ui');
    inject('./modal-menu-layout.js?v=20261102f', 'modal-menu');
    inject('./modal-ui-theme.js?v=20261102f', 'modal-theme');
    inject('./rename-raml.js?v=20261102f', 'rename-raml');
    inject('./ui-unify-v1.js?v=20261102f', 'ui-unify');
  })();
})();
