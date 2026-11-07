/** fix-four-bugs.js — ✕ → pageModals + contrast
 * مالک نمایش شرایط و اسپلش فقط boot-flow-fix.js است.
 */
(function () {
  'use strict';
  if (window.__KAFE_FOUR_BUGS_SAFE_V2__) return;
  window.__KAFE_FOUR_BUGS_SAFE_V2__ = true;

  function injectContrastCSS() {
    if (document.getElementById('kafe-four-bugs-css')) return;
    var css = document.createElement('style');
    css.id = 'kafe-four-bugs-css';
    css.textContent = '.modal-glass .result-value,#hamzadNumber{color:#F0D878!important;-webkit-text-fill-color:#F0D878!important}.modal-glass .result-description,#hamzadDescription{color:#F5F0E4!important}.user-notif-sheet-card,.user-notif-sheet-card *{color:#1a1a1a!important;-webkit-text-fill-color:#1a1a1a!important}.user-notif-sheet-card{background:#fffaf2!important}.admin-inbox-item{color:#F5F0E4!important}#kafeAdminPurchaseDetail,#kafeAdminPurchaseDetail *{color:#111!important;-webkit-text-fill-color:#111!important}#kafeAdminPurchaseDetail>div{background:#fff!important}#notification{color:#fff!important}';
    document.head.appendChild(css);
  }

  function openMainModalsMenu() {
    try {
      var overlay = document.getElementById('menuDrawerOverlay');
      var drawer = document.getElementById('menuDrawer');
      if (overlay) overlay.classList.remove('active');
      if (drawer) drawer.classList.remove('active');
      document.body.style.overflow = '';
    } catch (e) {}

    try {
      if (typeof window.renderModalsHomeGrid === 'function') window.renderModalsHomeGrid();
    } catch (e) {}

    try {
      if (typeof window.scrollToPage === 'function') window.scrollToPage(1);
      else {
        var menuPage = document.getElementById('pageModals');
        if (menuPage) menuPage.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      }
      if (typeof window.updateSwipeDots === 'function') window.updateSwipeDots(1);
      if (typeof window.updateBottomNav === 'function') window.updateBottomNav();
    } catch (e) {}
  }

  function patchCloseModalGlass() {
    var prev = window.closeModalGlass;
    if (typeof prev === 'function' && prev.__kafeSafeClose) return;
    function safeClose(modalId) {
      try {
        var support = document.getElementById('kafeChannelSupport');
        if (support) support.remove();
      } catch (e) {}
      try {
        if (typeof prev === 'function') prev.apply(this, arguments);
        else {
          var modal = document.getElementById(modalId);
          if (modal) modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      } catch (e) {
        try {
          var fallback = document.getElementById(modalId);
          if (fallback) fallback.classList.remove('active');
        } catch (ignored) {}
      }
      setTimeout(openMainModalsMenu, 100);
    }
    safeClose.__kafeSafeClose = true;
    window.closeModalGlass = safeClose;
  }

  function applyAll() {
    injectContrastCSS();
    patchCloseModalGlass();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(applyAll, 0);
      setTimeout(applyAll, 600);
    });
  } else {
    applyAll();
    setTimeout(applyAll, 600);
  }
  window.addEventListener('load', function () { setTimeout(applyAll, 300); });
})();
