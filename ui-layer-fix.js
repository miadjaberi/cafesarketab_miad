/* جلوگیری از روی‌هم افتادن پنل‌ها */
(function () {
  'use strict';

  /* فلگ ماندگار نسخه‌های قدیمی را در هر بار اجرای برنامه بی‌اثر و پاک کن. */
  try { localStorage.removeItem('kafeQA'); } catch (eLegacyQA) {}

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
          var willOpen =
            panel &&
            !(panel.style.display === 'block' || panel.classList.contains('active'));
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
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(applyWraps, 0);
    });
  } else {
    setTimeout(applyWraps, 0);
  }

  (function loadKafePatches() {
    function inject(src, key) {
      try {
        if (document.querySelector('script[data-kafe-patch="' + key + '"]')) return;
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.setAttribute('data-kafe-patch', key);
        (document.body || document.documentElement).appendChild(s);
      } catch (e) {}
    }
    inject('./boot-flow-fix.js?v=20261107a', 'boot-flow');
    inject('./nav-swipe-fix.js?v=20261106e', 'nav-swipe');
    inject('./buy-nav-fix.js?v=20261106e', 'buy-nav');
    inject('./final-nav-fix.js?v=20261106e', 'final-nav');
    inject('./kafe-seven-fixes.js?v=20261106e', 'seven');
    inject('./fix-four-bugs.js?v=20261106e', 'four-bugs');
    inject('./hamzad-ui-fix.js?v=20261106e', 'hamzad-ui');
    inject('./modal-menu-layout.js?v=20261106e', 'modal-menu');
    inject('./modal-ui-theme.js?v=20261106e', 'modal-theme');
    inject('./modal-guide-size-fix.js?v=20261106e', 'modal-guide-size');
    inject('./rename-raml.js?v=20261106e', 'rename-raml');
    inject('./ui-unify-v1.js?v=20261106e', 'ui-unify');
    inject('./admin-ui-four-fixes.js?v=20261106e', 'admin-four');
    inject('./admin-messages-session-fix.js?v=20261107a', 'msg-session');

    function wantsQAInject() {
      try {
        var sp = new URLSearchParams(location.search || '');
        var q = sp.get('qa');
        var requested = q != null && String(q).trim() === '1';
        if (!requested) requested = /(?:^|[?&])qa\s*=\s*1(?:&|$)/.test(location.search || '');
        if (requested) {
          /* درخواست URL فقط یک‌بار مصرف است؛ تأیید مدیر جداگانه در harness انجام می‌شود. */
          try { sessionStorage.setItem('kafeQARequested', '1'); } catch (e1) {}
          try {
            var cleanUrl = new URL(location.href);
            cleanUrl.searchParams.delete('qa');
            history.replaceState(history.state, '', cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
          } catch (e2) {}
          return true;
        }
        if (typeof sessionStorage !== 'undefined' &&
            (sessionStorage.getItem('kafeQA') === '1' ||
             sessionStorage.getItem('kafeQARequested') === '1')) return true;
      } catch (e) {}
      return false;
    }
    if (wantsQAInject()) {
      inject('./qa-harness.js?v=20261107qa6', 'qa-harness');
      inject('./qa-inspector.js?v=20261107qa6', 'qa-inspector');
    }
  })();
})();
