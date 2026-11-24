/* ui-layer-fix.js — محدود به مدیریت هم‌پوشانی لایه‌ها؛ بدون بارگذاری وابستگی‌های تاریخی */
(function () {
  'use strict';
  if (window.__KAFE_UI_LAYER_ONLINE_V1__) return;
  window.__KAFE_UI_LAYER_ONLINE_V1__ = true;

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
    var panel = document.getElementById('adminPanel');
    if (!panel) return;
    panel.style.display = 'none';
    panel.classList.remove('active');
  }
  function closeOtherLayers(keep) {
    if (keep !== 'settings') closeSettings();
    if (keep !== 'menu') closeMenu();
    if (keep !== 'admin') closeAdmin();
  }
  function wrap(name) {
    var original = window[name];
    if (typeof original !== 'function' || original.__kafeLayerWrapped) return;
    var wrapped = function () {
      try {
        if (name === 'toggleUserSettings') {
          var panel = document.getElementById('settingsPanel');
          var opening = panel && !(panel.style.display === 'block' || panel.style.display === 'flex' || panel.classList.contains('active'));
          if (opening) closeOtherLayers('settings');
        } else if (name === 'toggleMenuDrawer') {
          var drawer = document.getElementById('menuDrawer');
          var openingMenu = drawer && !drawer.classList.contains('active');
          if (openingMenu) closeOtherLayers('menu');
        } else if (name === 'toggleAdmin') {
          closeOtherLayers('admin');
        }
      } catch (e) {}
      return original.apply(this, arguments);
    };
    wrapped.__kafeLayerWrapped = true;
    window[name] = wrapped;
  }
  function apply() {
    wrap('toggleUserSettings');
    wrap('toggleMenuDrawer');
    wrap('toggleAdmin');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(apply, 0); });
  } else {
    setTimeout(apply, 0);
  }
  window.addEventListener('load', function () { setTimeout(apply, 200); });
})();
