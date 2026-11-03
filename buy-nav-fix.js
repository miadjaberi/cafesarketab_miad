/** buy-nav-fix.js
 * دکمه «خرید» نوار پایین گاهی بی‌اثر بود.
 * این پچ: bind مستقیم + باز کردن قطعی پنل + بازخورد
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V1__) return;
  window.__KAFE_BUY_NAV_FIX_V1__ = true;

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
      }, 2500);
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
    // محافظه کارانه: اگر ارتفاع عجیب بود
    if (headerH < 40 || headerH > 260) headerH = 152;
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

  function openBuyPanel() {
    notify('باز کردن بخش خرید…');
    var p = document.getElementById('subOrdersPanel');
    if (!p) {
      notify('پنل خرید در صفحه پیدا نشد');
      return;
    }
    // اول خودمان پنل را نشان بده
    stylePanel(p);

    // بعد تابع اصلی (وضعیت اشتراک / لیست)
    try {
      if (typeof window.openSubOrdersPanel === 'function' && !window.openSubOrdersPanel.__kafeBuyNavCore) {
        // اگر نسخهٔ اصلی است، صدا بزن
        var ret = window.openSubOrdersPanel();
        if (ret && typeof ret.then === 'function') {
          ret.catch(function (e) {
            console.warn('openSubOrdersPanel', e);
            notify('خطا در بارگذاری خرید: ' + ((e && e.message) || e));
          });
        }
      }
    } catch (e) {
      console.warn(e);
      notify('خطا: ' + ((e && e.message) || e));
    }

    // دوباره محکم‌کاری ظاهر
    stylePanel(p);
    setTimeout(function () {
      stylePanel(p);
    }, 50);
    setTimeout(function () {
      stylePanel(p);
    }, 200);
  }

  // نسخهٔ پایدار سراسری
  var prevOpen = window.openSubOrdersPanel;
  window.openSubOrdersPanel = function () {
    var p = document.getElementById('subOrdersPanel');
    if (p) stylePanel(p);
    if (typeof prevOpen === 'function') {
      try {
        var r = prevOpen.apply(this, arguments);
        setTimeout(function () {
          if (p) stylePanel(p);
        }, 0);
        setTimeout(function () {
          if (p) stylePanel(p);
        }, 120);
        return r;
      } catch (e) {
        if (p) stylePanel(p);
        notify('خطا در باز کردن خرید');
        throw e;
      }
    }
    if (p) stylePanel(p);
  };
  window.openSubOrdersPanel.__kafeBuyNavCore = true;

  function bindBuyButton() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    var buttons = nav.querySelectorAll('button.nav-item-bottom');
    var buyBtn = null;
    buttons.forEach(function (b) {
      var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
      var oc = b.getAttribute('onclick') || '';
      if (oc.indexOf('openSubOrdersPanel') >= 0 || label.indexOf('خرید') >= 0) {
        // وسط منو نیست
        if (!b.classList.contains('center-btn')) buyBtn = b;
      }
    });
    if (!buyBtn) return;
    if (buyBtn.__kafeBuyBound) return;
    buyBtn.__kafeBuyBound = true;
    buyBtn.style.pointerEvents = 'auto';
    buyBtn.style.cursor = 'pointer';
    // onclick قدیمی را نگه می‌داریم ولی capture هم می‌گیریم
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

  function run() {
    bindBuyButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 400);
      setTimeout(run, 1200);
    });
  } else {
    run();
    setTimeout(run, 400);
    setTimeout(run, 1200);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 300);
  });
})();
