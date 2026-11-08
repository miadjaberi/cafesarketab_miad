/** final-nav-fix.js V5
 * نوار ۵ دکمه + حرکت نرم
 * رفع یخ‌زدگی: maybeMountBuyForm دیگر openSubscriptionPurchase را صدا نمی‌زند
 */
(function () {
  'use strict';
  if (window.__KAFE_FINAL_NAV_FIX_V5__) return;
  window.__KAFE_FINAL_NAV_FIX_V5__ = true;
  window.__KAFE_FINAL_NAV_FIX_V4__ = true;

  var ORDER = ['pageShop', 'pageBuy', 'pageModals', 'pageTools'];
  var LEGACY_NUM = { 0: 'pageShop', 1: 'pageBuy', 2: 'pageModals', 3: 'pageTools' };
  var NAV_LABELS = ['فروشگاه', 'خرید اشتراک', 'منو', 'ابزارها', 'تنظیمات کاربر'];
  var pageOrderObserver = null;
  var lastPageId = 'pageShop';
  var scrolling = false;
  var orderTimer = null;

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
      '#pagesContainer{scroll-behavior:smooth;}',
      '#pagesContainer.kafe-nav-animating{scroll-behavior:auto!important;}',
      '#pagesContainer .page-swipe.kafe-slide-from-right{animation:kafePageFromRight .22s ease-out both;}',
      '#pagesContainer .page-swipe.kafe-slide-from-left{animation:kafePageFromLeft .22s ease-out both;}',
      '@keyframes kafePageFromRight{from{transform:translateX(12%);opacity:.85;}to{transform:translateX(0);opacity:1;}}',
      '@keyframes kafePageFromLeft{from{transform:translateX(-12%);opacity:.85;}to{transform:translateX(0);opacity:1;}}',
      '#settingsPanel.kafe-settings-enter{animation:kafeSettingsFromLeft .22s ease-out both;}',
      '@keyframes kafeSettingsFromLeft{from{transform:translateX(-100%);}to{transform:translateX(0);}}',
      '#menuDrawer.kafe-menu-from-right{animation:kafeMenuFromRight .22s ease-out both;}',
      '@keyframes kafeMenuFromRight{from{transform:translateX(100%);}to{transform:translateX(0);}}'
    ].join('\n');
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

  function scheduleEnsureOrder() {
    if (orderTimer) return;
    orderTimer = setTimeout(function () { orderTimer = null; ensurePageOrder(); }, 80);
  }

  function watchPageOrder() {
    var container = document.getElementById('pagesContainer');
    if (!container || container.__kafeOrderWatchV5) return;
    container.__kafeOrderWatchV5 = true;
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
    if (window.__kafeBuyMounting) return;
    var host = document.getElementById('kafeBuyFormHost');
    if (!host) return;
    if (host.querySelector('#subscriptionModalBox')) return;
    var box = document.getElementById('subscriptionModalBox');
    if (box && box.parentNode !== host) {
      try { host.appendChild(box); } catch (e) {}
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
    setTimeout(function () { clearSlideClasses(target); }, 260);
  }

  function setActiveNav(id) {
    var btns = navButtons();
    btns.forEach(function (b) { b.classList.remove('active'); });
    var map = { pageShop: 0, pageBuy: 1, pageModals: 2, pageTools: 3 };
    if (isSettingsOpen()) {
      if (btns[4]) btns[4].classList.add('active');
      return;
    }
    var ix = map[id];
    if (typeof ix === 'number' && btns[ix]) btns[ix].classList.add('active');
  }

  function isSettingsOpen() {
    var panel = document.getElementById('settingsPanel');
    if (!panel) return false;
    var d = panel.style.display;
    return d === 'block' || d === 'flex' || panel.classList.contains('active');
  }

  function scrollToPageImpl(arg) {
    if (scrolling) return;
    ensurePageOrder();
    var id = null;
    if (typeof arg === 'string') {
      id = arg;
      if (id.indexOf('page') !== 0 && ORDER.indexOf('page' + arg) >= 0) id = 'page' + arg;
    } else if (typeof arg === 'number') {
      id = LEGACY_NUM[arg] || ORDER[arg] || null;
    }
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    var fromId = lastPageId || getActivePageId();
    var fromIdx = ORDER.indexOf(fromId);
    var toIdx = ORDER.indexOf(target.id);
    var direction = 'forward';
    if (fromIdx >= 0 && toIdx >= 0 && toIdx < fromIdx) direction = 'back';

    scrolling = true;
    var container = document.getElementById('pagesContainer');
    if (container) container.classList.add('kafe-nav-animating');
    playPageMotion(target, direction);
    try {
      target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    } catch (e) {
      try { target.scrollIntoView(true); } catch (e2) {}
    }
    lastPageId = target.id;
    setActiveNav(target.id);
    if (target.id === 'pageBuy') maybeMountBuyForm();
    setTimeout(function () {
      scrolling = false;
      if (container) container.classList.remove('kafe-nav-animating');
      setActiveNav(lastPageId);
    }, 280);
  }

  function installScrollToPage() { window.scrollToPage = scrollToPageImpl; }
  function installUpdateBottomNav() {
    window.updateBottomNav = function () { setActiveNav(getActivePageId()); };
  }

  function openBuySafely() {
    if (window.__kafeBuyMounting) {
      scrollToPageImpl('pageBuy');
      return;
    }
    if (typeof window.kafeOpenBuyPage === 'function') {
      try { window.kafeOpenBuyPage(); return; } catch (e) {}
    }
    scrollToPageImpl('pageBuy');
    if (typeof window.__kafeOpenSubscriptionCore === 'function') {
      window.__kafeBuyMounting = true;
      try { window.__kafeOpenSubscriptionCore(); } catch (e2) {}
      setTimeout(function () {
        maybeMountBuyForm();
        window.__kafeBuyMounting = false;
      }, 150);
    }
  }

  function lockBottomNavFive() {
    var btns = navButtons();
    if (btns.length < 5) return;
    for (var i = 0; i < btns.length; i++) {
      if (i >= 5) {
        try { btns[i].style.display = 'none'; } catch (e) {}
        continue;
      }
      var lab = btns[i].querySelector('.nav-label-bottom');
      if (lab && NAV_LABELS[i]) lab.textContent = NAV_LABELS[i];
    }
    btns[0].setAttribute('onclick', "scrollToPage('pageShop')");
    btns[1].setAttribute('onclick', 'void(0)');
    btns[2].setAttribute('onclick', 'toggleMenuDrawer()');
    btns[3].setAttribute('onclick', "scrollToPage('pageTools')");
    if (!btns[1].__kafeBuyClickV5) {
      btns[1].__kafeBuyClickV5 = true;
      btns[1].addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        openBuySafely();
      }, true);
    }
    if (!btns[0].__kafeNavClickV5) {
      btns[0].__kafeNavClickV5 = true;
      btns[0].addEventListener('click', function (ev) {
        ev.preventDefault();
        scrollToPageImpl('pageShop');
      }, true);
    }
    if (!btns[3].__kafeNavClickV5) {
      btns[3].__kafeNavClickV5 = true;
      btns[3].addEventListener('click', function (ev) {
        ev.preventDefault();
        scrollToPageImpl('pageTools');
      }, true);
    }
  }

  function syncFromScroll() {
    if (scrolling) return;
    lastPageId = getActivePageId();
    setActiveNav(lastPageId);
  }

  function enhanceSettingsMotion() {
    var panel = document.getElementById('settingsPanel');
    if (!panel || panel.__kafeSettingsMotionV5) return;
    panel.__kafeSettingsMotionV5 = true;
    try {
      var mo = new MutationObserver(function () {
        if (isSettingsOpen()) {
          panel.classList.add('kafe-settings-enter');
          setTimeout(function () { try { panel.classList.remove('kafe-settings-enter'); } catch (e) {} }, 260);
        }
        syncFromScroll();
      });
      mo.observe(panel, { attributes: true, attributeFilter: ['style', 'class'] });
    } catch (e) {}
  }

  function enhanceMenuMotion() {
    var drawer = document.getElementById('menuDrawer');
    if (!drawer || drawer.__kafeMenuMotionV5) return;
    drawer.__kafeMenuMotionV5 = true;
    try {
      var mo = new MutationObserver(function () {
        if (drawer.classList.contains('active')) {
          drawer.classList.add('kafe-menu-from-right');
          setTimeout(function () { try { drawer.classList.remove('kafe-menu-from-right'); } catch (e) {} }, 260);
        }
      });
      mo.observe(drawer, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
  }

  function bindScroll() {
    var container = document.getElementById('pagesContainer');
    if (container && !container.__kafeNavScrollV5) {
      container.__kafeNavScrollV5 = true;
      container.addEventListener('scroll', function () {
        window.requestAnimationFrame(function () { syncFromScroll(); });
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
    syncFromScroll();
  }

  function runKeep() {
    run();
    setTimeout(installScrollToPage, 300);
    setTimeout(lockBottomNavFive, 300);
    setTimeout(installScrollToPage, 1000);
    setTimeout(lockBottomNavFive, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runKeep);
  else runKeep();
  window.addEventListener('load', function () { setTimeout(runKeep, 80); });
})();
