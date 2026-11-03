/** buy-nav-fix.js V3
 * دکمه «خرید» نوار پایین → فرم کامل خرید اشتراک (۴ طرح + قیمت + فیش)
 * نه فقط صفحه وضعیت/تاریخ انقضا.
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V3__) return;
  window.__KAFE_BUY_NAV_FIX_V3__ = true;

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

  /** فرم کامل خرید اشتراک را داخل چهارچوب اپ (بین هدر و نوار پایین) نشان بده */
  function stylePurchaseBox() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    var h = heights();
    box.style.cssText = '';
    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('inset', 'auto', 'important');
    box.style.setProperty('top', h.headerH + 'px', 'important');
    box.style.setProperty('bottom', h.navH + 'px', 'important');
    box.style.setProperty('left', '0', 'important');
    box.style.setProperty('right', '0', 'important');
    box.style.setProperty('width', '100%', 'important');
    box.style.setProperty('z-index', '9200', 'important');
    box.style.setProperty('display', 'flex', 'important');
    box.style.setProperty('flex-direction', 'column', 'important');
    box.style.setProperty('align-items', 'stretch', 'important');
    box.style.setProperty('justify-content', 'flex-start', 'important');
    box.style.setProperty('padding', '0', 'important');
    box.style.setProperty('margin', '0', 'important');
    box.style.setProperty('background', '#0b1120', 'important');
    box.style.setProperty('border-radius', '0', 'important');
    box.style.setProperty('opacity', '1', 'important');
    box.style.setProperty('visibility', 'visible', 'important');
    box.style.setProperty('pointer-events', 'auto', 'important');

    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('max-width', 'none', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      sheet.style.setProperty('margin', '0', 'important');
      sheet.style.setProperty('border-radius', '0', 'important');
      sheet.style.setProperty('border', 'none', 'important');
      sheet.style.setProperty('border-top', '1px solid rgba(201,168,76,.35)', 'important');
      sheet.style.setProperty('background', '#0b1120', 'important');
      sheet.style.setProperty('box-shadow', 'none', 'important');
      sheet.style.setProperty('overflow-y', 'auto', 'important');
      sheet.style.setProperty('padding', '14px 14px 24px', 'important');
      sheet.style.setProperty('color', '#F0E6D3', 'important');
    }
  }

  function closeStatusPanel() {
    var p = document.getElementById('subOrdersPanel');
    if (p) p.style.display = 'none';
  }

  function closeOtherLayers() {
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
    closeStatusPanel();
  }

  function openFullPurchase() {
    closeOtherLayers();
    notify('فرم خرید اشتراک');

    var opener = window.openSubscriptionPurchase;
    if (typeof opener !== 'function') {
      notify('فرم خرید در دسترس نیست');
      return;
    }

    try {
      var ret = opener();
      if (ret && typeof ret.then === 'function') {
        ret
          .then(function () {
            stylePurchaseBox();
            enhancePurchaseChrome();
          })
          .catch(function (e) {
            console.warn('[buy-nav] purchase', e);
            stylePurchaseBox();
          });
      } else {
        stylePurchaseBox();
        enhancePurchaseChrome();
      }
    } catch (e) {
      console.warn(e);
      notify('خطا در باز کردن فرم خرید');
    }

    [0, 40, 120, 300, 600].forEach(function (ms) {
      setTimeout(function () {
        stylePurchaseBox();
        enhancePurchaseChrome();
      }, ms);
    });
  }

  /** لینک وضعیت اشتراک داخل فرم کامل */
  function enhancePurchaseChrome() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    if (box.querySelector('#kafeOpenSubStatusLink')) return;
    var head = box.querySelector('div');
    if (!head) return;
    var bar = document.createElement('div');
    bar.id = 'kafeOpenSubStatusLink';
    bar.style.cssText =
      'display:flex;justify-content:space-between;gap:8px;margin:0 0 12px;flex-wrap:wrap;';
    bar.innerHTML =
      '<button type="button" id="kafeBtnSubStatus" style="flex:1;min-width:140px;padding:10px;border-radius:12px;border:1px solid rgba(201,168,76,.45);background:rgba(201,168,76,.12);color:#F0D878;font-weight:800;cursor:pointer;font-family:inherit;">📋 وضعیت و سوابق من</button>';
    // insert after title row if possible
    try {
      var titleRow = head.firstElementChild;
      if (titleRow && titleRow.nextSibling) head.insertBefore(bar, titleRow.nextSibling);
      else head.insertBefore(bar, head.firstChild);
    } catch (e) {
      head.appendChild(bar);
    }
    var btn = document.getElementById('kafeBtnSubStatus');
    if (btn) {
      btn.onclick = function () {
        var m = document.getElementById('subscriptionModalBox');
        if (m) m.remove();
        if (typeof window.openSubOrdersPanel === 'function') {
          window.openSubOrdersPanel();
        }
      };
    }
  }

  // وقتی openSubscriptionPurchase از جاهای دیگر صدا زده شد هم فریم شود
  function wrapPurchaseOpener() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function' || prev.__kafeBuyNavPurchaseWrap) return;
    var wrapped = function () {
      var ret = prev.apply(this, arguments);
      if (ret && typeof ret.then === 'function') {
        ret.then(function () {
          stylePurchaseBox();
          enhancePurchaseChrome();
        });
      }
      [0, 50, 150, 400].forEach(function (ms) {
        setTimeout(function () {
          stylePurchaseBox();
          enhancePurchaseChrome();
        }, ms);
      });
      return ret;
    };
    wrapped.__kafeBuyNavPurchaseWrap = true;
    window.openSubscriptionPurchase = wrapped;
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
    if (!buyBtn || buyBtn.__kafeBuyBoundV3) return;
    buyBtn.__kafeBuyBoundV3 = true;
    buyBtn.style.pointerEvents = 'auto';
    buyBtn.style.cursor = 'pointer';
    // از openSubOrdersPanel جدا کن → فرم کامل
    buyBtn.setAttribute('onclick', 'void(0)');
    buyBtn.addEventListener(
      'click',
      function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        openFullPurchase();
      },
      true
    );
  }

  // بستن فرم خرید وقتی فروشگاه/ابزارها زده شد
  function bindOtherNavClose() {
    var nav = document.getElementById('bottomNav');
    if (!nav || nav.__kafeBuyCloseBoundV3) return;
    nav.__kafeBuyCloseBoundV3 = true;
    nav.addEventListener(
      'click',
      function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest('button.nav-item-bottom') : null;
        if (!t) return;
        var label = (t.textContent || '').replace(/\s+/g, ' ').trim();
        var isBuy = label.indexOf('خرید') >= 0 && !t.classList.contains('center-btn');
        if (isBuy) return;
        var m = document.getElementById('subscriptionModalBox');
        if (m) m.remove();
        var p = document.getElementById('subOrdersPanel');
        if (p) p.style.display = 'none';
      },
      true
    );
  }

  // observer برای وقتی فرم ساخته می‌شود
  try {
    var mo = new MutationObserver(function () {
      if (document.getElementById('subscriptionModalBox')) {
        stylePurchaseBox();
        enhancePurchaseChrome();
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  function run() {
    wrapPurchaseOpener();
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
