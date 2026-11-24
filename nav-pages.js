/** nav-pages.js — مالک نمایش صفحات نوار پایین
 * اسکرول افقی RTL صفحه را نشان نمی‌داد (main.js سنگین است و دست نمی‌خورد).
 * هر دکمه فقط صفحهٔ خودش را با display نشان می‌دهد.
 */
(function () {
  'use strict';
  if (window.__KAFE_NAV_PAGES_V1__) return;
  window.__KAFE_NAV_PAGES_V1__ = true;

  var current = 'pageShop';
  var LABELS = ['فروشگاه', 'خرید', 'منو', 'ابزارها', 'تنظیمات'];

  function injectCSS() {
    var id = 'kafe-nav-pages-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '#pagesContainer.kafe-pages-stack{',
      '  position:fixed !important;',
      '  top:var(--header-height) !important;',
      '  left:0 !important; right:0 !important;',
      '  bottom:calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px)) !important;',
      '  width:auto !important; height:auto !important; max-height:none !important; min-height:0 !important;',
      '  display:block !important; overflow:hidden !important;',
      '  scroll-snap-type:none !important; touch-action:pan-y !important;',
      '  z-index:5 !important; background:transparent !important;',
      '}',
      '#pagesContainer.kafe-pages-stack > .page-swipe{',
      '  display:none !important; position:absolute !important; inset:0 !important;',
      '  width:100% !important; height:100% !important; max-width:none !important;',
      '  flex:none !important; scroll-snap-align:none !important;',
      '  overflow-x:hidden !important; overflow-y:auto !important;',
      '  -webkit-overflow-scrolling:touch !important; touch-action:pan-y !important;',
      '  box-sizing:border-box !important; padding:12px 12px 24px !important;',
      '}',
      '#pagesContainer.kafe-pages-stack > .page-swipe.kafe-page-on{ display:block !important; }',
      '#bottomNav.bottom-nav{',
      '  display:flex !important; visibility:visible !important; opacity:1 !important;',
      '  pointer-events:auto !important; z-index:1200 !important;',
      '  align-items:flex-end !important; justify-content:space-between !important;',
      '  gap:2px !important; padding:4px 6px calc(6px + env(safe-area-inset-bottom,0px)) !important;',
      '  height:calc(var(--bottom-nav-height) + env(safe-area-inset-bottom,0px)) !important;',
      '  overflow:visible !important;',
      '}',
      '#bottomNav .nav-item-bottom{',
      '  flex:1 1 0 !important; max-width:none !important; min-width:0 !important; width:auto !important;',
      '  height:auto !important; min-height:48px !important; overflow:visible !important;',
      '  opacity:1 !important; visibility:visible !important;',
      '}',
      '#bottomNav .nav-icon-bottom{ display:block !important; font-size:18px !important; line-height:1 !important; opacity:1 !important; }',
      '#bottomNav .nav-label-bottom{',
      '  display:block !important; font-size:11px !important; line-height:1.2 !important; font-weight:700 !important;',
      '  opacity:1 !important; visibility:visible !important; white-space:nowrap !important;',
      '  overflow:hidden !important; text-overflow:ellipsis !important; max-width:100% !important;',
      '}',
      '#bottomNav .nav-item-bottom.center-btn{',
      '  flex:0 0 56px !important; width:56px !important; height:56px !important;',
      '  min-width:56px !important; max-width:56px !important; min-height:56px !important;',
      '  margin-top:-18px !important; border-radius:50% !important;',
      '}',
      '#bottomNav .nav-item-bottom.center-btn .nav-label-bottom{ display:none !important; }',
      '#pageBuy .kafe-buy-actions{ display:flex; flex-direction:column; gap:10px; margin-top:14px; }',
      '#pageBuy .kafe-buy-actions button{',
      '  width:100%; min-height:48px; border-radius:14px; border:1px solid rgba(201,168,76,.55);',
      '  background:linear-gradient(135deg,#8F6F28,#C9A84C,#E6C878); color:#0d0f1a;',
      '  font-family:inherit; font-weight:800; font-size:0.95rem; cursor:pointer;',
      '}',
      '#pageBuy .kafe-buy-actions button.ghost{',
      '  background:rgba(255,255,255,.06); color:#F5F0E4;',
      '}'
    ].join('\n');
  }

  function ensurePageBuy() {
    var container = document.getElementById('pagesContainer');
    if (!container) return null;
    var buy = document.getElementById('pageBuy');
    if (!buy) {
      buy = document.createElement('div');
      buy.className = 'page-swipe';
      buy.id = 'pageBuy';
    }
    if (!buy.querySelector('.kafe-buy-actions')) {
      buy.innerHTML =
        '<div class="page-header" style="text-align:center;margin-bottom:8px;">' +
        '<h2>⭐ خرید</h2></div>' +
        '<p style="text-align:center;line-height:1.8;font-size:.9rem;margin:0 0 8px;">خرید اشتراک یا مشاهده سفارش‌ها از همین صفحه انجام می‌شود.</p>' +
        '<div class="kafe-buy-actions">' +
        '<button type="button" id="kafeBuyOpenSub">⭐ خرید اشتراک</button>' +
        '<button type="button" class="ghost" id="kafeBuyOpenOrders">📦 سفارش‌ها و وضعیت اشتراک</button>' +
        '</div>' +
        '<div id="kafeBuyFormHost"></div>';
    }
    var shop = document.getElementById('pageShop');
    var modals = document.getElementById('pageModals');
    var tools = document.getElementById('pageTools');
    if (buy.parentNode !== container) {
      if (shop && shop.nextSibling) container.insertBefore(buy, shop.nextSibling);
      else container.appendChild(buy);
    }
    if (modals && modals.parentNode === container && buy.nextSibling !== modals) {
      container.insertBefore(modals, buy.nextSibling);
    }
    if (tools && tools.parentNode === container && modals && modals.nextSibling !== tools) {
      container.insertBefore(tools, modals.nextSibling);
    }
    var subBtn = document.getElementById('kafeBuyOpenSub');
    var ordBtn = document.getElementById('kafeBuyOpenOrders');
    if (subBtn && !subBtn.__kafeBound) {
      subBtn.__kafeBound = true;
      subBtn.addEventListener('click', function () {
        if (typeof window.openSubscriptionPurchase === 'function') window.openSubscriptionPurchase();
      });
    }
    if (ordBtn && !ordBtn.__kafeBound) {
      ordBtn.__kafeBound = true;
      ordBtn.addEventListener('click', function () {
        if (typeof window.openSubOrdersPanel === 'function') window.openSubOrdersPanel();
      });
    }
    return buy;
  }

  function resolve(arg) {
    if (typeof arg === 'string' && arg) {
      if (arg === 'settings') return 'settings';
      if (document.getElementById(arg)) return arg;
      var alias = { shop: 'pageShop', buy: 'pageBuy', modals: 'pageModals', menu: 'pageModals', tools: 'pageTools' };
      if (alias[arg]) return alias[arg];
    }
    if (typeof arg === 'number') {
      if (arg === 0) return 'pageShop';
      if (arg === 1) return 'pageModals';
      if (arg === 2 || arg === 3) return 'pageTools';
    }
    return null;
  }

  function pageNodes() {
    var container = document.getElementById('pagesContainer');
    if (!container) return [];
    return Array.prototype.filter.call(container.children, function (el) {
      return el.classList && el.classList.contains('page-swipe');
    });
  }

  function setActive(id) {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    var btns = nav.querySelectorAll('button.nav-item-bottom');
    var map = { pageShop: 0, pageBuy: 1, pageModals: 2, pageTools: 3, settings: 4 };
    var ix = map[id];
    for (var i = 0; i < btns.length && i < 5; i++) {
      btns[i].classList.toggle('active', i === ix);
    }
  }

  function closeExtras() {
    try {
      var overlay = document.getElementById('menuDrawerOverlay');
      var drawer = document.getElementById('menuDrawer');
      if (overlay) overlay.classList.remove('active');
      if (drawer) drawer.classList.remove('active');
      document.body.style.overflow = '';
    } catch (e) {}
    try {
      var panel = document.getElementById('settingsPanel');
      if (panel) {
        panel.style.display = 'none';
        panel.classList.remove('active');
      }
    } catch (e2) {}
  }

  function showPage(arg) {
    var id = resolve(arg);
    if (!id || id === 'settings') {
      if (id === 'settings' && typeof window.toggleUserSettings === 'function') {
        var wrapped = window.toggleUserSettings;
        if (!wrapped.__kafeFromShow) window.toggleUserSettings();
      }
      return;
    }
    var container = document.getElementById('pagesContainer');
    if (!container) return;
    container.classList.add('kafe-pages-stack');
    ensurePageBuy();
    var target = document.getElementById(id);
    if (!target) return;
    var changed = current !== id;
    pageNodes().forEach(function (p) {
      var on = p === target || p.id === id;
      p.classList.toggle('kafe-page-on', on);
      if (on) p.style.setProperty('display', 'block', 'important');
      else p.style.setProperty('display', 'none', 'important');
    });
    if (changed) {
      try { target.scrollTop = 0; } catch (e) {}
    }
    current = id;
    closeExtras();
    setActive(id);
    if (id === 'pageModals') {
      try {
        if (typeof window.renderModalsHomeGrid === 'function') window.renderModalsHomeGrid();
      } catch (eM) {}
    }
    try { window.__kafeCurrentPage = id; } catch (eC) {}
  }

  window.kafeShowPage = showPage;
  window.scrollToPage = function (arg) { showPage(arg); };
  window.updateBottomNav = function () { setActive(current); };

  function wireButton(btn, fn) {
    if (!btn) return;
    var fresh = btn.cloneNode(true);
    if (btn.parentNode) btn.parentNode.replaceChild(fresh, btn);
    fresh.setAttribute('type', 'button');
    fresh.onclick = null;
    fresh.removeAttribute('onclick');
    fresh.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
      fn();
    });
    return fresh;
  }

  function bindNav() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    var btns = nav.querySelectorAll('button.nav-item-bottom');
    if (btns.length < 5) return;
    var actions = [
      function () { showPage('pageShop'); },
      function () { showPage('pageBuy'); },
      function () { showPage('pageModals'); },
      function () { showPage('pageTools'); },
      function () {
        setActive('settings');
        if (typeof window.toggleUserSettings === 'function') window.toggleUserSettings();
      }
    ];
    for (var i = 0; i < 5; i++) {
      var lab = btns[i].querySelector('.nav-label-bottom');
      if (lab && LABELS[i]) lab.textContent = LABELS[i];
    }
    var next = [];
    for (var j = 0; j < 5; j++) next.push(wireButton(btns[j], actions[j]));
    for (var k = 0; k < 5; k++) {
      var lab2 = next[k] && next[k].querySelector('.nav-label-bottom');
      if (lab2 && LABELS[k]) lab2.textContent = LABELS[k];
    }
    var all = nav.querySelectorAll('button.nav-item-bottom');
    for (var n = 5; n < all.length; n++) all[n].style.display = 'none';
    setActive(current);
  }

  function armScrollOwner() {
    if (window.scrollToPage !== window.kafeShowPage && window.scrollToPage !== owner) {
      window.scrollToPage = owner;
    }
  }
  function owner(arg) { showPage(arg); }
  window.scrollToPage = owner;
  window.kafeShowPage = showPage;

  function boot(forceShow) {
    injectCSS();
    var container = document.getElementById('pagesContainer');
    if (container) container.classList.add('kafe-pages-stack');
    ensurePageBuy();
    bindNav();
    armScrollOwner();
    var on = document.querySelector('#pagesContainer > .page-swipe.kafe-page-on');
    if (forceShow || !on) showPage(current || 'pageShop');
  }

  function schedule() {
    boot(true);
    [120, 400, 900, 1600, 2800, 4500].forEach(function (t) {
      setTimeout(function () { boot(false); }, t);
    });
    var ticks = 0;
    var timer = setInterval(function () {
      ticks += 1;
      armScrollOwner();
      if (!document.querySelector('#pagesContainer > .page-swipe.kafe-page-on')) boot(false);
      if (ticks > 20) clearInterval(timer);
    }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();
  window.addEventListener('load', function () { setTimeout(function () { boot(false); }, 80); });
})();
