/** final-nav-fix.js V3
 * مشاور فنی: بدون حلقه ensurePageOrder؛ sole owner برای scrollToPage/هایلایت
 * نصب فرم خرید وقتی pageBuy با کشیدن فعال و host خالی است
 */
(function () {
  'use strict';
  if (window.__KAFE_FINAL_NAV_FIX_V3__) return;
  window.__KAFE_FINAL_NAV_FIX_V3__ = true;

  var ORDER = ['pageShop', 'pageBuy', 'pageModals', 'pageTools'];
  var LEGACY_NUM = { 0: 'pageShop', 1: 'pageModals', 2: 'pageTools', 3: 'pageBuy' };
  var pageOrderObserver = null;

  function navButtons() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return [];
    return Array.prototype.slice.call(
      nav.querySelectorAll('button.nav-item-bottom')
    );
  }

  function isSettingsOpen() {
    var panel = document.getElementById('settingsPanel');
    if (!panel) return false;
    if (panel.classList.contains('active')) return true;
    var d = panel.style.display;
    return d === 'block' || d === 'flex';
  }

  function currentOrderIds(container) {
    var ids = [];
    Array.prototype.forEach.call(container.children, function (ch) {
      if (ch && ch.id) ids.push(ch.id);
    });
    return ids;
  }

  function desiredPrefixIds(container) {
    var have = {};
    Array.prototype.forEach.call(container.children, function (ch) {
      if (ch && ch.id) have[ch.id] = true;
    });
    // pageBuy ممکن است هنوز ساخته نشده باشد — در desired فقط موجودها
    var out = [];
    ORDER.forEach(function (id) {
      if (have[id] || id === 'pageBuy') out.push(id);
    });
    // اگر pageBuy هنوز در DOM نیست، در مقایسه فقط بقیه را بسنجیم بعد از ساخت
    return out;
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

    // اگر buy هنوز در container نیست، فقط یک‌بار بعد از shop بگذار
    if (buy.parentNode !== container) {
      if (pageOrderObserver) {
        try {
          pageOrderObserver.disconnect();
        } catch (e) {}
      }
      if (shop && shop.parentNode === container) {
        if (shop.nextSibling) container.insertBefore(buy, shop.nextSibling);
        else container.appendChild(buy);
      } else {
        container.insertBefore(buy, container.firstChild);
      }
      if (pageOrderObserver) {
        try {
          pageOrderObserver.observe(container, { childList: true });
        } catch (e2) {}
      }
    }

    // ترتیب فعلی چهار صفحهٔ اصلی
    var cur = [];
    Array.prototype.forEach.call(container.children, function (ch) {
      if (ch && ORDER.indexOf(ch.id) >= 0) cur.push(ch.id);
    });
    var want = ORDER.filter(function (id) {
      return document.getElementById(id);
    });
    if (cur.length === want.length && cur.join(',') === want.join(',')) {
      return; // برابر — هیچ جابه‌جایی
    }

    if (pageOrderObserver) {
      try {
        pageOrderObserver.disconnect();
      } catch (e3) {}
    }

    // فقط pageBuy را بلافاصله بعد از pageShop ببر؛ بقیه را به ترتیب ثابت
    if (shop && buy && shop.parentNode === container) {
      if (shop.nextSibling !== buy) {
        container.insertBefore(buy, shop.nextSibling);
      }
    }
    if (modals && buy && buy.parentNode === container && buy.nextSibling !== modals) {
      // modals بعد از buy
      if (modals.parentNode === container) {
        container.insertBefore(modals, buy.nextSibling);
      }
    }
    if (tools && modals && modals.parentNode === container) {
      if (modals.nextSibling !== tools && tools.parentNode === container) {
        container.insertBefore(tools, modals.nextSibling);
      }
    } else if (tools && buy && buy.parentNode === container && !modals) {
      if (buy.nextSibling !== tools) container.insertBefore(tools, buy.nextSibling);
    }

    // تأیید نهایی بدون rebuild کامل
    if (pageOrderObserver) {
      try {
        pageOrderObserver.observe(container, { childList: true });
      } catch (e4) {}
    }
  }

  var orderTimer = null;
  function scheduleEnsureOrder() {
    if (orderTimer) return;
    orderTimer = setTimeout(function () {
      orderTimer = null;
      ensurePageOrder();
    }, 80);
  }

  function watchPageOrder() {
    var container = document.getElementById('pagesContainer');
    if (!container || container.__kafeOrderWatchV3) return;
    container.__kafeOrderWatchV3 = true;
    try {
      pageOrderObserver = new MutationObserver(function () {
        scheduleEnsureOrder();
      });
      pageOrderObserver.observe(container, { childList: true });
    } catch (e) {}
    ensurePageOrder();
  }

  function getActivePageId() {
    var container = document.getElementById('pagesContainer');
    if (!container) return 'pageShop';
    var cr = container.getBoundingClientRect();
    var bestId = 'pageShop';
    var bestArea = -1;
    Array.prototype.forEach.call(container.children, function (ch) {
      if (!ch || !ch.id) return;
      var r = ch.getBoundingClientRect();
      var left = Math.max(cr.left, r.left);
      var right = Math.min(cr.right, r.right);
      var top = Math.max(cr.top, r.top);
      var bottom = Math.min(cr.bottom, r.bottom);
      var w = right - left;
      var h = bottom - top;
      var area = w > 0 && h > 0 ? w * h : 0;
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
    if (document.getElementById('subscriptionModalBox') && document.getElementById('subscriptionModalBox').parentNode === host) {
      return;
    }
    // اگر فرم جایی دیگر است منتقل کن؛ وگرنه باز کن
    var box = document.getElementById('subscriptionModalBox');
    if (box) {
      host.appendChild(box);
      return;
    }
    if (typeof window.openSubscriptionPurchase === 'function') {
      try {
        window.openSubscriptionPurchase();
        setTimeout(function () {
          var b = document.getElementById('subscriptionModalBox');
          if (b && host && b.parentNode !== host) host.appendChild(b);
        }, 120);
        setTimeout(function () {
          var b2 = document.getElementById('subscriptionModalBox');
          if (b2 && host && b2.parentNode !== host) host.appendChild(b2);
        }, 400);
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
