/** final-nav-fix.js V4
 * نوار پایین دقیقاً ۵ دکمه:
 * فروشگاه | خرید اشتراک | منو | ابزارها | تنظیمات کاربر
 * ناوبری شبیه تلگرام: رفتن به جلو → ورود صفحه از راست، برگشت → ورود از چپ
 * sole owner برای scrollToPage / هایلایت
 */
(function () {
  'use strict';
  if (window.__KAFE_FINAL_NAV_FIX_V4__) return;
  window.__KAFE_FINAL_NAV_FIX_V4__ = true;
  window.__KAFE_FINAL_NAV_FIX_V3__ = true;

  var ORDER = ['pageShop', 'pageBuy', 'pageModals', 'pageTools'];
  var LEGACY_NUM = { 0: 'pageShop', 1: 'pageBuy', 2: 'pageModals', 3: 'pageTools' };
  var NAV_LABELS = ['فروشگاه', 'خرید اشتراک', 'منو', 'ابزارها', 'تنظیمات کاربر'];
  var pageOrderObserver = null;
  var lastPageId = 'pageShop';

  function navButtons() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return [];
    return Array.prototype.slice.call(nav.querySelectorAll('button.nav-item-bottom'));
  }

  function injectNavMotionCSS() {
    var id = 'kafe-nav-telegram-motion-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '#pagesContainer.kafe-nav-animating{scroll-behavior:auto!important;}',
      '#pagesContainer .page-swipe.kafe-slide-from-right{animation:kafePageFromRight .28s cubic-bezier(0.25,0.8,0.25,1) both;}',
      '#pagesContainer .page-swipe.kafe-slide-from-left{animation:kafePageFromLeft .28s cubic-bezier(0.25,0.8,0.25,1) both;}',
      '@keyframes kafePageFromRight{from{transform:translateX(18%);opacity:.72;}to{transform:translateX(0);opacity:1;}}',
      '@keyframes kafePageFromLeft{from{transform:translateX(-18%);opacity:.72;}to{transform:translateX(0);opacity:1;}}',
      '#settingsPanel.kafe-settings-enter{animation:kafeSettingsFromLeft .28s cubic-bezier(0.25,0.8,0.25,1) both;}',
      '@keyframes kafeSettingsFromLeft{from{transform:translateX(-100%);}to{transform:translateX(0);}}',
      '#menuDrawer.kafe-menu-from-right{animation:kafeMenuFromRight .28s cubic-bezier(0.25,0.8,0.25,1) both;}',
      '@keyframes kafeMenuFromRight{from{transform:translateX(100%);}to{transform:translateX(0);}}'
    ].join('\n');
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
    buy.innerHTML = '<div class="page-header" style="text-align:center;margin-bottom:12px;"><h2 style="color:#F0D878;font-size:1.1rem;font-weight:800;margin:0;">⭐ خرید اشتراک</h2></div><div id="kafeBuyFormHost"></div>';
    return buy;
  }

  function ensurePageOrder() {
    var container = document.getElementById('pagesContainer');
    if (!container) return;
    var shop = document.getElementById('pageShop');
    var buy = ensurePageBuyNode(container);
    var modals = document.getElementById('pageModals');
    var tools = document.getElementById('pageTools');
    if (buy.parentNode !== container) {
      if (pageOrderObserver) { try { pageOrderObserver.disconnect(); } catch (e) {} }
      if (shop && shop.parentNode === container) {
        if (shop.nextSibling) container.insertBefore(buy, shop.nextSibling);
        else container.appendChild(buy);
      } else {
        container.insertBefore(buy, container.firstChild);
      }
      if (pageOrderObserver) { try { pageOrderObserver.observe(container, { childList: true }); } catch (e2) {} }
    }
    var cur = [];
    Array.prototype.forEach.call(container.children, function (ch) {
      if (ch && ORDER.indexOf(ch.id) >= 0) cur.push(ch.id);
    });
    var want = ORDER.filter(function (id) { return document.getElementById(id); });
    if (cur.length === want.length && cur.join(',') === want.join(',')) return;
    if (pageOrderObserver) { try { pageOrderObserver.disconnect(); } catch (e3) {} }
    if (shop && buy && shop.parentNode === container && shop.nextSibling !== buy) container.insertBefore(buy, shop.nextSibling);
    if (modals && buy && buy.parentNode === container && buy.nextSibling !== modals && modals.parentNode === container) container.insertBefore(modals, buy.nextSibling);
    if (tools && modals && modals.parentNode === container && modals.nextSibling !== tools && tools.parentNode === container) container.insertBefore(tools, modals.nextSibling);
    else if (tools && buy && buy.parentNode === container && !modals && buy.nextSibling !== tools) container.insertBefore(tools, buy.nextSibling);
    if (pageOrderObserver) { try { pageOrderObserver.observe(container, { childList: true }); } catch (e4) {} }
  }

  var orderTimer = null;
  function scheduleEnsureOrder() {
    if (orderTimer) return;
    orderTimer = setTimeout(function () { orderTimer = null; ensurePageOrder(); }, 80);
  }

  function watchPageOrder() {
    var container = document.getElementById('pagesContainer');
    if (!container || container.__kafeOrderWatchV4) return;
    container.__kafeOrderWatchV4 = true;
    try {
      pageOrderObserver = new MutationObserver(function () { scheduleEnsureOrder(); });
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
      if (area > bestArea) { bestArea = area; bestId = ch.id; }
    });
    return bestId;
  }

  function maybeMountBuyForm() {
    var host = document.getElementById('kafeBuyFormHost');
    if (!host) return;
    if (host.children && host.children.length > 0) return;
    var box = document.getElementById('subscriptionModalBox');
    if (box) { host.appendChild(box); return; }
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

  function clearSlideClasses(target) {
    if (!target) return;
    try { target.classList.remove('kafe-slide-from-right', 'kafe-slide-from-left'); } catch (e) {}
  }

  function playPageMotion(target, direction) {
    if (!target) return;
    clearSlideClasses(target);
    void target.offsetWidth;
    if (direction === 'forward') target.classList.add('kafe-slide-from-right');
    else if (direction === 'back') target.classList.add('kafe-slide-from-left');
    setTimeout(function () { clearSlideClasses(target); }, 320);
  }

  function syncFromScroll() {
    var btns = navButtons();
    if (!btns.length) return;
    btns.forEach(function (b) { b.classList.remove('active'); });
    if (isSettingsOpen()) { if (btns[4]) btns[4].classList.add('active'); return; }
    var id = getActivePageId();
    lastPageId = id || lastPageId;
    if (id === 'pageBuy') maybeMountBuyForm();
    var map = { pageShop: 0, pageBuy: 1, pageModals: 2, pageTools: 3 };
    var idx = map[id];
    if (typeof idx === 'number' && btns[idx] && !btns[idx].classList.contains('center-btn')) btns[idx].classList.add('active');
    else if (id === 'pageModals' && btns[2]) btns[2].classList.add('active');
  }

  function scrollToPageImpl(arg) {
    ensurePageOrder();
    var container = document.getElementById('pagesContainer');
    if (!container) return;
    var id = null;
    if (typeof arg === 'string') {
      id = arg;
      if (id.indexOf('page') !== 0 && ORDER.indexOf('page' + arg) >= 0) id = 'page' + arg;
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
    var fromId = lastPageId || getActivePageId();
    var fromIdx = ORDER.indexOf(fromId);
    var toIdx = ORDER.indexOf(target.id);
    var direction = 'forward';
    if (fromIdx >= 0 && toIdx >= 0 && toIdx < fromIdx) direction = 'back';
    else if (fromIdx >= 0 && toIdx >= 0 && toIdx > fromIdx) direction = 'forward';
    else if (fromIdx === toIdx) direction = 'none';
    var cr = container.getBoundingClientRect();
    var tr = target.getBoundingClientRect();
    var delta = tr.left - cr.left;
    var nextLeft = container.scrollLeft + delta;
    try { container.classList.add('kafe-nav-animating'); } catch (e0) {}
    try {
      if (typeof container.scrollTo === 'function') container.scrollTo({ left: nextLeft, behavior: direction === 'none' ? 'auto' : 'smooth' });
      else container.scrollLeft = nextLeft;
    } catch (e) {
      try { container.scrollLeft = nextLeft; } catch (e2) {}
    }
    if (direction !== 'none') playPageMotion(target, direction);
    lastPageId = target.id || lastPageId;
    if (target.id === 'pageBuy') maybeMountBuyForm();
    setTimeout(function () {
      try { container.classList.remove('kafe-nav-animating'); } catch (e3) {}
      syncFromScroll();
    }, 80);
    setTimeout(syncFromScroll, 320);
  }

  function installScrollToPage() { window.scrollToPage = scrollToPageImpl; }
  function installUpdateBottomNav() { window.updateBottomNav = function () { syncFromScroll(); }; }

  function lockBottomNavFive() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    var btns = navButtons();
    while (btns.length > 5) {
      var extra = btns.pop();
      try { if (extra && extra.parentNode) extra.parentNode.removeChild(extra); } catch (e) {}
      btns = navButtons();
    }
    btns = navButtons();
    if (btns.length >= 5) {
      for (var i = 0; i < 5; i++) {
        var label = btns[i].querySelector('.nav-label-bottom');
        if (label) label.textContent = NAV_LABELS[i];
        btns[i].setAttribute('type', 'button');
      }
      btns[0].setAttribute('onclick', "scrollToPage('pageShop')");
      btns[1].setAttribute('onclick', "scrollToPage('pageBuy')");
      btns[2].setAttribute('onclick', 'toggleMenuDrawer()');
      btns[2].classList.add('center-btn');
      btns[3].setAttribute('onclick', "scrollToPage('pageTools')");
      btns[4].setAttribute('onclick', 'toggleUserSettings()');
    }
    if (!nav.__kafeNavClickV4) {
      nav.__kafeNavClickV4 = true;
      nav.addEventListener('click', function (ev) {
        var btn = ev.target && ev.target.closest ? ev.target.closest('button.nav-item-bottom') : null;
        if (!btn || !nav.contains(btn)) return;
        var all = navButtons();
        var idx = all.indexOf(btn);
        if (idx < 0) return;
        if (idx === 0) { ev.preventDefault(); scrollToPageImpl('pageShop'); }
        else if (idx === 1) {
          if (typeof window.openBuy === 'function') return;
          ev.preventDefault();
          scrollToPageImpl('pageBuy');
          maybeMountBuyForm();
        } else if (idx === 3) { ev.preventDefault(); scrollToPageImpl('pageTools'); }
      }, true);
    }
  }

  function enhanceSettingsMotion() {
    var panel = document.getElementById('settingsPanel');
    if (!panel || panel.__kafeSettingsMotionV4) return;
    panel.__kafeSettingsMotionV4 = true;
    try {
      var mo = new MutationObserver(function () {
        if (isSettingsOpen()) {
          panel.classList.add('kafe-settings-enter');
          setTimeout(function () { try { panel.classList.remove('kafe-settings-enter'); } catch (e) {} }, 320);
        }
        syncFromScroll();
      });
      mo.observe(panel, { attributes: true, attributeFilter: ['style', 'class'] });
    } catch (e) {}
  }

  function enhanceMenuMotion() {
    var drawer = document.getElementById('menuDrawer');
    if (!drawer || drawer.__kafeMenuMotionV4) return;
    drawer.__kafeMenuMotionV4 = true;
    try {
      var mo = new MutationObserver(function () {
        if (drawer.classList.contains('active')) {
          drawer.classList.add('kafe-menu-from-right');
          setTimeout(function () { try { drawer.classList.remove('kafe-menu-from-right'); } catch (e) {} }, 320);
        }
      });
      mo.observe(drawer, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
  }

  function fixReadyBadge() {
    var badge = document.getElementById('v8NetworkState') || document.querySelector('[id*="NetworkState"]');
    if (!badge) return;
    var nav = document.getElementById('bottomNav');
    if (nav && nav.contains(badge)) document.body.appendChild(badge);
    badge.style.position = 'fixed';
    badge.style.left = '8px';
    badge.style.right = 'auto';
    badge.style.bottom = 'calc(var(--bottom-nav-height, 68px) + 10px)';
    badge.style.zIndex = '40';
    badge.style.pointerEvents = 'none';
  }

  function bindScroll() {
    var container = document.getElementById('pagesContainer');
    if (container && !container.__kafeNavScrollV4) {
      container.__kafeNavScrollV4 = true;
      container.addEventListener('scroll', function () {
        window.requestAnimationFrame(function () {
          lastPageId = getActivePageId();
          syncFromScroll();
        });
      }, { passive: true });
    }
  }

  function run() {
    injectNavMotionCSS();
    installScrollToPage();
    installUpdateBottomNav();
    watchPageOrder();
    ensurePageOrder();
    lockBottomNavFive();
    bindScroll();
    enhanceSettingsMotion();
    enhanceMenuMotion();
    fixReadyBadge();
    syncFromScroll();
  }

  function runKeep() {
    run();
    setTimeout(installScrollToPage, 300);
    setTimeout(lockBottomNavFive, 300);
    setTimeout(installScrollToPage, 1000);
    setTimeout(lockBottomNavFive, 1000);
    setTimeout(installScrollToPage, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runKeep);
  else runKeep();
  window.addEventListener('load', function () { setTimeout(runKeep, 100); });
})();
