/* هماهنگ‌سازی مسیر صفحه‌ها و مودال پایانی شرایط — بدون تغییر احراز هویت یا داده‌های سرور */
(function () {
  'use strict';
  if (window.__KAFE_UI_FLOW_COHERENCE_V1__) return;
  window.__KAFE_UI_FLOW_COHERENCE_V1__ = true;

  var PAGE_IDS = ['pageShop', 'pageBuy', 'pageModals', 'pageTools'];
  var LEGACY_DOT_PAGE = { 0: 'pageShop', 1: 'pageModals', 2: 'pageTools', 3: 'pageBuy' };

  function pages() {
    var container = document.getElementById('pagesContainer');
    if (!container) return [];
    return PAGE_IDS.map(function (id) { return document.getElementById(id); })
      .filter(function (node) { return node && node.parentNode === container; });
  }

  function ensureDots() {
    var indicator = document.getElementById('swipeIndicator');
    var list = pages();
    if (!indicator || !list.length) return;
    var existing = indicator.querySelectorAll('.swipe-dot');
    if (existing.length !== list.length) {
      indicator.innerHTML = '';
      list.forEach(function (page, index) {
        var dot = document.createElement('span');
        dot.className = 'swipe-dot' + (index === 0 ? ' active' : '');
        dot.setAttribute('aria-hidden', 'true');
        dot.setAttribute('data-page-id', page.id);
        indicator.appendChild(dot);
      });
    } else {
      Array.prototype.forEach.call(existing, function (dot, index) {
        dot.setAttribute('data-page-id', list[index].id);
      });
    }
  }

  function activePageId() {
    var container = document.getElementById('pagesContainer');
    if (!container) return 'pageShop';
    var bounds = container.getBoundingClientRect();
    var best = 'pageShop';
    var bestVisible = -1;
    pages().forEach(function (page) {
      var rect = page.getBoundingClientRect();
      var visible = Math.max(0, Math.min(rect.right, bounds.right) - Math.max(rect.left, bounds.left));
      if (visible > bestVisible) {
        bestVisible = visible;
        best = page.id;
      }
    });
    return best;
  }

  function settingsOpen() {
    var panel = document.getElementById('settingsPanel');
    if (!panel) return false;
    return panel.classList.contains('active') ||
      panel.style.display === 'block' || panel.style.display === 'flex';
  }

  function syncDots(pageId) {
    var indicator = document.getElementById('swipeIndicator');
    if (!indicator) return;
    indicator.querySelectorAll('.swipe-dot').forEach(function (dot) {
      dot.classList.toggle('active', dot.getAttribute('data-page-id') === pageId);
    });
  }

  function syncNavigation() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    var buttons = Array.prototype.slice.call(nav.querySelectorAll('.nav-item-bottom'));
    buttons.forEach(function (button) { button.classList.remove('active'); });
    if (settingsOpen()) {
      var settingsButton = buttons.find(function (button) {
        return (button.textContent || '').indexOf('تنظیمات') >= 0;
      });
      if (settingsButton) settingsButton.classList.add('active');
      return;
    }
    var id = activePageId();
    var index = { pageShop: 0, pageBuy: 1, pageModals: 2, pageTools: 3 }[id];
    if (typeof index === 'number' && buttons[index]) buttons[index].classList.add('active');
    syncDots(id);
  }

  window.updateSwipeDots = function (legacyIndex) {
    var pageId = LEGACY_DOT_PAGE[Number(legacyIndex)] || 'pageShop';
    syncDots(pageId);
  };

  function applyTermsTitle() {
    var modal = document.getElementById('developingModal');
    if (!modal) return;
    var title = modal.querySelector('.modal-glass-title');
    if (title && title.textContent.trim() !== 'شرایط') title.textContent = 'شرایط';
    var icon = modal.querySelector('.modal-glass-logo');
    if (icon) icon.textContent = '📜';
    var guide = modal.querySelector('.modal-guide');
    if (guide) guide.textContent = 'متن شرایط و ضوابط کافه سرکتاب میعاد را در همین پنجره مطالعه کنید.';
    var target = document.getElementById('profileTermsContent');
    var source = document.querySelector('#termsScreen .terms-inner');
    if (target && source && !target.children.length) {
      var copy = source.cloneNode(true);
      var footer = copy.querySelector('.terms-footer-bar');
      if (footer) footer.remove();
      copy.querySelectorAll('[id]').forEach(function (node) { node.removeAttribute('id'); });
      copy.style.cssText = 'display:block;flex:none;overflow:visible;max-height:none;width:100%;max-width:none;margin:0;padding:8px 2px 12px;box-sizing:border-box;background:transparent;border:0;border-radius:0;box-shadow:none;';
      target.appendChild(copy);
      target.setAttribute('data-filled', '1');
    }
    var list = window.modalList;
    if (Array.isArray(list)) {
      var item = list.find(function (entry) { return entry && entry.id === 'developingModal'; });
      if (item) item.title = 'شرایط';
    }
    var grid = document.getElementById('modalsHomeGrid');
    if (grid) {
      var card = grid.querySelector('[onclick*="developingModal"]');
      var label = card && card.querySelector('.mh-label');
      if (label && label.textContent.trim() !== 'شرایط') label.textContent = 'شرایط';
    }
  }

  function boot() {
    ensureDots();
    applyTermsTitle();
    syncNavigation();
    var container = document.getElementById('pagesContainer');
    if (container && !container.__kafeFlowSyncBound) {
      container.__kafeFlowSyncBound = true;
      container.addEventListener('scroll', function () {
        ensureDots();
        syncNavigation();
      }, { passive: true });
      /* صفحه خرید ممکن است کمی بعد و توسط buy-nav-fix ساخته شود. */
      try {
        var pageObserver = new MutationObserver(function () {
          ensureDots();
          syncNavigation();
        });
        pageObserver.observe(container, { childList: true });
      } catch (e) {}
    }
    var grid = document.getElementById('modalsHomeGrid');
    if (grid && !grid.__kafeTermsTitleWatch) {
      grid.__kafeTermsTitleWatch = true;
      try {
        var observer = new MutationObserver(function () { applyTermsTitle(); });
        observer.observe(grid, { childList: true, subtree: true, characterData: true });
      } catch (e) {}
    }
    var settings = document.getElementById('settingsPanel');
    if (settings && !settings.__kafeFlowSettingsWatch) {
      settings.__kafeFlowSettingsWatch = true;
      try {
        var settingsObserver = new MutationObserver(syncNavigation);
        settingsObserver.observe(settings, { attributes: true, attributeFilter: ['style', 'class'] });
      } catch (e) {}
    }
    window.addEventListener('resize', function () {
      ensureDots();
      syncNavigation();
    });
    window.addEventListener('load', function () {
      setTimeout(function () { ensureDots(); applyTermsTitle(); syncNavigation(); }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
