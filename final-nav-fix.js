/** final-nav-fix.js V3.1
 * مشاور فنی: بدون حلقه ensurePageOrder؛ sole owner برای scrollToPage/هایلایت
 * نصب فرم خرید وقتی pageBuy فعال است — فقط از طریق mountBuyFormIntoPage (یک مسیر)
 */
(function () {
  'use strict';
  if (window.__KAFE_FINAL_NAV_FIX_V31__) return;
  window.__KAFE_FINAL_NAV_FIX_V31__ = true;

  var ORDER = ['pageShop', 'pageBuy', 'pageModals', 'pageTools'];
  var LEGACY_NUM = { 0: 'pageShop', 1: 'pageModals', 2: 'pageTools', 3: 'pageBuy' };
  var pageOrderObserver = null;

  function navButtons() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return [];
    return Array.prototype.slice.call(nav.querySelectorAll('button.nav-item-bottom'));
  }

  function isSettingsOpen() {
    var panel = document.getElementById('settingsPanel');
    if (!panel) return false;
    if (panel.classList.contains('active')) return true;
    var d = panel.style.display;
    return d === 'block' || d === 'flex';
  }

  function ensurePageBuyNode(container) {
    var buy = document.getElementById('pageBuy');
    if (buy) return buy;
    buy = document.createElement('div');
    buy.className = 'page-swipe';
    buy.id = 'pageBuy';
    buy.innerHTML =
      '<div class="page-header" style="text-align:center;margin-bottom:12px;">' +
      '<h2 style="color:#F0D878;font-size:1.1rem;font-weight:800;margin:0;">⭐ خرید اشتراک</h2>' +
      '</div><div id="kafeBuyFormHost"></div>';
    return buy;
  }

  function ensurePageOrder() {
    var container = document.getElementById('pagesContainer');
    if (!container) return;

    var shop = document.getElementById('pageShop');
    var buy = ensurePageBuyNode(container);
    var modals = document.getElementById('pageModals');
    var tools = document.getElementById('pageTools');

    var desired = [];
    if (shop) desired.push(shop);
    if (buy) desired.push(buy);
    if (modals) desired.push(modals);
    if (tools) desired.push(tools);

    var current = [];
    for (var i = 0; i < container.children.length; i++) {
      var c = container.children[i];
      if (c && (c.id === 'pageShop' || c.id === 'pageBuy' || c.id === 'pageModals' || c.id === 'pageTools')) {
        current.push(c);
      }
    }

    var same =
      current.length === desired.length &&
      current.every(function (node, idx) {
        return node === desired[idx];
      });
    if (same) return;

    if (pageOrderObserver) {
      try {
        pageOrderObserver.disconnect();
      } catch (e) {}
    }

    if (shop && buy && shop.nextSibling !== buy) {
      try {
        container.insertBefore(buy, shop.nextSibling);
      } catch (e2) {}
    } else if (shop && buy && !buy.parentNode) {
      try {
        container.insertBefore(buy, shop.nextSibling);
      } catch (e3) {}
    }

    watchPageOrder();
  }

  function watchPageOrder() {
    var container = document.getElementById('pagesContainer');
    if (!container) return;
    if (pageOrderObserver) {
      try {
        pageOrderObserver.disconnect();
      } catch (e) {}
    }
    try {
      pageOrderObserver = new MutationObserver(function () {
        ensurePageOrder();
      });
      pageOrderObserver.observe(container, { childList: true });
    } catch (e4) {}
  }

  function getActivePageId() {
    var container = document.getElementById('pagesContainer');
    if (!container) return 'pageShop';
    var cr = container.getBoundingClientRect();
    var bestId = 'pageShop';
    var bestArea = -1;
    Array.prototype.forEach.call(container.children, function (ch) {
      if (!ch || !ch.id) return;
      if (ORDER.indexOf(ch.id) < 0) return;
      var r = ch.getBoundingClientRect();
      var left = Math.max(r.left, cr.left);
      var right = Math.min(r.right, cr.right);
      var top = Math.max(r.top, cr.top);
      var bottom = Math.min(r.bottom, cr.bottom);
      var area = Math.max(0, right - left) * Math.max(0, bottom - top);
      if (area > bestArea) {
        bestArea = area;
        bestId = ch.id;
      }
    });
    return bestId;
  }

  function maybeMountBuyForm() {
    var host = document.getElementById('kafeBuyFormHost');
    if (!host) return;
    if (host.children && host.children.length > 0) return;
    if (typeof window.mountBuyFormIntoPage === 'function') {
      var box = document.getElementById('subscriptionModalBox');
      if (box) {
        window.mountBuyFormIntoPage();
        return;
      }
    }
    if (typeof window.openSubscriptionPurchase === 'function') {
      try {
        var ret = window.openSubscriptionPurchase();
        function after() {
          if (typeof window.mountBuyFormIntoPage === 'function') window.mountBuyFormIntoPage();
          else {
            var b = document.getElementById('subscriptionModalBox');
            if (b && host && b.parentNode !== host) host.appendChild(b);
          }
        }
        if (ret && typeof ret.then === 'function') ret.then(after).catch(after);
        else after();
      } catch (e) {}
    }
  }

  function syncFromScroll() {
    var btns = navButtons();
    if (!btns.length) return;

    btns.forEach(function (b) {
      b.classList.remove('active');
    });

    if (isSettingsOpen()) {
      btns.forEach(function (b) {
        var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
        if (label.indexOf('تنظیم') >= 0) b.classList.add('active');
      });
      return;
    }

    var id = getActivePageId();
    if (id === 'pageBuy') {
      maybeMountBuyForm();
    }
    if (id === 'pageModals') return;

    var map = { pageShop: 0, pageBuy: 1, pageTools: 3 };
    var idx = map[id];
    if (typeof idx === 'number' && btns[idx] && !btns[idx].classList.contains('center-btn')) {
      btns[idx].classList.add('active');
    }
  }

  function scrollToPageImpl(arg) {
    ensurePageOrder();
    var container = document.getElementById('pagesContainer');
    if (!container) return;

    var id = null;
    if (typeof arg === 'string') {
      id = arg;
      if (id.indexOf('page') !== 0 && ORDER.indexOf('page' + arg) >= 0) {
        id = 'page' + arg;
      }
    } else if (typeof arg === 'number') {
      id = LEGACY_NUM[arg] || ORDER[arg] || null;
    }
    if (!id) id = 'pageShop';

    var target = document.getElementById(id);
    if (!target || target.parentNode !== container) {
      var ix = ORDER.indexOf(id);
      target = container.children[ix >= 0 ? ix : 0];
    }
    if (!target) return;

    var cr = container.getBoundingClientRect();
    var tr = target.getBoundingClientRect();
    var delta = tr.left - cr.left;
    var nextLeft = container.scrollLeft + delta;
    try {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ left: nextLeft, behavior: 'smooth' });
      } else {
        container.scrollLeft = nextLeft;
      }
    } catch (e) {
      try {
        container.scrollLeft = nextLeft;
      } catch (e2) {}
    }
    setTimeout(syncFromScroll, 80);
    setTimeout(syncFromScroll, 320);
  }

  function installScrollToPage() {
    window.scrollToPage = scrollToPageImpl;
  }

  function installUpdateBottomNav() {
    window.updateBottomNav = function () {
      syncFromScroll();
    };
  }

  function fixReadyBadge() {
    var badge =
      document.getElementById('v8NetworkState') ||
      document.querySelector('[id*="NetworkState"]');
    if (!badge) return;
    var nav = document.getElementById('bottomNav');
    var settingsBtn = null;
    navButtons().forEach(function (b) {
      var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
      if (label.indexOf('تنظیم') >= 0) settingsBtn = b;
    });
    if (settingsBtn && settingsBtn.contains(badge)) {
      document.body.appendChild(badge);
    }
    if (nav && nav.contains(badge)) {
      document.body.appendChild(badge);
    }
    badge.style.position = 'fixed';
    badge.style.left = '8px';
    badge.style.right = 'auto';
    badge.style.bottom = 'calc(var(--bottom-nav-height, 68px) + 10px)';
    badge.style.zIndex = '40';
    badge.style.pointerEvents = 'none';
    badge.style.font = '700 10px sans-serif';
    badge.style.padding = '5px 8px';
    badge.style.borderRadius = '12px';
    badge.style.background = 'rgba(20,20,40,.88)';
    badge.style.color = '#f5d76e';
  }

  function bindScroll() {
    var container = document.getElementById('pagesContainer');
    if (container && !container.__kafeNavScrollV3) {
      container.__kafeNavScrollV3 = true;
      container.addEventListener(
        'scroll',
        function () {
          window.requestAnimationFrame(syncFromScroll);
        },
        { passive: true }
      );
    }
  }

  function bindSettingsWatch() {
    var panel = document.getElementById('settingsPanel');
    if (panel && !panel.__kafeNavSetWatchV3) {
      panel.__kafeNavSetWatchV3 = true;
      try {
        var mo = new MutationObserver(function () {
          syncFromScroll();
        });
        mo.observe(panel, {
          attributes: true,
          attributeFilter: ['style', 'class']
        });
      } catch (e) {}
    }
  }

  function run() {
    installScrollToPage();
    installUpdateBottomNav();
    watchPageOrder();
    ensurePageOrder();
    bindScroll();
    bindSettingsWatch();
    fixReadyBadge();
    syncFromScroll();
  }

  function runKeep() {
    run();
    setTimeout(installScrollToPage, 300);
    setTimeout(installScrollToPage, 1000);
    setTimeout(installScrollToPage, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runKeep);
  } else {
    runKeep();
  }
  window.addEventListener('load', function () {
    setTimeout(runKeep, 100);
  });
})();
