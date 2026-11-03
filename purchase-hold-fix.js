/** purchase-hold-fix.js
 * فرم خرید اشتراک را قفل می‌کند تا تصادفی remove/hide نشود.
 * فقط با ✕ یا پرچم __kafeSubAllowClose بسته می‌شود.
 */
(function () {
  'use strict';
  if (window.__KAFE_PURCHASE_HOLD_V1__) return;
  window.__KAFE_PURCHASE_HOLD_V1__ = true;

  window.__kafeSubLock = false;
  window.__kafeSubAllowClose = false;

  function heights() {
    var headerH = 152,
      navH = 68;
    try {
      var hdr =
        document.querySelector('#appHeader') ||
        document.querySelector('header.app-header') ||
        document.querySelector('header');
      if (hdr) {
        var hr = hdr.getBoundingClientRect();
        if (hr.height > 40 && hr.height < 280) headerH = Math.round(hr.height);
      }
      var nav = document.getElementById('bottomNav');
      if (nav) {
        var nr = nav.getBoundingClientRect();
        if (nr.height > 40 && nr.height < 140) navH = Math.round(nr.height);
      }
    } catch (e) {}
    return { headerH: headerH, navH: navH };
  }

  function styleSolid(box) {
    if (!box) box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    var h = heights();
    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('inset', 'auto', 'important');
    box.style.setProperty('top', h.headerH + 'px', 'important');
    box.style.setProperty('bottom', h.navH + 'px', 'important');
    box.style.setProperty('left', '0', 'important');
    box.style.setProperty('right', '0', 'important');
    box.style.setProperty('width', '100%', 'important');
    box.style.setProperty('z-index', '9200', 'important');
    box.style.setProperty('display', 'flex', 'important');
    box.style.setProperty('opacity', '1', 'important');
    box.style.setProperty('visibility', 'visible', 'important');
    box.style.setProperty('background', '#0b1120', 'important');
    box.style.setProperty('pointer-events', 'auto', 'important');
    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('max-width', 'none', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      sheet.style.setProperty('background', '#0b1120', 'important');
      sheet.style.setProperty('opacity', '1', 'important');
      sheet.style.setProperty('overflow-y', 'auto', 'important');
      sheet.style.setProperty('border-radius', '0', 'important');
      sheet.style.setProperty('margin', '0', 'important');
    }
  }

  // جلوگیری از remove تصادفی
  var origRemove = Element.prototype.remove;
  Element.prototype.remove = function () {
    if (
      this &&
      this.id === 'subscriptionModalBox' &&
      window.__kafeSubLock &&
      !window.__kafeSubAllowClose
    ) {
      console.warn('[purchase-hold] blocked remove of subscriptionModalBox');
      styleSolid(this);
      return;
    }
    return origRemove.apply(this, arguments);
  };

  // جلوگیری از display:none تصادفی روی خود باکس
  try {
    var desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style');
  } catch (e) {}

  function allowClose() {
    window.__kafeSubAllowClose = true;
    window.__kafeSubLock = false;
  }

  function lockOpen() {
    window.__kafeSubAllowClose = false;
    window.__kafeSubLock = true;
    styleSolid();
    // دکمه‌های بستن را امن کن
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    box.querySelectorAll('button').forEach(function (btn) {
      var t = (btn.textContent || '').trim();
      var oc = btn.getAttribute('onclick') || '';
      if (t === '✕' || t === '×' || oc.indexOf('subscriptionModalBox') >= 0) {
        if (btn.__kafeHoldClose) return;
        btn.__kafeHoldClose = true;
        btn.addEventListener(
          'click',
          function (ev) {
            allowClose();
            var m = document.getElementById('subscriptionModalBox');
            if (m) origRemove.call(m);
          },
          true
        );
      }
    });
  }

  // بعد از submit موفق، main.js بعد از 900ms remove می‌کند — اجازه بده
  var origNotify = window.showNotification;
  // wrap openSubscriptionPurchase
  function wrapOpen() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function' || prev.__kafeHoldWrap) return;
    var wrapped = function () {
      // اجازه حذف نسخه قبلی فقط هنگام باز کردن تازه
      window.__kafeSubAllowClose = true;
      window.__kafeSubLock = false;
      var ret = prev.apply(this, arguments);
      var after = function () {
        lockOpen();
        setTimeout(lockOpen, 50);
        setTimeout(lockOpen, 200);
        setTimeout(lockOpen, 600);
        setTimeout(lockOpen, 1200);
      };
      if (ret && typeof ret.then === 'function') ret.then(after).catch(after);
      else after();
      return ret;
    };
    wrapped.__kafeHoldWrap = true;
    window.openSubscriptionPurchase = wrapped;
  }

  // وقتی متن دکمه submit موفق شد، اجازه بستن بده
  try {
    var mo = new MutationObserver(function () {
      var btn = document.getElementById('subscriptionSubmitBtn');
      if (btn && /موفق|ارسال شد/.test(btn.textContent || '')) {
        allowClose();
      }
      var box = document.getElementById('subscriptionModalBox');
      if (box && window.__kafeSubLock) styleSolid(box);
    });
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  } catch (e) {}

  // بستن فقط با دکمه‌های ناو دیگر (فروشگاه و...)
  function bindNavClose() {
    var nav = document.getElementById('bottomNav');
    if (!nav || nav.__kafeHoldNav) return;
    nav.__kafeHoldNav = true;
    nav.addEventListener(
      'click',
      function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest('button.nav-item-bottom') : null;
        if (!t) return;
        var label = (t.textContent || '').replace(/\s+/g, ' ').trim();
        var isBuy = label.indexOf('خرید') >= 0 && !t.classList.contains('center-btn');
        if (isBuy) return;
        allowClose();
        var m = document.getElementById('subscriptionModalBox');
        if (m) origRemove.call(m);
      },
      true
    );
  }

  // خنثی کردن forceSubAsPage که cssText را پاک می‌کند
  Object.defineProperty(window, '__kafeBlockForceSubCssClear', { value: true, writable: true });

  function run() {
    wrapOpen();
    bindNavClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 800);
    });
  } else {
    run();
    setTimeout(run, 800);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 400);
  });
})();
