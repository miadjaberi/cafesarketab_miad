/** purchase-hold-fix.js V8 HOTFIX
 * بدون MutationObserver روی style (علت قفل شدن)
 * بدون setInterval مداوم
 * فقط: باز ماندن + یک‌بار استایل فروشگاه
 */
(function () {
  'use strict';
  if (window.__KAFE_PURCHASE_HOLD_V8__) return;
  window.__KAFE_PURCHASE_HOLD_V8__ = true;

  window.__kafeSubLock = false;
  window.__kafeSubAllowClose = false;

  var GLASS_BG = 'rgba(255,255,255,0.05)';
  var GLASS_BORDER = '1px solid rgba(255,215,0,0.15)';
  var applying = false;

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
    return { headerH: headerH, navH: navH, gap: 8 };
  }

  function injectCSS() {
    var id = 'kafe-purchase-shop-glass-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      'html body #subscriptionModalBox{',
      '  position:fixed!important;inset:auto!important;left:0!important;right:0!important;',
      '  z-index:50!important;display:flex!important;flex-direction:column!important;',
      '  background:transparent!important;opacity:1!important;visibility:visible!important;',
      '  pointer-events:auto!important;padding:10px 12px!important;margin:0!important;',
      '  box-sizing:border-box!important;border:none!important;box-shadow:none!important;',
      '}',
      'html body #subscriptionModalBox > div{',
      '  width:100%!important;max-width:none!important;max-height:100%!important;',
      '  margin:0!important;overflow-y:auto!important;padding:20px 16px 24px!important;',
      '  background:rgba(255,255,255,0.05)!important;',
      '  backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;',
      '  border:1px solid rgba(255,215,0,0.15)!important;border-radius:16px!important;',
      '  box-shadow:none!important;color:#F5F0E4!important;opacity:1!important;',
      '}',
      'html body #subscriptionModalBox input,',
      'html body #subscriptionModalBox select,',
      'html body #subscriptionModalBox textarea{',
      '  background:rgba(255,255,255,0.06)!important;color:#F5F0E4!important;',
      '  border:1px solid rgba(255,215,0,0.2)!important;border-radius:12px!important;',
      '}',
      'html body #subscriptionModalBox label{color:#F0D878!important;}',
      'html body #subscriptionModalBox .subscription-plan-btn span{',
      '  color:#1A1208!important;-webkit-text-fill-color:#1A1208!important;',
      '  font-weight:900!important;opacity:1!important;',
      '  background:rgba(255,248,220,0.95)!important;border-radius:8px!important;',
      '  padding:3px 8px!important;display:inline-block!important;margin-top:6px!important;',
      '}'
    ].join('\n');
  }

  function applyShopGlass() {
    if (applying) return;
    applying = true;
    try {
      var box = document.getElementById('subscriptionModalBox');
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
      box.style.setProperty('padding', '10px 12px', 'important');

      var sheet = box.firstElementChild;
      if (sheet) {
        sheet.style.setProperty('width', '100%', 'important');
        sheet.style.setProperty('max-width', 'none', 'important');
        sheet.style.setProperty('max-height', '100%', 'important');
        sheet.style.setProperty('overflow-y', 'auto', 'important');
        sheet.style.setProperty('background', GLASS_BG, 'important');
        sheet.style.setProperty('backdrop-filter', 'blur(12px)', 'important');
        sheet.style.setProperty('-webkit-backdrop-filter', 'blur(12px)', 'important');
        sheet.style.setProperty('border', GLASS_BORDER, 'important');
        sheet.style.setProperty('border-radius', '16px', 'important');
        sheet.style.setProperty('opacity', '1', 'important');
        sheet.style.setProperty('color', '#F5F0E4', 'important');
      }
    } finally {
      applying = false;
    }
  }

  var origRemove = Element.prototype.remove;
  if (!Element.prototype.remove.__kafeHoldPatched) {
    Element.prototype.remove = function () {
      if (
        this &&
        this.id === 'subscriptionModalBox' &&
        window.__kafeSubLock &&
        !window.__kafeSubAllowClose
      ) {
        return;
      }
      return origRemove.apply(this, arguments);
    };
    Element.prototype.remove.__kafeHoldPatched = true;
  }

  function allowClose() {
    window.__kafeSubAllowClose = true;
    window.__kafeSubLock = false;
  }

  function lockOpen() {
    window.__kafeSubAllowClose = false;
    window.__kafeSubLock = true;
    injectCSS();
    applyShopGlass();

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
    if (typeof prev !== 'function' || prev.__kafeHoldWrapV8) return;
    var wrapped = function () {
      window.__kafeSubAllowClose = true;
      window.__kafeSubLock = false;
      var ret = prev.apply(this, arguments);
      var after = function () {
        lockOpen();
        // فقط ۳ بار با فاصله — بدون loop
        setTimeout(applyShopGlass, 100);
        setTimeout(applyShopGlass, 400);
      };
      if (ret && typeof ret.then === 'function') ret.then(after).catch(after);
      else after();
      return ret;
    };
    wrapped.__kafeHoldWrapV8 = true;
    window.openSubscriptionPurchase = wrapped;
  }

  // فقط childList — نه attributes (جلوگیری از حلقه بی‌نهایت)
  try {
    var mo = new MutationObserver(function (mutations) {
      var btn = document.getElementById('subscriptionSubmitBtn');
      if (btn && /موفق|ارسال شد/.test(btn.textContent || '')) allowClose();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  function bindNavClose() {
    var nav = document.getElementById('bottomNav');
    if (!nav || nav.__kafeHoldNavV8) return;
    nav.__kafeHoldNavV8 = true;
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
    injectCSS();
    wrapOpen();
    bindNavClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
    });
  } else {
    run();
  }
  window.addEventListener('load', function () {
    setTimeout(run, 200);
  });
})();
