/** buy-nav-fix.js V9
 * خرید = صفحه pageBuy؛ بدون highlightBuyNav (مالک هایلایت: final-nav-fix)
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V9__) return;
  window.__KAFE_BUY_NAV_FIX_V9__ = true;

  var BUY_PAGE_ID = 'pageBuy';

  function injectCSS() {
    var id = 'kafe-buy-page-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '#' + BUY_PAGE_ID + '{',
      '  box-sizing:border-box!important;',
      '  padding:12px 12px 80px!important;',
      '}',
      '#' + BUY_PAGE_ID + ' #subscriptionModalBox{',
      '  position:relative!important;',
      '  inset:auto!important;',
      '  top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;',
      '  width:100%!important;height:auto!important;min-height:60vh!important;',
      '  max-width:none!important;',
      '  display:flex!important;flex-direction:column!important;',
      '  background:transparent!important;',
      '  z-index:1!important;padding:0!important;margin:0!important;',
      '  opacity:1!important;visibility:visible!important;',
      '  pointer-events:auto!important;',
      '  border:none!important;box-shadow:none!important;',
      '}',
      '#' + BUY_PAGE_ID + ' #subscriptionModalBox > div{',
      '  width:100%!important;max-width:none!important;',
      '  height:auto!important;max-height:none!important;',
      '  margin:0!important;',
      '  background:rgba(255,255,255,0.05)!important;',
      '  backdrop-filter:blur(12px)!important;',
      '  -webkit-backdrop-filter:blur(12px)!important;',
      '  border:1px solid rgba(255,215,0,0.15)!important;',
      '  border-radius:16px!important;',
      '  box-shadow:none!important;',
      '  padding:16px 14px 24px!important;',
      '  color:#F5F0E4!important;',
      '  overflow:visible!important;',
      '}',
      '#' + BUY_PAGE_ID + ' #subscriptionModalBox .subscription-plan-btn span{',
      '  color:#1A1208!important;-webkit-text-fill-color:#1A1208!important;',
      '  font-weight:900!important;',
      '  background:rgba(255,248,220,0.95)!important;',
      '  border-radius:8px!important;padding:3px 8px!important;',
      '  display:inline-block!important;margin-top:6px!important;',
      '}'
    ].join('\n');
  }

  function ensureBuyPage() {
    var container = document.getElementById('pagesContainer');
    if (!container) return null;
    var page = document.getElementById(BUY_PAGE_ID);
    if (page) return page;
    page = document.createElement('div');
    page.className = 'page-swipe';
    page.id = BUY_PAGE_ID;
    page.innerHTML =
      '<div class="page-header" style="text-align:center;margin-bottom:12px;">' +
      '<h2 style="color:#F0D878;font-size:1.1rem;font-weight:800;margin:0;">⭐ خرید اشتراک</h2>' +
      '<p style="color:#C8C0B0;font-size:0.8rem;margin:6px 0 0;">انتخاب طرح و ارسال فیش</p>' +
      '</div>' +
      '<div id="kafeBuyFormHost"></div>';
    var shop = document.getElementById('pageShop');
    if (shop && shop.parentNode === container) {
      if (shop.nextSibling) container.insertBefore(page, shop.nextSibling);
      else container.appendChild(page);
    } else {
      container.appendChild(page);
    }
    return page;
  }

  function mountFormIntoPage() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return false;
    var page = ensureBuyPage();
    if (!page) return false;
    var host = document.getElementById('kafeBuyFormHost') || page;
    if (box.parentNode !== host) host.appendChild(box);
    box.style.position = 'relative';
    box.style.inset = 'auto';
    box.style.width = '100%';
    box.style.height = 'auto';
    box.style.background = 'transparent';
    box.style.display = 'flex';
    box.style.zIndex = '1';
    return true;
  }

  function openBuy() {
    injectCSS();
    ensureBuyPage();
    function go() {
      mountFormIntoPage();
      if (typeof window.scrollToPage === 'function') {
        window.scrollToPage('pageBuy');
      }
    }
    if (typeof window.openSubscriptionPurchase === 'function') {
      try {
        var ret = window.openSubscriptionPurchase();
        setTimeout(go, 60);
        setTimeout(go, 200);
        setTimeout(go, 500);
        if (ret && typeof ret.then === 'function') ret.then(go).catch(go);
      } catch (e) {
        go();
      }
    } else {
      go();
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
    if (!buyBtn || buyBtn.__kafeBuyV9) return;
    buyBtn.__kafeBuyV9 = true;
    buyBtn.setAttribute('onclick', 'void(0)');
    buyBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      openBuy();
    });
  }

  function wrapOpen() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function' || prev.__kafeBuyPageWrapV9) return;
    var wrapped = function () {
      var ret = prev.apply(this, arguments);
      setTimeout(mountFormIntoPage, 80);
      setTimeout(mountFormIntoPage, 250);
      return ret;
    };
    wrapped.__kafeBuyPageWrapV9 = true;
    window.openSubscriptionPurchase = wrapped;
  }

  function run() {
    injectCSS();
    ensureBuyPage();
    bindBuy();
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
