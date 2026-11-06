/** final-nav-fix.js V2
 * مشاور فنی 2026-11-06:
 * ترتیب صفحات: shop → buy → modals → tools
 * scrollToPage جایگزین (نه wrap) + RTL با getBoundingClientRect
 * هایلایت: shop=0 buy=1 tools=3 | modals هیچ | منو/تنظیمات فقط پنل باز
 * برچسب ● آماده بیرون از دکمه تنظیمات
 */
(function () {
  'use strict';
  if (window.__KAFE_FINAL_NAV_FIX_V2__) return;
  window.__KAFE_FINAL_NAV_FIX_V2__ = true;

  var ORDER = ['pageShop', 'pageBuy', 'pageModals', 'pageTools'];
  // نگاشت شماره قدیمی: 0 shop, 1 modals, 2 tools, 3 buy
  var LEGACY_NUM = { 0: 'pageShop', 1: 'pageModals', 2: 'pageTools', 3: 'pageBuy' };

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

  /* —— ترتیب صفحات —— */
  function ensurePageOrder() {
    var container = document.getElementById('pagesContainer');
    if (!container) return;
    var nodes = {};
    Array.prototype.forEach.call(container.children, function (ch) {
      if (ch && ch.id) nodes[ch.id] = ch;
    });
    // pageBuy اگر نیست بساز (میزبان فرم خرید)
    if (!nodes.pageBuy) {
      var buy = document.createElement('div');
      buy.className = 'page-swipe';
      buy.id = 'pageBuy';
      buy.innerHTML =
        '<div class="page-header" style="text-align:center;margin-bottom:12px;">' +
        '<h2 style="color:#F0D878;font-size:1.1rem;font-weight:800;margin:0;">⭐ خرید اشتراک</h2>' +
        '</div><div id="kafeBuyFormHost"></div>';
      nodes.pageBuy = buy;
    }
    var frag = document.createDocumentFragment();
    var changed = false;
    ORDER.forEach(function (id, i) {
      var n = nodes[id];
      if (!n) return;
      if (container.children[i] !== n) changed = true;
      frag.appendChild(n);
    });
    // بقیه فرزندان ناشناس را ته بگذار
    Array.prototype.forEach.call(
      Array.prototype.slice.call(container.children),
      function (ch) {
        if (ORDER.indexOf(ch.id) === -1) frag.appendChild(ch);
      }
    );
    if (changed || container.children.length !== frag.childNodes.length) {
      container.appendChild(frag);
    }
  }

  var orderTimer = null;
  function scheduleEnsureOrder() {
    if (orderTimer) return;
    orderTimer = setTimeout(function () {
      orderTimer = null;
      ensurePageOrder();
    }, 50);
  }

  function watchPageOrder() {
    var container = document.getElementById('pagesContainer');
    if (!container || container.__kafeOrderWatch) return;
    container.__kafeOrderWatch = true;
    try {
      var mo = new MutationObserver(function () {
        scheduleEnsureOrder();
      });
      mo.observe(container, { childList: true });
    } catch (e) {}
    ensurePageOrder();
  }

  /* —— صفحهٔ فعال با بیشترین هم‌پوشانی —— */
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

  function syncFromScroll() {
    var btns = navButtons();
    if (!btns.length) return;

    // پاک کردن active از همه
    btns.forEach(function (b) {
      b.classList.remove('active');
    });

    // تنظیمات باز → فقط دکمه تنظیمات
    if (isSettingsOpen()) {
      btns.forEach(function (b) {
        var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
        if (label.indexOf('تنظیم') >= 0) b.classList.add('active');
      });
      return;
    }

    var id = getActivePageId();
    // modals → هیچ دکمه active نشود (منو وسط هم نه)
    if (id === 'pageModals') return;

    var map = { pageShop: 0, pageBuy: 1, pageTools: 3 };
    var idx = map[id];
    if (typeof idx === 'number' && btns[idx] && !btns[idx].classList.contains('center-btn')) {
      btns[idx].classList.add('active');
    }
  }

  /* —— scrollToPage جایگزین کامل —— */
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
      // fallback index
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

  /* —— برچسب ● آماده بیرون از نوار —— */
  function fixReadyBadge() {
    var badge =
      document.getElementById('v8NetworkState') ||
      document.querySelector('[id*="NetworkState"]');
    if (!badge) return;
    // اگر داخل دکمه تنظیمات یا bottomNav است بیرون بکش
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
    if (container && !container.__kafeNavScrollV2) {
      container.__kafeNavScrollV2 = true;
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
    if (panel && !panel.__kafeNavSetWatch) {
      panel.__kafeNavSetWatch = true;
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

  // چند بار تا بعد از nav-swipe-fix نسخهٔ ما آخر بماند
  function runKeep() {
    run();
    setTimeout(run, 0);
    setTimeout(run, 300);
    setTimeout(run, 800);
    setTimeout(run, 1500);
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
