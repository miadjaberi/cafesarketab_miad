/** nav-swipe-fix.js V2
 * فقط CSS لمسی/اسکرول — بدون انتساب scrollToPage یا هایلایت نوار
 * (مالک نهایی: final-nav-fix.js)
 */
(function () {
  'use strict';
  if (window.__KAFE_NAV_SWIPE_FIX_V2__) return;
  window.__KAFE_NAV_SWIPE_FIX_V2__ = true;

  function injectCSS() {
    var id = 'kafe-nav-swipe-fix-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '.pages-container, #pagesContainer{',
      '  touch-action: pan-x pan-y !important;',
      '  overflow-x: auto !important;',
      '  overflow-y: hidden !important;',
      '  scroll-snap-type: x mandatory !important;',
      '  -webkit-overflow-scrolling: touch !important;',
      '}',
      '.page-swipe{',
      '  touch-action: pan-y !important;',
      '  overflow-y: auto !important;',
      '  scroll-snap-align: start !important;',
      '  flex: 0 0 100% !important;',
      '}'
    ].join('\n');
  }

  function run() {
    injectCSS();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  window.addEventListener('load', run);
})();
