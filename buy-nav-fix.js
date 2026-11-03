/** buy-nav-fix.js V4
 * فرم خرید اشتراک باید باز بماند (نه اینکه بیاید و برود).
 * علت‌های محتمل قبلی: تداخل ui-unify شفاف، بستن با کلیک ناو، ارتفاع صفر.
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V4__) return;
  window.__KAFE_BUY_NAV_FIX_V4__ = true;

  var openingLock = false;
  var holdTimer = null;

  function notify(msg) {
    try {
      if (typeof showNotification === 'function') showNotification(String(msg), 'info');
    } catch (e) {}
  }

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
    // اگر ارتفاع صفحه کم است، حداقل فضا بگذار
    var vh = window.innerHeight || 600;
    if (headerH + navH > vh - 120) {
      headerH = Math.min(headerH, 120);
      navH = Math.min(navH, 64);
    }
    return { headerH: headerH, navH: navH };
  }

  function stylePurchaseBox() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return false;
    var h = heights();

    // بدون cssText='' تا فلش نمایش ندهد
    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('inset', 'auto', 'important');
    box.style.setProperty('top', h.headerH + 'px', 'important');
    box.style.setProperty('right', '0', 'important');
    box.style.setProperty('bottom', h.navH + 'px', 'important');
    box.style.setProperty('left', '0', 'important');
    box.style.setProperty('width', '100%', 'important');
    box.style.setProperty('min-height', '40vh', 'important');
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
    box.style.setProperty('backdrop-filter', 'none', 'important');
    box.style.setProperty('-webkit-backdrop-filter', 'none', 'important');

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
      sheet.style.setProperty('opacity', '1', 'important');
      sheet.style.setProperty('backdrop-filter', 'none', 'important');
      sheet.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
      sheet.style.setProperty('color', '#F0E6D3', 'important');
    }
    return true;
  }

  function holdOpen() {
    stylePurchaseBox();
    if (holdTimer) clearInterval(holdTimer);
    var n = 0;
    holdTimer = setInterval(function () {
      n++;
      if (!document.getElementById('subscriptionModalBox')) {
        clearInterval(holdTimer);
        holdTimer = null;
        return;
      }
      stylePurchaseBox();
      if (n > 25) {
        clearInterval(holdTimer);
        holdTimer = null;
      }
    }, 80);
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
      var p = document.getElementById('subOrdersPanel');
      if (p) p.style.display = 'none';
    } catch (e) {}
  }

  function enhancePurchaseChrome() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    if (box.querySelector('#kafeOpenSubStatusLink')) return;
    var sheet = box.firstElementChild;
    if (!sheet) return;
    var bar = document.createElement('div');
    bar.id = 'kafeOpenSubStatusLink';
    bar.style.cssText = 'display:flex;gap:8px;margin:0 0 12px;';
    bar.innerHTML =
      '<button type="button" id="kafeBtnSubStatus" style="flex:1;padding:10px;border-radius:12px;border:1px solid rgba(201,168,76,.45);background:rgba(201,168,76,.12);color:#F0D878;font-weight:800;cursor:pointer;font-family:inherit;">📋 وضعیت و سوابق من</button>';
    try {
      sheet.insertBefore(bar, sheet.firstChild);
    } catch (e) {
      sheet.appendChild(bar);
    }
    var btn = document.getElementById('kafeBtnSubStatus');
    if (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var m = document.getElementById('subscriptionModalBox');
        if (m) m.remove();
        if (typeof window.openSubOrdersPanel === 'function') window.openSubOrdersPanel();
      });
    }
  }

  function openFullPurchase() {
    openingLock = true;
    closeOtherLayers();
    notify('فرم خرید اشتراک');

    var opener = window.openSubscriptionPurchase;
    // اگر wrap خودمان است، به هسته برو
    if (typeof opener === 'function') {
      try {
        var ret = opener();
        if (ret && typeof ret.then === 'function') {
          ret
            .then(function () {
              stylePurchaseBox();
              enhancePurchaseChrome();
              holdOpen();
            })
            .catch(function () {
              stylePurchaseBox();
              holdOpen();
            });
        } else {
          stylePurchaseBox();
          enhancePurchaseChrome();
          holdOpen();
        }
      } catch (e) {
        console.warn('[buy-nav]', e);
        notify('خطا در باز کردن فرم');
      }
    } else {
      notify('فرم خرید در دسترس نیست');
    }

    setTimeout(function () {
      openingLock = false;
    }, 700);
  }

  function wrapPurchaseOpener() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function') return;
    if (prev.__kafeBuyNavV4) return;

    var wrapped = function () {
      var ret = prev.apply(this, arguments);
      // بعد از ساخت فرم، ظاهر پایدار
      var apply = function () {
        stylePurchaseBox();
        enhancePurchaseChrome();
        holdOpen();
      };
      if (ret && typeof ret.then === 'function') {
        ret.then(apply).catch(apply);
      } else {
        apply();
      }
      return ret;
    };
    wrapped.__kafeBuyNavV4 = true;
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
    if (!buyBtn || buyBtn.__kafeBuyBoundV4) return;
    buyBtn.__kafeBuyBoundV4 = true;
    buyBtn.style.pointerEvents = 'auto';
    buyBtn.style.cursor = 'pointer';
    buyBtn.setAttribute('onclick', 'void(0)');
    buyBtn.addEventListener(
      'click',
      function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
        openFullPurchase();
      },
      true
    );
  }

  function bindOtherNavClose() {
    var nav = document.getElementById('bottomNav');
    if (!nav || nav.__kafeBuyCloseBoundV4) return;
    nav.__kafeBuyCloseBoundV4 = true;
    nav.addEventListener(
      'click',
      function (ev) {
        if (openingLock) return;
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

  // خنثی‌سازی استایل شفاف ui-unify روی این مودال
  function injectSolidCSS() {
    var id = 'kafe-buy-solid-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '#subscriptionModalBox{',
      '  background:#0b1120!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  opacity:1!important;visibility:visible!important;',
      '  align-items:stretch!important;justify-content:flex-start!important;',
      '  padding:0!important;border-radius:0!important;',
      '}',
      '#subscriptionModalBox > div{',
      '  background:#0b1120!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  opacity:1!important;',
      '  max-width:none!important;width:100%!important;',
      '  max-height:none!important;height:100%!important;',
      '  margin:0!important;border-radius:0!important;',
      '  box-shadow:none!important;',
      '}'
    ].join('\n');
  }

  function run() {
    injectSolidCSS();
    wrapPurchaseOpener();
    bindBuyButton();
    bindOtherNavClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 600);
      setTimeout(run, 1600);
    });
  } else {
    run();
    setTimeout(run, 600);
    setTimeout(run, 1600);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 400);
  });
})();
