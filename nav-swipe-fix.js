/** nav-swipe-fix.js
 * رفع ناوبری نوار پایین:
 * - اجازه swipe افقی بین صفحات + اسکرول عمودی داخل هر صفحه
 * - scrollToPage پایدار با scrollLeft
 */
(function () {
  'use strict';
  if (window.__KAFE_NAV_SWIPE_FIX_V1__) return;
  window.__KAFE_NAV_SWIPE_FIX_V1__ = true;

  function injectCSS() {
    var id = 'kafe-nav-swipe-fix-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '/* ظرف صفحات: افقی بین صفحات + عمودی داخل */',
      '.pages-container, #pagesContainer{',
      '  touch-action: pan-x pan-y !important;',
      '  overflow-x: auto !important;',
      '  overflow-y: hidden !important;',
      '  scroll-snap-type: x mandatory !important;',
      '  -webkit-overflow-scrolling: touch !important;',
      '}',
      '/* محتوای هر صفحه: اسکرول عمودی */',
      '.page-swipe{',
      '  touch-action: pan-y !important;',
      '  overflow-y: auto !important;',
      '  scroll-snap-align: start !important;',
      '  flex: 0 0 100% !important;',
      '}'
    ].join('\n');
  }

  function scrollToPageReliable(index) {
    var container = document.getElementById('pagesContainer');
    if (!container) return;
    var children = container.children;
    var target = children[index];
    if (!target) return;

    var left = target.offsetLeft;
    try {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ left: left, behavior: 'smooth' });
      } else {
        container.scrollLeft = left;
      }
    } catch (e) {
      try { container.scrollLeft = left; } catch (e2) {}
    }

    try {
      if (typeof updateSwipeDots === 'function') updateSwipeDots(index);
      else if (typeof window.updateSwipeDots === 'function') window.updateSwipeDots(index);
    } catch (e3) {}
    try {
      if (typeof updateBottomNav === 'function') updateBottomNav(index);
      else if (typeof window.updateBottomNav === 'function') window.updateBottomNav(index);
    } catch (e4) {}

    // fallback active state on bottom nav for 0 and 2
    try {
      var items = document.querySelectorAll('.bottom-nav .nav-item-bottom');
      var map = { 0: 0, 2: 3 };
      var activeBtn = map[index];
      if (typeof activeBtn === 'number' && items.length) {
        items.forEach(function (item, i) {
          if (i === 2 || i === 4) {
            item.classList.remove('active');
            return;
          }
          item.classList.toggle('active', i === activeBtn);
        });
      }
    } catch (e5) {}
  }

  function patchScrollToPage() {
    window.scrollToPage = scrollToPageReliable;
    // اگر main.js بعداً دوباره تعریف کرد، چند بار محکم می‌کنیم
  }

  function run() {
    injectCSS();
    patchScrollToPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 300);
      setTimeout(run, 1200);
    });
  } else {
    run();
    setTimeout(run, 300);
    setTimeout(run, 1200);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 200);
  });
})();
