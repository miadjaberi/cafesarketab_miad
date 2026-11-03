/** buy-nav-fix.js V2
 * دکمه «خرید» بین فروشگاه و منوی وسط.
 * باگ V1: بعد از wrap، به‌خاطر فلگ __kafeBuyNavCore دیگر open اصلی صدا زده نمی‌شد.
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V2__) return;
  window.__KAFE_BUY_NAV_FIX_V2__ = true;

  function notify(msg) {
    try {
      if (typeof showNotification === 'function') showNotification(String(msg), 'info');
    } catch (e) {}
    try {
      var t = document.getElementById('kafeHardToast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'kafeHardToast';
        t.style.cssText =
          'position:fixed;left:50%;bottom:calc(var(--bottom-nav-height,68px) + 20px);transform:translateX(-50%);' +
          'z-index:2147483000;max-width:92vw;padding:12px 16px;border-radius:12px;font-size:0.9rem;font-weight:800;' +
          'background:#0b1120;color:#F0D878;border:2px solid #c9a84c;text-align:center;direction:rtl;';
        document.body.appendChild(t);
      }
      t.textContent = String(msg);
      t.style.display = 'block';
      clearTimeout(t._hide);
      t._hide = setTimeout(function () {
        t.style.display = 'none';
      }, 2200);
    } catch (e2) {}
  }

  function heights() {
    var headerH = 152,
      navH = 68;
    try {
      var hdr =
        document.querySelector('#appHeader') ||
        document.querySelector('header.app-header') ||
        document.querySelector('header');
      if (hdr) headerH = Math.round(hdr.getBoundingClientRect().height) || headerH;
      var nav = document.getElementById('bottomNav');
      if (nav) navH = Math.round(nav.getBoundingClientRect().height) || navH;
    } catch (e) {}
    if (headerH < 40 || headerH > 280) headerH = 152;
    if (navH < 40 || navH > 140) navH = 68;
    return { headerH: headerH, navH: navH };
  }

  function stylePanel(p) {
    if (!p) return;
    var h = heights();
    p.style.setProperty('display', 'flex', 'important');
    p.style.setProperty('position', 'fixed', 'important');
    p.style.setProperty('inset', 'auto', 'important');
    p.style.setProperty('top', h.headerH + 'px', 'important');
    p.style.setProperty('bottom', h.navH + 'px', 'important');
    p.style.setProperty('left', '0', 'important');
    p.style.setProperty('right', '0', 'important');
    p.style.setProperty('width', '100%', 'important');
    p.style.setProperty('height', 'auto', 'important');
    p.style.setProperty('z-index', '9000', 'important');
    p.style.setProperty('background', '#0b1120', 'important');
    p.style.setProperty('align-items', 'stretch', 'important');
    p.style.setProperty('justify-content', 'flex-start', 'important');
    p.style.setProperty('padding', '0', 'important');
    p.style.setProperty('opacity', '1', 'important');
    p.style.setProperty('visibility', 'visible', 'important');
    p.style.setProperty('pointer-events', 'auto', 'important');

    var sheet = p.querySelector('.sub-orders-sheet');
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('max-width', 'none', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      sheet.style.setProperty('margin', '0', 'important');
      sheet.style.setProperty('border-radius', '0', 'important');
      sheet.style.setProperty('background', '#0b1120', 'important');
      sheet.style.setProperty('overflow', 'auto', 'important');
      sheet.style.setProperty('display', 'block', 'important');
    }
  }

  // نگه داشتن تابع اصلی قبل از هر wrap دیگر
  var coreOpen = null;
  function captureCore() {
    var fn = window.openSubOrdersPanel;
    if (typeof fn === 'function' && !fn.__kafeBuyNavWrapper) {
      coreOpen = fn;
    }
  }
  captureCore();

  function openBuyPanel() {
    captureCore();
    var p = document.getElementById('subOrdersPanel');
    if (!p) {
      notify('پنل خرید پیدا نشد');
      return;
    }

    // بستن لایه‌های مزاحم
    try {
      var settings = document.getElementById('settingsPanel');
      if (settings) {
        settings.style.display = 'none';
        settings.classList.remove('active');
      }
      var drawer = document.getElementById('menuDrawer');
      var overlay = document.getElementById('menuDrawerOverlay');
      if (drawer) drawer.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
    } catch (e) {}

    // اول ظاهر کن
    stylePanel(p);
    notify('بخش خرید');

    // بعد داده را از هستهٔ اصلی بگیر
    try {
      if (typeof coreOpen === 'function') {
        var ret = coreOpen();
        if (ret && typeof ret.then === 'function') {
          ret
            .then(function () {
              stylePanel(p);
            })
            .catch(function (err) {
              console.warn('[buy-nav]', err);
              stylePanel(p);
            });
        }
      } else if (typeof window.openSubOrdersPanel === 'function') {
        window.openSubOrdersPanel();
      }
    } catch (err) {
      console.warn('[buy-nav] open', err);
      notify('خطا در باز کردن خرید');
    }

    stylePanel(p);
    setTimeout(function () {
      stylePanel(p);
    }, 60);
    setTimeout(function () {
      stylePanel(p);
    }, 250);
  }

  // wrapper عمومی برای هر کسی که openSubOrdersPanel را صدا می‌زند
  function installWrapper() {
    captureCore();
    if (typeof coreOpen !== 'function') return;
    if (window.openSubOrdersPanel && window.openSubOrdersPanel.__kafeBuyNavWrapper) return;

    var wrapped = function () {
      var p = document.getElementById('subOrdersPanel');
      if (p) stylePanel(p);
      var ret = coreOpen.apply(this, arguments);
      if (ret && typeof ret.then === 'function') {
        ret.then(function () {
          if (p) stylePanel(p);
        });
      }
      setTimeout(function () {
        if (p) stylePanel(p);
      }, 50);
      return ret;
    };
    wrapped.__kafeBuyNavWrapper = true;
    window.openSubOrdersPanel = wrapped;
  }

  function findBuyButton() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return null;
    var buttons = nav.querySelectorAll('button.nav-item-bottom');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.classList.contains('center-btn')) continue;
      var oc = b.getAttribute('onclick') || '';
      var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
      if (oc.indexOf('openSubOrdersPanel') >= 0 || label.indexOf('خرید') >= 0) return b;
    }
    return null;
  }

  function bindBuyButton() {
    var buyBtn = findBuyButton();
    if (!buyBtn || buyBtn.__kafeBuyBoundV2) return;
    buyBtn.__kafeBuyBoundV2 = true;
    buyBtn.style.pointerEvents = 'auto';
    buyBtn.style.cursor = 'pointer';
    // حذف وابستگی به onclick خطی — کنترل کامل با ما
    buyBtn.setAttribute('onclick', 'void(0)');
    buyBtn.addEventListener(
      'click',
      function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        openBuyPanel();
      },
      true
    );
  }

  // وقتی فروشگاه/ابزارها زده شد، پنل خرید بسته شود
  function bindOtherNavClose() {
    var nav = document.getElementById('bottomNav');
    if (!nav || nav.__kafeBuyCloseBound) return;
    nav.__kafeBuyCloseBound = true;
    nav.addEventListener(
      'click',
      function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest('button.nav-item-bottom') : null;
        if (!t) return;
        var oc = t.getAttribute('onclick') || '';
        var label = (t.textContent || '').replace(/\s+/g, ' ').trim();
        var isBuy = oc.indexOf('openSubOrdersPanel') >= 0 || (label.indexOf('خرید') >= 0 && !t.classList.contains('center-btn'));
        if (isBuy) return;
        var p = document.getElementById('subOrdersPanel');
        if (p && p.style.display !== 'none') {
          p.style.display = 'none';
        }
      },
      true
    );
  }

  function run() {
    installWrapper();
    bindBuyButton();
    bindOtherNavClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 500);
      setTimeout(run, 1500);
    });
  } else {
    run();
    setTimeout(run, 500);
    setTimeout(run, 1500);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 400);
  });
})();
