/** buy-nav-fix.js V7
 * دکمه خرید = داخل قالب اپ (مثل فروشگاه / منوی مودال‌ها)
 * بین هدر و نوار پایین، پس‌زمینه برنامه دیده شود
 * بدون MutationObserver / بدون patch روی Element.remove
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V7__) return;
  window.__KAFE_BUY_NAV_FIX_V7__ = true;

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

  function injectCSS() {
    var id = 'kafe-buy-page-frame-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '#kafeBuyPageFrame{',
      '  position:fixed;',
      '  left:0;right:0;',
      '  z-index:40;',
      '  display:none;',
      '  flex-direction:column;',
      '  box-sizing:border-box;',
      '  padding:10px 12px 12px;',
      '  overflow:hidden;',
      '  background:transparent;',
      '  pointer-events:auto;',
      '}',
      '#kafeBuyPageFrame.is-open{display:flex;}',
      '/* فرم خرید داخل فریم — نه اورلی تمام‌صفحه */',
      '#kafeBuyPageFrame #subscriptionModalBox{',
      '  position:relative!important;',
      '  inset:auto!important;',
      '  top:auto!important;bottom:auto!important;left:auto!important;right:auto!important;',
      '  width:100%!important;height:100%!important;',
      '  max-width:none!important;',
      '  display:flex!important;',
      '  flex-direction:column!important;',
      '  background:transparent!important;',
      '  backdrop-filter:none!important;',
      '  z-index:1!important;',
      '  padding:0!important;margin:0!important;',
      '  opacity:1!important;visibility:visible!important;',
      '  pointer-events:auto!important;',
      '}',
      '#kafeBuyPageFrame #subscriptionModalBox > div{',
      '  width:100%!important;max-width:none!important;',
      '  height:100%!important;max-height:none!important;',
      '  margin:0!important;',
      '  overflow-y:auto!important;',
      '  /* مثل کارت خوش‌آمد فروشگاه */',
      '  background:rgba(255,255,255,0.05)!important;',
      '  backdrop-filter:blur(12px)!important;',
      '  -webkit-backdrop-filter:blur(12px)!important;',
      '  border:1px solid rgba(255,215,0,0.15)!important;',
      '  border-radius:16px!important;',
      '  box-shadow:none!important;',
      '  padding:16px 14px 20px!important;',
      '  color:#F5F0E4!important;',
      '}',
      '#kafeBuyPageFrame #subscriptionModalBox .subscription-plan-btn span{',
      '  color:#1A1208!important;',
      '  -webkit-text-fill-color:#1A1208!important;',
      '  font-weight:900!important;',
      '  background:rgba(255,248,220,0.95)!important;',
      '  border-radius:8px!important;',
      '  padding:3px 8px!important;',
      '  display:inline-block!important;',
      '  margin-top:6px!important;',
      '}'
    ].join('\n');
  }

  function ensureFrame() {
    var frame = document.getElementById('kafeBuyPageFrame');
    if (frame) return frame;
    frame = document.createElement('div');
    frame.id = 'kafeBuyPageFrame';
    frame.setAttribute('aria-label', 'خرید اشتراک');
    var app = document.getElementById('app') || document.body;
    app.appendChild(frame);
    return frame;
  }

  function placeFrame() {
    var frame = ensureFrame();
    var h = heights();
    frame.style.top = h.headerH + 4 + 'px';
    frame.style.bottom = h.navH + 4 + 'px';
    return frame;
  }

  function hidePagesWhileBuy(hide) {
    var pc = document.getElementById('pagesContainer');
    if (!pc) return;
    if (hide) {
      pc.style.visibility = 'hidden';
      pc.style.pointerEvents = 'none';
    } else {
      pc.style.visibility = '';
      pc.style.pointerEvents = '';
    }
  }

  function closeBuyFrame() {
    var frame = document.getElementById('kafeBuyPageFrame');
    if (frame) {
      frame.classList.remove('is-open');
      frame.style.display = 'none';
      // اگر فرم داخل فریم است حذف کن
      var box = document.getElementById('subscriptionModalBox');
      if (box && frame.contains(box)) {
        try {
          box.remove();
        } catch (e) {}
      }
    }
    hidePagesWhileBuy(false);
  }

  function mountPurchaseIntoFrame() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return false;
    var frame = placeFrame();
    // انتقال فرم به داخل فریم صفحه
    if (box.parentNode !== frame) {
      frame.appendChild(box);
    }
    frame.classList.add('is-open');
    frame.style.display = 'flex';
    hidePagesWhileBuy(true);

    // یک‌بار استایل نسبی (نه fixed تمام‌صفحه)
    box.style.position = 'relative';
    box.style.inset = 'auto';
    box.style.top = 'auto';
    box.style.bottom = 'auto';
    box.style.left = 'auto';
    box.style.right = 'auto';
    box.style.width = '100%';
    box.style.height = '100%';
    box.style.zIndex = '1';
    box.style.background = 'transparent';
    box.style.display = 'flex';

    // دکمه‌های ✕ داخل فرم → بستن فریم
    box.querySelectorAll('button').forEach(function (btn) {
      var t = (btn.textContent || '').trim();
      var oc = btn.getAttribute('onclick') || '';
      if (t === '✕' || t === '×' || oc.indexOf('subscriptionModalBox') >= 0) {
        if (btn.__kafeBuyClose) return;
        btn.__kafeBuyClose = true;
        btn.addEventListener(
          'click',
          function () {
            closeBuyFrame();
          },
          true
        );
      }
    });
    return true;
  }

  function openBuy() {
    injectCSS();
    placeFrame();

    if (typeof window.openSubscriptionPurchase !== 'function') {
      try {
        if (typeof showNotification === 'function') showNotification('فرم خرید در دسترس نیست', 'error');
      } catch (e) {}
      return;
    }

    try {
      var ret = window.openSubscriptionPurchase();
      // بعد از ساخته شدن DOM فرم را به فریم منتقل کن (چند تلاش کوتاه، بدون loop دائمی)
      var tries = [50, 150, 350, 700];
      tries.forEach(function (ms) {
        setTimeout(function () {
          mountPurchaseIntoFrame();
        }, ms);
      });
      if (ret && typeof ret.then === 'function') {
        ret
          .then(function () {
            mountPurchaseIntoFrame();
          })
          .catch(function () {
            mountPurchaseIntoFrame();
          });
      }
    } catch (e) {
      console.error('[buy-nav]', e);
    }
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

  function bindBuy() {
    var buyBtn = findBuyButton();
    if (!buyBtn || buyBtn.__kafeBuyV7) return;
    buyBtn.__kafeBuyV7 = true;
    buyBtn.setAttribute('onclick', 'void(0)');
    buyBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      openBuy();
    });
  }

  function bindOtherNav() {
    var nav = document.getElementById('bottomNav');
    if (!nav || nav.__kafeBuyNavCloseV7) return;
    nav.__kafeBuyNavCloseV7 = true;
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
        closeBuyFrame();
      },
      true
    );
  }

  // اگر از جاهای دیگر openSubscriptionPurchase صدا زده شد هم داخل فریم بگذار
  function wrapOpen() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function' || prev.__kafeBuyPageWrap) return;
    var wrapped = function () {
      var ret = prev.apply(this, arguments);
      setTimeout(mountPurchaseIntoFrame, 80);
      setTimeout(mountPurchaseIntoFrame, 300);
      return ret;
    };
    wrapped.__kafeBuyPageWrap = true;
    window.openSubscriptionPurchase = wrapped;
  }

  function run() {
    injectCSS();
    ensureFrame();
    bindBuy();
    bindOtherNav();
    wrapOpen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 100);
    });
  } else {
    setTimeout(run, 100);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 250);
  });
})();
