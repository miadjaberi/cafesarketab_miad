/** buy-nav-fix.js V11
 * مسیر خرید بدون حلقه با final-nav
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V11__) return;
  window.__KAFE_BUY_NAV_FIX_V11__ = true;
  window.__KAFE_BUY_NAV_FIX_V10__ = true;

  var BUY_PAGE_ID = 'pageBuy';
  var mounting = false;

  function injectCSS() {
    var id = 'kafe-buy-page-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      'body > #subscriptionModalBox{opacity:0!important;visibility:hidden!important;pointer-events:none!important;z-index:-1!important;}',
      '#' + BUY_PAGE_ID + '{box-sizing:border-box!important;padding:12px 12px 80px!important;}',
      '#' + BUY_PAGE_ID + ' #subscriptionModalBox{position:relative!important;inset:auto!important;width:100%!important;height:auto!important;min-height:50vh!important;display:flex!important;flex-direction:column!important;background:transparent!important;z-index:1!important;padding:0!important;margin:0!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;border:none!important;box-shadow:none!important;}',
      '#' + BUY_PAGE_ID + ' #subscriptionModalBox > div{width:100%!important;max-width:none!important;margin:0!important;background:rgba(255,255,255,0.05)!important;border:1px solid rgba(255,215,0,0.15)!important;border-radius:16px!important;padding:16px 14px 24px!important;color:#F5F0E4!important;}'
    ].join('\n');
  }

  function ensureBuyPage() {
    var container = document.getElementById('pagesContainer');
    var page = document.getElementById(BUY_PAGE_ID);
    if (!page) {
      page = document.createElement('div');
      page.className = 'page-swipe';
      page.id = BUY_PAGE_ID;
      page.innerHTML = '<div class="page-header" style="text-align:center;margin-bottom:12px;"><h2 style="color:#F0D878;font-size:1.1rem;font-weight:800;margin:0;">⭐ خرید اشتراک</h2></div><div id="kafeBuyFormHost"></div>';
      if (container) {
        var shop = document.getElementById('pageShop');
        if (shop && shop.parentNode === container) {
          if (shop.nextSibling) container.insertBefore(page, shop.nextSibling);
          else container.appendChild(page);
        } else container.appendChild(page);
      }
    }
    if (!document.getElementById('kafeBuyFormHost') && page) {
      var host = document.createElement('div');
      host.id = 'kafeBuyFormHost';
      page.appendChild(host);
    }
    return page;
  }

  function mountFormIntoPage() {
    var host = document.getElementById('kafeBuyFormHost');
    var box = document.getElementById('subscriptionModalBox');
    if (!host || !box) return;
    if (box.parentNode !== host) {
      try { host.appendChild(box); } catch (e) {}
    }
  }

  function scrollToBuyOnly() {
    var page = document.getElementById(BUY_PAGE_ID);
    if (!page) return;
    try { page.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' }); }
    catch (e) { try { page.scrollIntoView(true); } catch (e2) {} }
  }

  function openBuy() {
    if (mounting || window.__kafeBuyMounting) return;
    mounting = true;
    window.__kafeBuyMounting = true;
    injectCSS();
    ensureBuyPage();
    scrollToBuyOnly();

    var core = window.__kafeOpenSubscriptionCore;
    if (typeof core !== 'function' && typeof window.openSubscriptionPurchase === 'function' && !window.openSubscriptionPurchase.__kafeBuyPageWrapV11) {
      core = window.openSubscriptionPurchase;
      window.__kafeOpenSubscriptionCore = core;
    }

    function finish() {
      mountFormIntoPage();
      scrollToBuyOnly();
      mounting = false;
      window.__kafeBuyMounting = false;
    }

    if (typeof core === 'function') {
      try {
        var ret = core();
        if (ret && typeof ret.then === 'function') ret.then(finish).catch(finish);
        else setTimeout(finish, 80);
      } catch (e) { finish(); }
    } else {
      finish();
    }
    setTimeout(function () {
      mounting = false;
      window.__kafeBuyMounting = false;
      mountFormIntoPage();
    }, 600);
  }

  window.kafeOpenBuyPage = openBuy;
  window.mountBuyFormIntoPage = mountFormIntoPage;

  function wrapOpen() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function') return;
    if (prev.__kafeBuyPageWrapV11) return;
    if (!window.__kafeOpenSubscriptionCore) window.__kafeOpenSubscriptionCore = prev;
    var core = window.__kafeOpenSubscriptionCore;
    var wrapped = function () {
      if (window.__kafeBuyMounting) return core.apply(this, arguments);
      injectCSS();
      ensureBuyPage();
      scrollToBuyOnly();
      var ret = core.apply(this, arguments);
      function after() { mountFormIntoPage(); scrollToBuyOnly(); }
      if (ret && typeof ret.then === 'function') ret.then(after).catch(after);
      else setTimeout(after, 50);
      return ret;
    };
    wrapped.__kafeBuyPageWrapV11 = true;
    window.openSubscriptionPurchase = wrapped;
  }

  function bindBuy() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    var buttons = nav.querySelectorAll('button.nav-item-bottom');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.classList.contains('center-btn')) continue;
      var oc = b.getAttribute('onclick') || '';
      var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
      if (oc.indexOf('pageBuy') >= 0 || label.indexOf('خرید') >= 0) {
        if (b.__kafeBuyV11) return;
        b.__kafeBuyV11 = true;
        b.setAttribute('onclick', 'void(0)');
        b.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          openBuy();
        }, true);
        return;
      }
    }
  }

  function boot() {
    injectCSS();
    ensureBuyPage();
    wrapOpen();
    bindBuy();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () {
    setTimeout(boot, 0);
    setTimeout(boot, 400);
  });
  else {
    setTimeout(boot, 0);
    setTimeout(boot, 400);
  }
  window.addEventListener('load', function () { setTimeout(boot, 100); });
})();
