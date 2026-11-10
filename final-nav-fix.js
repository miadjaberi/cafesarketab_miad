/** final-nav-fix.js V6
 * ۵ دکمه ثابت + ناوبری نرم
 * خرید اشتراک: فقط یک بار اسکرول + یک بار mount — بدون حلقه و بدون یخ‌زدگی
 */
(function () {
  'use strict';
  if (window.__KAFE_FINAL_NAV_FIX_V6__) return;
  window.__KAFE_FINAL_NAV_FIX_V6__ = true;

  var ORDER = ['pageShop', 'pageBuy', 'pageModals', 'pageTools'];
  var LEGACY_NUM = { 0: 'pageShop', 1: 'pageBuy', 2: 'pageModals', 3: 'pageTools' };
  var NAV_LABELS = ['فروشگاه', 'خرید اشتراک', 'منو', 'ابزارها', 'تنظیمات کاربر'];
  var lastPageId = 'pageShop';
  var scrolling = false;
  var openingBuy = false;

  function navButtons() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return [];
    return Array.prototype.slice.call(nav.querySelectorAll('button.nav-item-bottom'));
  }

  function injectCSS() {
    var id = 'kafe-nav-telegram-motion-css';
    if (document.getElementById(id)) return;
    var st = document.createElement('style');
    st.id = id;
    st.textContent = [
      '#pagesContainer{scroll-behavior:smooth;-webkit-overflow-scrolling:touch;}',
      '#pagesContainer .page-swipe.kafe-slide-from-right{animation:kafePageFromRight .2s ease-out both;}',
      '#pagesContainer .page-swipe.kafe-slide-from-left{animation:kafePageFromLeft .2s ease-out both;}',
      '@keyframes kafePageFromRight{from{transform:translateX(10%);opacity:.9;}to{transform:translateX(0);opacity:1;}}',
      '@keyframes kafePageFromLeft{from{transform:translateX(-10%);opacity:.9;}to{transform:translateX(0);opacity:1;}}',
      '#pageBuy{box-sizing:border-box;padding:12px 12px 88px;}',
      '#pageBuy #subscriptionModalBox{position:relative!important;inset:auto!important;width:100%!important;height:auto!important;min-height:40vh;display:flex!important;flex-direction:column!important;background:transparent!important;z-index:1!important;padding:0!important;margin:0!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;border:none!important;box-shadow:none!important;}',
      '#pageBuy #subscriptionModalBox>div{width:100%!important;max-width:none!important;margin:0!important;border-radius:16px!important;}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function ensurePageBuy() {
    var container = document.getElementById('pagesContainer');
    if (!container) return null;
    var buy = document.getElementById('pageBuy');
    if (!buy) {
      buy = document.createElement('div');
      buy.className = 'page-swipe';
      buy.id = 'pageBuy';
      buy.innerHTML = '<div class="page-header" style="text-align:center;margin-bottom:12px;"><h2 style="color:#F0D878;font-size:1.1rem;font-weight:800;margin:0;">⭐ خرید اشتراک</h2></div><div id="kafeBuyFormHost"></div>';
    }
    var shop = document.getElementById('pageShop');
    var modals = document.getElementById('pageModals');
    var tools = document.getElementById('pageTools');
    if (buy.parentNode !== container) {
      if (shop && shop.parentNode === container) container.insertBefore(buy, shop.nextSibling);
      else container.appendChild(buy);
    }
    if (shop && buy.parentNode === container && shop.nextSibling !== buy) container.insertBefore(buy, shop.nextSibling);
    if (modals && buy.parentNode === container && buy.nextSibling !== modals && modals.parentNode === container) container.insertBefore(modals, buy.nextSibling);
    if (tools && modals && modals.parentNode === container && modals.nextSibling !== tools && tools.parentNode === container) container.insertBefore(tools, modals.nextSibling);
    return buy;
  }

  function isSettingsOpen() {
    var panel = document.getElementById('settingsPanel');
    if (!panel) return false;
    var d = panel.style.display;
    return d === 'block' || d === 'flex' || panel.classList.contains('active');
  }

  function setActiveNav(id) {
    var btns = navButtons();
    btns.forEach(function (b) { b.classList.remove('active'); });
    if (isSettingsOpen()) {
      if (btns[4]) btns[4].classList.add('active');
      return;
    }
    var map = { pageShop: 0, pageBuy: 1, pageModals: 2, pageTools: 3 };
    var ix = map[id];
    if (typeof ix === 'number' && btns[ix]) btns[ix].classList.add('active');
  }

  function playMotion(target, dir) {
    if (!target) return;
    try {
      target.classList.remove('kafe-slide-from-right', 'kafe-slide-from-left');
      void target.offsetWidth;
      target.classList.add(dir === 'back' ? 'kafe-slide-from-left' : 'kafe-slide-from-right');
      setTimeout(function () {
        try { target.classList.remove('kafe-slide-from-right', 'kafe-slide-from-left'); } catch (e) {}
      }, 220);
    } catch (e) {}
  }

  function scrollToPageImpl(arg) {
    if (window.__KAFE_NAV_PAGES_V1__ && typeof window.kafeShowPage === 'function') {
      window.kafeShowPage(arg);
      return;
    }
    if (scrolling) return;
    ensurePageBuy();
    var id = null;
    if (typeof arg === 'string') id = arg;
    else if (typeof arg === 'number') id = LEGACY_NUM[arg] || ORDER[arg] || null;
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    var fromIdx = ORDER.indexOf(lastPageId);
    var toIdx = ORDER.indexOf(id);
    var dir = toIdx >= fromIdx ? 'forward' : 'back';

    scrolling = true;
    lastPageId = id;
    setActiveNav(id);
    playMotion(target, dir);
    try {
      target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    } catch (e) {
      try { target.scrollIntoView(true); } catch (e2) {}
    }
    setTimeout(function () { scrolling = false; }, 320);
  }

  function mountBuyOnce() {
    var host = document.getElementById('kafeBuyFormHost');
    if (!host) return;
    if (host.querySelector('#subscriptionModalBox')) return;

    var core = window.__kafeOpenSubscriptionCore;
    if (typeof core !== 'function' && typeof window.openSubscriptionPurchase === 'function') {
      if (!window.openSubscriptionPurchase.__kafeBuyPageWrapV11 && !window.openSubscriptionPurchase.__kafeBuyPageWrapV12) {
        core = window.openSubscriptionPurchase;
        window.__kafeOpenSubscriptionCore = core;
      }
    }
    if (typeof core !== 'function') return;

    window.__kafeBuyMounting = true;
    try {
      var ret = core();
      var finish = function () {
        try {
          var box = document.getElementById('subscriptionModalBox');
          if (box && host && box.parentNode !== host) host.appendChild(box);
        } catch (e) {}
        window.__kafeBuyMounting = false;
      };
      if (ret && typeof ret.then === 'function') ret.then(finish).catch(finish);
      else setTimeout(finish, 60);
    } catch (e) {
      window.__kafeBuyMounting = false;
    }
  }

  function openBuySafely() {
    if (openingBuy) return;
    openingBuy = true;
    setTimeout(function () { openingBuy = false; }, 900);

    ensurePageBuy();
    scrollToPageImpl('pageBuy');
    setTimeout(function () {
      try { mountBuyOnce(); } catch (e) {}
    }, 120);
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

    btns[0].setAttribute('onclick', 'void(0)');
    btns[1].setAttribute('onclick', 'void(0)');
    btns[2].setAttribute('onclick', 'toggleMenuDrawer()');
    btns[3].setAttribute('onclick', 'void(0)');
    if (!btns[4].getAttribute('onclick') || btns[4].getAttribute('onclick').indexOf('toggleUserSettings') < 0) {
      btns[4].setAttribute('onclick', 'toggleUserSettings()');
    }

    if (!btns[0].__kafeNavV6) {
      btns[0].__kafeNavV6 = true;
      btns[0].addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        scrollToPageImpl('pageShop');
      }, true);
    }
    if (!btns[1].__kafeNavV6) {
      btns[1].__kafeNavV6 = true;
      btns[1].addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        openBuySafely();
      }, true);
    }
    if (!btns[3].__kafeNavV6) {
      btns[3].__kafeNavV6 = true;
      btns[3].addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        scrollToPageImpl('pageTools');
      }, true);
    }
  }

  function installScrollToPage() {
    window.scrollToPage = scrollToPageImpl;
    window.updateBottomNav = function () { setActiveNav(lastPageId); };
    window.kafeOpenBuyPage = openBuySafely;
  }

  function run() {
    if (window.__KAFE_NAV_PAGES_V1__) return;
    injectCSS();
    ensurePageBuy();
    installScrollToPage();
    lockBottomNavFive();
    setActiveNav(lastPageId);
  }

  function boot() {
    run();
    setTimeout(run, 200);
    setTimeout(run, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', function () { setTimeout(run, 50); });
})();
