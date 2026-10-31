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
    if (keep !== 'menu') closeMenu();
    if (keep !== 'admin') closeAdmin();
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

  // Load four-bugs fix patch (hamzad UI, splash, close X, contrast)
  (function loadFourBugsFix() {
    try {
      if (document.querySelector('script[data-kafe-four-bugs]')) return;
      var s = document.createElement('script');
      s.src = './fix-four-bugs.js?v=20261031';
      s.async = true;
      s.setAttribute('data-kafe-four-bugs', '1');
      s.onerror = function () { console.warn('fix-four-bugs.js failed to load'); };
      (document.body || document.documentElement).appendChild(s);
    } catch (e) { console.warn(e); }
  })();
})();
