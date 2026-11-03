/** purchase-hold-fix.js V2
 * فرم خرید اشتراک:
 * - داخل قالب اپ (بین هدر و نوار پایین)
 * - پس‌زمینه شفاف مثل فروشگاه / منوی مودال‌ها
 * - قفل ضد بسته شدن تصادفی
 */
(function () {
  'use strict';
  if (window.__KAFE_PURCHASE_HOLD_V2__) return;
  window.__KAFE_PURCHASE_HOLD_V2__ = true;

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
    // فاصله کوچک مثل pages-container
    return { headerH: headerH, navH: navH, gap: 8 };
  }

  function injectInAppCSS() {
    var id = 'kafe-purchase-inapp-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '/* خرید اشتراک = لایه داخل قالب اپ، شفاف مثل فروشگاه */',
      '#subscriptionModalBox{',
      '  position:fixed!important;',
      '  inset:auto!important;',
      '  left:0!important;right:0!important;',
      '  z-index:50!important;',
      '  display:flex!important;',
      '  flex-direction:column!important;',
      '  align-items:stretch!important;',
      '  justify-content:flex-start!important;',
      '  padding:0!important;margin:0!important;',
      '  /* شفاف — تصویر زمینه اپ دیده شود */',
      '  background:transparent!important;',
      '  backdrop-filter:none!important;',
      '  -webkit-backdrop-filter:none!important;',
      '  border-radius:0!important;',
      '  box-shadow:none!important;',
      '  opacity:1!important;visibility:visible!important;',
      '  pointer-events:auto!important;',
      '}',
      '#subscriptionModalBox > div{',
      '  width:100%!important;',
      '  max-width:none!important;',
      '  height:100%!important;',
      '  max-height:none!important;',
      '  margin:0!important;',
      '  border-radius:0!important;',
      '  border:none!important;',
      '  /* کارت شیشه‌ای ملایم مثل بلوک‌های فروشگاه */',
      '  background:rgba(8,12,24,0.18)!important;',
      '  backdrop-filter:blur(10px)!important;',
      '  -webkit-backdrop-filter:blur(10px)!important;',
      '  box-shadow:none!important;',
      '  overflow-y:auto!important;',
      '  padding:12px 12px 24px!important;',
      '  color:#F0E6D3!important;',
      '  opacity:1!important;',
      '}',
      '/* فیلدها خوانا روی پس‌زمینه شفاف */',
      '#subscriptionModalBox input,',
      '#subscriptionModalBox select,',
      '#subscriptionModalBox textarea{',
      '  background:rgba(8,12,24,0.55)!important;',
      '  color:#F5E6C8!important;',
      '  border:1px solid rgba(201,168,76,0.4)!important;',
      '}',
      '#subscriptionModalBox label{color:#F0D878!important;}'
    ].join('\n');
  }

  function styleInApp(box) {
    if (!box) box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    var h = heights();
    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('inset', 'auto', 'important');
    box.style.setProperty('top', h.headerH + h.gap + 'px', 'important');
    box.style.setProperty('bottom', h.navH + h.gap + 'px', 'important');
    box.style.setProperty('left', '0', 'important');
    box.style.setProperty('right', '0', 'important');
    box.style.setProperty('width', '100%', 'important');
    box.style.setProperty('z-index', '50', 'important');
    box.style.setProperty('display', 'flex', 'important');
    box.style.setProperty('background', 'transparent', 'important');
    box.style.setProperty('opacity', '1', 'important');
    box.style.setProperty('visibility', 'visible', 'important');
    box.style.setProperty('pointer-events', 'auto', 'important');
    box.style.setProperty('backdrop-filter', 'none', 'important');

    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('max-width', 'none', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      sheet.style.setProperty('margin', '0', 'important');
      sheet.style.setProperty('border-radius', '0', 'important');
      sheet.style.setProperty('border', 'none', 'important');
      sheet.style.setProperty('background', 'rgba(8,12,24,0.18)', 'important');
      sheet.style.setProperty('backdrop-filter', 'blur(10px)', 'important');
      sheet.style.setProperty('-webkit-backdrop-filter', 'blur(10px)', 'important');
      sheet.style.setProperty('box-shadow', 'none', 'important');
      sheet.style.setProperty('overflow-y', 'auto', 'important');
      sheet.style.setProperty('padding', '12px 12px 24px', 'important');
      sheet.style.setProperty('opacity', '1', 'important');
    }
  }

  var origRemove = Element.prototype.remove;
  Element.prototype.remove = function () {
    if (
      this &&
      this.id === 'subscriptionModalBox' &&
      window.__kafeSubLock &&
      !window.__kafeSubAllowClose
    ) {
      console.warn('[purchase-hold] blocked remove');
      styleInApp(this);
      return;
    }
    return origRemove.apply(this, arguments);
  };

  function allowClose() {
    window.__kafeSubAllowClose = true;
    window.__kafeSubLock = false;
  }

  function lockOpen() {
    window.__kafeSubAllowClose = false;
    window.__kafeSubLock = true;
    styleInApp();
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
          function () {
            allowClose();
            var m = document.getElementById('subscriptionModalBox');
            if (m) origRemove.call(m);
          },
          true
        );
      }
    });
  }

  function wrapOpen() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function' || prev.__kafeHoldWrapV2) return;
    var wrapped = function () {
      window.__kafeSubAllowClose = true;
      window.__kafeSubLock = false;
      var ret = prev.apply(this, arguments);
      var after = function () {
        lockOpen();
        setTimeout(lockOpen, 80);
        setTimeout(lockOpen, 250);
        setTimeout(lockOpen, 700);
      };
      if (ret && typeof ret.then === 'function') ret.then(after).catch(after);
      else after();
      return ret;
    };
    wrapped.__kafeHoldWrapV2 = true;
    window.openSubscriptionPurchase = wrapped;
  }

  try {
    var mo = new MutationObserver(function () {
      var btn = document.getElementById('subscriptionSubmitBtn');
      if (btn && /موفق|ارسال شد/.test(btn.textContent || '')) allowClose();
      var box = document.getElementById('subscriptionModalBox');
      if (box && window.__kafeSubLock) styleInApp(box);
    });
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  } catch (e) {}

  function bindNavClose() {
    var nav = document.getElementById('bottomNav');
    if (!nav || nav.__kafeHoldNavV2) return;
    nav.__kafeHoldNavV2 = true;
    nav.addEventListener(
      'click',
      function (ev) {
        var t =
          ev.target && ev.target.closest
            ? ev.target.closest('button.nav-item-bottom')
            : null;
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

  function run() {
    injectInAppCSS();
    wrapOpen();
    bindNavClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 700);
    });
  } else {
    run();
    setTimeout(run, 700);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 350);
  });
})();
