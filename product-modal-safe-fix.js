/* product-modal-safe-fix.js v6 — محصول: safe-area | اشتراک: فقط فضای پایین، ظاهر اصلی */
(function () {
  'use strict';
  if (window.__KAFE_PRODUCT_MODAL_SAFE_V6__) return;
  window.__KAFE_PRODUCT_MODAL_SAFE_V6__ = true;

  var css = [
    '#productDetailModal.modal-glass{align-items:flex-end!important;padding:0!important;z-index:4000!important}',
    '#productDetailModal .modal-glass-content{max-height:min(90dvh,90vh)!important;padding-bottom:calc(28px + env(safe-area-inset-bottom,0px) + 72px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important}',
    '#productDetailModal .kafe-product-close-fab{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));left:12px;z-index:4010;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,215,0,.15);background:rgba(10,22,40,.92);color:#F0D878;font-size:18px;font-weight:800;display:none;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.45)}',
    '#productDetailModal.active .kafe-product-close-fab{display:flex}',
    '#subscriptionModalBox > div{padding-bottom:calc(24px + env(safe-area-inset-bottom,0px) + 48px)!important;max-height:min(92dvh,92vh)!important}'
  ].join('');

  try {
    var old = document.getElementById('kafeProductModalSafeCss');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'kafeProductModalSafeCss';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  } catch (e0) {}

  function ensureProductFab() {
    var modal = document.getElementById('productDetailModal');
    if (!modal) return;
    var fab = document.getElementById('kafeProductCloseFab');
    if (!fab) {
      fab = document.createElement('button');
      fab.type = 'button';
      fab.id = 'kafeProductCloseFab';
      fab.className = 'kafe-product-close-fab';
      fab.setAttribute('aria-label', 'بستن');
      fab.textContent = '\u2715';
      fab.onclick = function (ev) {
        try { ev.preventDefault(); } catch (e) {}
        try { if (typeof window.hideOnlineOrderForm === 'function') window.hideOnlineOrderForm(); } catch (e1) {}
        try { if (typeof window.hideCallPurchaseInfo === 'function') window.hideCallPurchaseInfo(); } catch (e2) {}
        try {
          if (typeof window.closeProductDetail === 'function') window.closeProductDetail();
          else { modal.classList.remove('active'); modal.style.display = 'none'; }
        } catch (e3) {}
      };
      modal.appendChild(fab);
    }
  }

  function markProductActionRows() {
    ['igOrderForm', 'igCallInfo'].forEach(function (id) {
      var form = document.getElementById(id);
      if (!form) return;
      var kids = form.children;
      for (var i = 0; i < kids.length; i++) {
        var el = kids[i];
        if (el && el.querySelector && el.querySelector('button')) {
          el.style.position = 'sticky';
          el.style.bottom = '0';
          el.style.zIndex = '6';
          el.style.paddingBottom = 'calc(12px + env(safe-area-inset-bottom, 0px))';
          el.style.background = 'linear-gradient(180deg, rgba(10,22,40,0), rgba(10,22,40,0.98) 35%)';
        }
      }
    });
  }

  function bootProduct() {
    ensureProductFab();
    markProductActionRows();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootProduct);
  } else bootProduct();
  setTimeout(bootProduct, 800);

  function patch(name, after) {
    var tries = 0;
    function attempt() {
      var prev = window[name];
      if (typeof prev !== 'function') {
        if (tries++ < 40) setTimeout(attempt, 250);
        return;
      }
      if (prev.__kafeGlassV6) return;
      window[name] = function () {
        var r = prev.apply(this, arguments);
        try {
          if (r && typeof r.then === 'function') {
            r.then(function () { setTimeout(after, 40); }).catch(function () { setTimeout(after, 40); });
          } else setTimeout(after, 40);
        } catch (e) { setTimeout(after, 40); }
        return r;
      };
      window[name].__kafeGlassV6 = true;
    }
    attempt();
  }

  patch('showOnlineOrderForm', bootProduct);
  patch('showCallPurchaseInfo', bootProduct);
})();
