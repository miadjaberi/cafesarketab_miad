/** purchase-hold-fix.js V7
 * ظاهر = کارت خوش‌آمد فروشگاه:
 *   background:rgba(255,255,255,0.05)
 *   backdrop-filter:blur(12px)
 *   border:1px solid rgba(255,215,0,0.15)
 *   border-radius:16px
 * قفل ثبات — دیگر تیره نشود
 */
(function () {
  'use strict';
  if (window.__KAFE_PURCHASE_HOLD_V7__) return;
  window.__KAFE_PURCHASE_HOLD_V7__ = true;

  window.__kafeSubLock = false;
  window.__kafeSubAllowClose = false;

  // استایل مرجع فروشگاه
  var GLASS_BG = 'rgba(255,255,255,0.05)';
  var GLASS_BORDER = '1px solid rgba(255,215,0,0.15)';
  var GLASS_RADIUS = '16px';
  var GLASS_BLUR = 'blur(12px)';

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
    }
    // همیشه آخر head تا برنده شود
    document.head.appendChild(st);
    st.textContent = [
      '/* خرید اشتراک = استایل خوش‌آمد فروشگاه */',
      'html body #subscriptionModalBox{',
      '  position:fixed!important;inset:auto!important;left:0!important;right:0!important;',
      '  z-index:50!important;display:flex!important;flex-direction:column!important;',
      '  align-items:stretch!important;justify-content:flex-start!important;',
      '  background:transparent!important;background-image:none!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  opacity:1!important;visibility:visible!important;pointer-events:auto!important;',
      '  border:none!important;border-radius:0!important;box-shadow:none!important;',
      '  padding:10px 12px!important;margin:0!important;box-sizing:border-box!important;',
      '}',
      'html body #subscriptionModalBox > div{',
      '  width:100%!important;max-width:none!important;',
      '  height:auto!important;max-height:100%!important;flex:1 1 auto!important;',
      '  margin:0!important;',
      '  background:rgba(255,255,255,0.05)!important;',
      '  background-image:none!important;',
      '  backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;',
      '  border:1px solid rgba(255,215,0,0.15)!important;',
      '  border-radius:16px!important;',
      '  box-shadow:none!important;',
      '  overflow-y:auto!important;padding:20px 16px 24px!important;',
      '  color:#F5F0E4!important;opacity:1!important;',
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
      '}',
      '/* خنثی کردن استایل‌های تیرهٔ دیگر */',
      'html body #subscriptionModalBox,',
      'html body #subscriptionModalBox > div{',
      '  background-color:unset;',
      '}'
    ].join('\n');
    // override dark from other sheets with higher specificity after
    st.textContent += [
      '\nhtml body #subscriptionModalBox{background:transparent!important;}',
      'html body #subscriptionModalBox > div{background:rgba(255,255,255,0.05)!important;}'
    ].join('\n');
  }

  function applyShopGlass(box) {
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
    box.style.setProperty('padding', '10px 12px', 'important');
    box.style.setProperty('margin', '0', 'important');
    box.style.setProperty('box-sizing', 'border-box', 'important');
    // لایه بیرونی شفاف کامل
    box.style.setProperty('background', 'transparent', 'important');
    box.style.setProperty('background-image', 'none', 'important');
    box.style.setProperty('backdrop-filter', 'none', 'important');
    box.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
    box.style.setProperty('opacity', '1', 'important');
    box.style.setProperty('visibility', 'visible', 'important');
    box.style.setProperty('pointer-events', 'auto', 'important');
    box.style.setProperty('border', 'none', 'important');
    box.style.setProperty('border-radius', '0', 'important');
    box.style.setProperty('box-shadow', 'none', 'important');

    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('max-width', 'none', 'important');
      sheet.style.setProperty('flex', '1 1 auto', 'important');
      sheet.style.setProperty('height', 'auto', 'important');
      sheet.style.setProperty('max-height', '100%', 'important');
      sheet.style.setProperty('margin', '0', 'important');
      sheet.style.setProperty('overflow-y', 'auto', 'important');
      sheet.style.setProperty('padding', '20px 16px 24px', 'important');
      // دقیقاً مثل کارت خوش‌آمد فروشگاه
      sheet.style.setProperty('background', GLASS_BG, 'important');
      sheet.style.setProperty('background-image', 'none', 'important');
      sheet.style.setProperty('backdrop-filter', GLASS_BLUR, 'important');
      sheet.style.setProperty('-webkit-backdrop-filter', GLASS_BLUR, 'important');
      sheet.style.setProperty('border', GLASS_BORDER, 'important');
      sheet.style.setProperty('border-radius', GLASS_RADIUS, 'important');
      sheet.style.setProperty('box-shadow', 'none', 'important');
      sheet.style.setProperty('opacity', '1', 'important');
      sheet.style.setProperty('color', '#F5F0E4', 'important');
    }

    box.querySelectorAll('.subscription-plan-btn span').forEach(function (sp) {
      sp.style.setProperty('color', '#1A1208', 'important');
      sp.style.setProperty('-webkit-text-fill-color', '#1A1208', 'important');
      sp.style.setProperty('font-weight', '900', 'important');
      sp.style.setProperty('background', 'rgba(255,248,220,0.95)', 'important');
      sp.style.setProperty('border-radius', '8px', 'important');
      sp.style.setProperty('padding', '3px 8px', 'important');
      sp.style.setProperty('display', 'inline-block', 'important');
      sp.style.setProperty('margin-top', '6px', 'important');
    });
  }

  // اگر پس‌زمینه تیره شد دوباره شیشه فروشگاه
  function guardGlass() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box || !window.__kafeSubLock) return;
    var sheet = box.firstElementChild;
    if (!sheet) return;
    var bg = (sheet.style.background || sheet.style.backgroundColor || '').toLowerCase();
    // اگر کسی تیره کرد
    if (
      bg.indexOf('0b1120') >= 0 ||
      bg.indexOf('7,11,20') >= 0 ||
      bg.indexOf('12,16,28') >= 0 ||
      bg.indexOf('#12') >= 0 ||
      bg.indexOf('linear-gradient') >= 0
    ) {
      applyShopGlass(box);
    }
  }

  var guardTimer = null;
  function startGuard() {
    if (guardTimer) clearInterval(guardTimer);
    var n = 0;
    guardTimer = setInterval(function () {
      n++;
      if (!document.getElementById('subscriptionModalBox')) {
        clearInterval(guardTimer);
        guardTimer = null;
        return;
      }
      applyShopGlass();
      if (n > 40) {
        // بعد از ۸ ثانیه فقط هر ۲ ثانیه
        clearInterval(guardTimer);
        guardTimer = setInterval(function () {
          if (!document.getElementById('subscriptionModalBox')) {
            clearInterval(guardTimer);
            guardTimer = null;
            return;
          }
          applyShopGlass();
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
      applyShopGlass(this);
      return;
    }
    return origRemove.apply(this, arguments);
  };

  function allowClose() {
    window.__kafeSubAllowClose = true;
    window.__kafeSubLock = false;
    if (guardTimer) {
      clearInterval(guardTimer);
      guardTimer = null;
    }
  }

  function lockOpen() {
    window.__kafeSubAllowClose = false;
    window.__kafeSubLock = true;
    injectCSS();
    applyShopGlass();
    startGuard();

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
    if (typeof prev !== 'function' || prev.__kafeHoldWrapV7) return;
    var wrapped = function () {
      window.__kafeSubAllowClose = true;
      window.__kafeSubLock = false;
      var ret = prev.apply(this, arguments);
      var after = function () {
        lockOpen();
        setTimeout(lockOpen, 80);
        setTimeout(lockOpen, 300);
        setTimeout(lockOpen, 800);
      };
      if (ret && typeof ret.then === 'function') ret.then(after).catch(after);
      else after();
      return ret;
    };
    wrapped.__kafeHoldWrapV7 = true;
    window.openSubscriptionPurchase = wrapped;
  }

  try {
    var mo = new MutationObserver(function () {
      var btn = document.getElementById('subscriptionSubmitBtn');
      if (btn && /موفق|ارسال شد/.test(btn.textContent || '')) allowClose();
      if (window.__kafeSubLock) applyShopGlass();
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
    if (!nav || nav.__kafeHoldNavV7) return;
    nav.__kafeHoldNavV7 = true;
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
