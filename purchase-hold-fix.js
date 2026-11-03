/** purchase-hold-fix.js V4
 * تنها مرجع ظاهر خرید اشتراک:
 * شفاف + داخل قالب اپ + قفل ضد حذف
 * هر استایل تیرهٔ بعدی را دوباره شفاف می‌کند
 */
(function () {
  'use strict';
  if (window.__KAFE_PURCHASE_HOLD_V4__) return;
  window.__KAFE_PURCHASE_HOLD_V4__ = true;

  window.__kafeSubLock = false;
  window.__kafeSubAllowClose = false;

  var keepAliveTimer = null;

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

  function injectInAppCSS() {
    var id = 'kafe-purchase-inapp-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    // آخرین استایل در head = اولویت نسبی بالاتر در بین stylesheetها
    document.head.appendChild(st);
    st.textContent = [
      '/* خرید اشتراک — شفاف اجباری */',
      'html body #subscriptionModalBox{',
      '  position:fixed!important;inset:auto!important;left:0!important;right:0!important;',
      '  z-index:50!important;display:flex!important;flex-direction:column!important;',
      '  background:transparent!important;',
      '  background-color:transparent!important;',
      '  background-image:none!important;',
      '  opacity:1!important;visibility:visible!important;',
      '  pointer-events:auto!important;border-radius:0!important;box-shadow:none!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  align-items:stretch!important;justify-content:flex-start!important;',
      '  padding:0!important;margin:0!important;',
      '}',
      'html body #subscriptionModalBox > div{',
      '  width:100%!important;max-width:none!important;height:100%!important;max-height:none!important;',
      '  margin:0!important;border-radius:0!important;border:none!important;',
      '  background:rgba(8,12,24,0.12)!important;',
      '  background-color:rgba(8,12,24,0.12)!important;',
      '  background-image:none!important;',
      '  backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;',
      '  box-shadow:none!important;',
      '  overflow-y:auto!important;padding:12px 12px 24px!important;color:#F0E6D3!important;',
      '  opacity:1!important;',
      '}',
      'html body #subscriptionModalBox input,',
      'html body #subscriptionModalBox select,',
      'html body #subscriptionModalBox textarea{',
      '  background:rgba(8,12,24,0.55)!important;color:#F5E6C8!important;',
      '  border:1px solid rgba(201,168,76,0.4)!important;',
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

  function styleTransparent(box) {
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
    box.style.setProperty('flex-direction', 'column', 'important');
    box.style.setProperty('align-items', 'stretch', 'important');
    box.style.setProperty('justify-content', 'flex-start', 'important');
    box.style.setProperty('padding', '0', 'important');
    box.style.setProperty('margin', '0', 'important');
    // شفاف اجباری
    box.style.setProperty('background', 'transparent', 'important');
    box.style.setProperty('background-color', 'transparent', 'important');
    box.style.setProperty('background-image', 'none', 'important');
    box.style.setProperty('opacity', '1', 'important');
    box.style.setProperty('visibility', 'visible', 'important');
    box.style.setProperty('pointer-events', 'auto', 'important');
    box.style.setProperty('backdrop-filter', 'none', 'important');
    box.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
    box.style.setProperty('border-radius', '0', 'important');
    box.style.setProperty('box-shadow', 'none', 'important');

    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('max-width', 'none', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      sheet.style.setProperty('margin', '0', 'important');
      sheet.style.setProperty('border-radius', '0', 'important');
      sheet.style.setProperty('border', 'none', 'important');
      // شیشه خیلی ملایم — نه تیره
      sheet.style.setProperty('background', 'rgba(8,12,24,0.12)', 'important');
      sheet.style.setProperty('background-color', 'rgba(8,12,24,0.12)', 'important');
      sheet.style.setProperty('background-image', 'none', 'important');
      sheet.style.setProperty('backdrop-filter', 'blur(8px)', 'important');
      sheet.style.setProperty('-webkit-backdrop-filter', 'blur(8px)', 'important');
      sheet.style.setProperty('box-shadow', 'none', 'important');
      sheet.style.setProperty('overflow-y', 'auto', 'important');
      sheet.style.setProperty('padding', '12px 12px 24px', 'important');
      sheet.style.setProperty('opacity', '1', 'important');
      sheet.style.setProperty('color', '#F0E6D3', 'important');
    }

    box.querySelectorAll('.subscription-plan-btn span').forEach(function (sp) {
      sp.style.setProperty('color', '#1A1208', 'important');
      sp.style.setProperty('-webkit-text-fill-color', '#1A1208', 'important');
      sp.style.setProperty('font-weight', '900', 'important');
      sp.style.setProperty('opacity', '1', 'important');
      sp.style.setProperty('background', 'rgba(255,248,220,0.95)', 'important');
      sp.style.setProperty('border-radius', '8px', 'important');
      sp.style.setProperty('padding', '3px 8px', 'important');
      sp.style.setProperty('display', 'inline-block', 'important');
      sp.style.setProperty('margin-top', '6px', 'important');
    });
  }

  function startKeepAlive() {
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    var n = 0;
    keepAliveTimer = setInterval(function () {
      n++;
      var box = document.getElementById('subscriptionModalBox');
      if (!box) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
        return;
      }
      // هر بار اگر کسی تیره کرد، دوباره شفاف کن
      styleTransparent(box);
      if (n > 80) {
        // بعد از ~16 ثانیه فقط هر 2 ثانیه چک
        clearInterval(keepAliveTimer);
        keepAliveTimer = setInterval(function () {
          var b = document.getElementById('subscriptionModalBox');
          if (!b) {
            clearInterval(keepAliveTimer);
            keepAliveTimer = null;
            return;
          }
          styleTransparent(b);
        }, 2000);
      }
    }, 200);
  }

  var origRemove = Element.prototype.remove;
  Element.prototype.remove = function () {
    if (
      this &&
      this.id === 'subscriptionModalBox' &&
      window.__kafeSubLock &&
      !window.__kafeSubAllowClose
    ) {
      styleTransparent(this);
      return;
    }
    return origRemove.apply(this, arguments);
  };

  function allowClose() {
    window.__kafeSubAllowClose = true;
    window.__kafeSubLock = false;
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
  }

  function lockOpen() {
    window.__kafeSubAllowClose = false;
    window.__kafeSubLock = true;
    injectInAppCSS();
    styleTransparent();
    startKeepAlive();

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
    if (typeof prev !== 'function' || prev.__kafeHoldWrapV4) return;
    var wrapped = function () {
      window.__kafeSubAllowClose = true;
      window.__kafeSubLock = false;
      var ret = prev.apply(this, arguments);
      var after = function () {
        lockOpen();
        setTimeout(lockOpen, 50);
        setTimeout(lockOpen, 200);
        setTimeout(lockOpen, 500);
        setTimeout(lockOpen, 1000);
      };
      if (ret && typeof ret.then === 'function') ret.then(after).catch(after);
      else after();
      return ret;
    };
    wrapped.__kafeHoldWrapV4 = true;
    window.openSubscriptionPurchase = wrapped;
  }

  // خنثی‌سازی استایل‌های تیره ui-unify روی این مودال
  function neutralizeUnify() {
    var id = 'kafe-kill-unify-sub-dark';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    document.head.appendChild(st); // آخر
    st.textContent = [
      'html body #subscriptionModalBox{background:transparent!important;background-image:none!important;}',
      'html body #subscriptionModalBox > div{',
      '  background:rgba(8,12,24,0.12)!important;background-image:none!important;',
      '  border-radius:0!important;max-width:none!important;width:100%!important;',
      '  max-height:none!important;height:100%!important;margin:0!important;',
      '}'
    ].join('\n');
  }

  try {
    var mo = new MutationObserver(function () {
      var btn = document.getElementById('subscriptionSubmitBtn');
      if (btn && /موفق|ارسال شد/.test(btn.textContent || '')) allowClose();
      var box = document.getElementById('subscriptionModalBox');
      if (box && window.__kafeSubLock) styleTransparent(box);
    });
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  } catch (e) {}

  function bindNavClose() {
    var nav = document.getElementById('bottomNav');
    if (!nav || nav.__kafeHoldNavV4) return;
    nav.__kafeHoldNavV4 = true;
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
    neutralizeUnify();
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
