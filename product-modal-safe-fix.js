/* product-modal-safe-fix.js v3 — محصولات + اشتراک: safe-area + ظاهر هم‌سبک modal-glass */
(function () {
  'use strict';
  if (window.__KAFE_PRODUCT_MODAL_SAFE_V3__) return;
  window.__KAFE_PRODUCT_MODAL_SAFE_V3__ = true;
  window.__KAFE_PRODUCT_MODAL_SAFE_V2__ = true;
  window.__KAFE_PRODUCT_MODAL_SAFE__ = true;

  var css = [
    '#productDetailModal.modal-glass{align-items:flex-end!important;padding:0!important;z-index:4000!important}',
    '#productDetailModal .modal-glass-content{max-height:min(90dvh,90vh)!important;padding-bottom:calc(28px + env(safe-area-inset-bottom,0px) + 72px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain;box-sizing:border-box!important}',
    '#productDetailModal .modal-glass-close{position:absolute!important;top:12px!important;left:12px!important;z-index:10!important;width:40px!important;height:40px!important;border-radius:50%!important;background:rgba(0,0,0,.65)!important;color:#fff!important;font-size:18px!important}',
    '#productDetailModal .ig-buy-actions{padding-bottom:calc(12px + env(safe-area-inset-bottom,0px))}',
    '#productDetailModal .kafe-product-close-fab{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));left:12px;z-index:4010;width:42px;height:42px;border-radius:50%;border:1px solid rgba(201,168,76,.45);background:rgba(10,22,40,.92);color:#F0D878;font-size:18px;font-weight:800;display:none;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.45)}',
    '#productDetailModal.active .kafe-product-close-fab{display:flex}',
    '#subscriptionModalBox{z-index:6000!important;align-items:flex-end!important;justify-content:center!important;background:rgba(0,0,0,.7)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex!important;padding:0!important}',
    '#subscriptionModalBox > div{width:100%!important;max-width:500px!important;max-height:min(90dvh,90vh)!important;padding:20px 18px calc(28px + env(safe-area-inset-bottom,0px) + 72px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain;box-sizing:border-box!important;background:rgba(10,22,40,0.95)!important;backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border-radius:24px 24px 0 0!important;border:1px solid rgba(255,215,0,0.15)!important;border-bottom:none!important;box-shadow:0 -8px 40px rgba(0,0,0,0.6)!important;color:#F5F0E4!important;animation:kafeSubSheetSlide .45s cubic-bezier(.25,.46,.45,.94)}',
    '@keyframes kafeSubSheetSlide{from{transform:translateY(40px);opacity:.6}to{transform:translateY(0);opacity:1}}',
    '#subscriptionModalBox .kafe-sub-close-fab{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));left:12px;z-index:6010;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,215,0,0.15);background:rgba(255,255,255,0.08);color:#F5F0E4;font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.45)}',
    '#subscriptionModalBox input,#subscriptionModalBox textarea,#subscriptionModalBox select{background:rgba(255,255,255,0.04)!important;border:1px solid rgba(255,215,0,0.15)!important;border-radius:10px!important;color:#f0e6d3!important}',
    '#subscriptionModalBox button.subscription-plan-btn{border:1px solid rgba(255,215,0,0.15)!important;border-radius:12px!important;background:rgba(255,255,255,0.04)!important;color:#F5F0E4!important;box-shadow:none!important}',
    '#subscriptionModalBox button.subscription-plan-btn[data-selected="1"],#subscriptionModalBox button.subscription-plan-btn.is-selected{border-color:#c9a84c!important;background:rgba(201,168,76,0.12)!important;color:#F0D878!important}'
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
        try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
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

  function styleSubHeader(inner) {
    if (!inner || inner.getAttribute('data-kafe-glass') === '1') return;
    inner.setAttribute('data-kafe-glass', '1');
    var first = inner.firstElementChild;
    if (first && first.tagName === 'DIV') {
      first.style.display = 'flex';
      first.style.alignItems = 'center';
      first.style.gap = '12px';
      first.style.marginBottom = '16px';
      first.style.paddingBottom = '12px';
      first.style.borderBottom = '1px solid rgba(255,215,0,0.15)';
      var strong = first.querySelector('strong');
      if (strong) {
        strong.style.flex = '1';
        strong.style.fontSize = '1rem';
        strong.style.color = '#F0D878';
        strong.style.fontWeight = '700';
      }
      var closeBtn = first.querySelector('button');
      if (closeBtn) {
        closeBtn.style.width = '36px';
        closeBtn.style.height = '36px';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.border = '1px solid rgba(255,215,0,0.15)';
        closeBtn.style.background = 'rgba(255,255,255,0.08)';
        closeBtn.style.color = '#F5F0E4';
        closeBtn.style.padding = '0';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
      }
    }
  }

  function ensureSubFab() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;

    box.style.background = 'rgba(0,0,0,0.7)';
    box.style.backdropFilter = 'blur(12px)';
    box.style.webkitBackdropFilter = 'blur(12px)';
    box.style.alignItems = 'flex-end';
    box.style.justifyContent = 'center';

    var fab = document.getElementById('kafeSubCloseFab');
    if (!fab) {
      fab = document.createElement('button');
      fab.type = 'button';
      fab.id = 'kafeSubCloseFab';
      fab.className = 'kafe-sub-close-fab';
      fab.setAttribute('aria-label', 'بستن');
      fab.textContent = '\u2715';
      fab.onclick = function (ev) {
        try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
        try {
          var b = document.getElementById('subscriptionModalBox');
          if (b) b.remove();
        } catch (e2) {}
      };
      box.appendChild(fab);
    }

    var inner = box.firstElementChild;
    if (inner && inner.tagName === 'DIV') {
      inner.style.maxWidth = '500px';
      inner.style.width = '100%';
      inner.style.maxHeight = 'min(90dvh, 90vh)';
      inner.style.padding = '20px 18px calc(28px + env(safe-area-inset-bottom, 0px) + 72px)';
      inner.style.overflowY = 'auto';
      inner.style.webkitOverflowScrolling = 'touch';
      inner.style.background = 'rgba(10,22,40,0.95)';
      inner.style.backdropFilter = 'blur(30px)';
      inner.style.webkitBackdropFilter = 'blur(30px)';
      inner.style.borderRadius = '24px 24px 0 0';
      inner.style.border = '1px solid rgba(255,215,0,0.15)';
      inner.style.borderBottom = 'none';
      inner.style.boxShadow = '0 -8px 40px rgba(0,0,0,0.6)';
      inner.style.color = '#F5F0E4';
      styleSubHeader(inner);

      var buttons = inner.querySelectorAll('button');
      for (var j = 0; j < buttons.length; j++) {
        var btn = buttons[j];
        var txt = (btn.textContent || '');
        if (txt.indexOf('ثبت') >= 0 || txt.indexOf('ارسال درخواست') >= 0 || txt.indexOf('تأیید') >= 0) {
          var parent = btn.parentElement;
          if (parent && parent !== inner) {
            parent.style.position = 'sticky';
            parent.style.bottom = '0';
            parent.style.zIndex = '8';
            parent.style.paddingBottom = 'calc(12px + env(safe-area-inset-bottom, 0px))';
            parent.style.background = 'linear-gradient(180deg, rgba(12,20,36,0), rgba(12,20,36,0.98) 30%)';
          }
          btn.style.background = 'linear-gradient(135deg,#a8872a,#c9a84c,#e8d5a3)';
          btn.style.color = '#0a1628';
          btn.style.border = 'none';
          btn.style.borderRadius = '12px';
          btn.style.fontWeight = '700';
          btn.style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)';
        }
      }
    }
  }

  function bootProduct() {
    ensureProductFab();
    markProductActionRows();
  }
  function bootSub() {
    ensureSubFab();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { bootProduct(); });
  } else {
    bootProduct();
  }
  setTimeout(bootProduct, 600);
  setTimeout(bootProduct, 2000);

  function patch(name, after) {
    var prev = window[name];
    if (typeof prev !== 'function' || prev.__kafeSafePatchedV3) return;
    window[name] = function () {
      var r = prev.apply(this, arguments);
      try {
        if (r && typeof r.then === 'function') {
          r.then(function () { setTimeout(after, 40); }).catch(function () { setTimeout(after, 40); });
        } else {
          setTimeout(after, 40);
        }
      } catch (e) { setTimeout(after, 40); }
      return r;
    };
    window[name].__kafeSafePatchedV3 = true;
    window[name].__kafeSafePatched = true;
  }

  patch('showOnlineOrderForm', function () { bootProduct(); });
  patch('showCallPurchaseInfo', function () { bootProduct(); });
  patch('openSubscriptionPurchase', function () { bootSub(); });

  setTimeout(function () {
    patch('showOnlineOrderForm', function () { bootProduct(); });
    patch('showCallPurchaseInfo', function () { bootProduct(); });
    patch('openSubscriptionPurchase', function () { bootSub(); });
  }, 1500);
  setTimeout(function () {
    patch('openSubscriptionPurchase', function () { bootSub(); });
  }, 4000);

  try {
    var obs = new MutationObserver(function () {
      if (document.getElementById('subscriptionModalBox')) bootSub();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (eObs) {}
})();
