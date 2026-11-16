/* product-modal-safe-fix.js v4 — محصول + اشتراک هم‌سبک modal-glass + اجباری */
(function () {
  'use strict';
  if (window.__KAFE_PRODUCT_MODAL_SAFE_V4__) return;
  window.__KAFE_PRODUCT_MODAL_SAFE_V4__ = true;

  var css = [
    '#productDetailModal.modal-glass{align-items:flex-end!important;padding:0!important;z-index:4000!important}',
    '#productDetailModal .modal-glass-content{max-height:min(90dvh,90vh)!important;padding-bottom:calc(28px + env(safe-area-inset-bottom,0px) + 72px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important}',
    '#productDetailModal .kafe-product-close-fab,#subscriptionModalBox .kafe-sub-close-fab{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));left:12px;z-index:6010;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,215,0,.15);background:rgba(10,22,40,.92);color:#F0D878;font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.45)}',
    '#productDetailModal.active .kafe-product-close-fab{display:flex}'
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

  function forceSubGlassLook() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;

    box.style.cssText = 'position:fixed;inset:0;z-index:6000;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center;padding:0;';

    var inner = null;
    for (var i = 0; i < box.children.length; i++) {
      if (box.children[i].id === 'kafeSubCloseFab') continue;
      if (box.children[i].tagName === 'DIV') { inner = box.children[i]; break; }
    }
    if (!inner) return;

    inner.style.cssText = [
      'width:100%',
      'max-width:500px',
      'max-height:min(90dvh, 90vh)',
      'overflow-y:auto',
      '-webkit-overflow-scrolling:touch',
      'background:rgba(10,22,40,0.95)',
      'backdrop-filter:blur(30px)',
      '-webkit-backdrop-filter:blur(30px)',
      'border-radius:24px 24px 0 0',
      'padding:20px 18px calc(28px + env(safe-area-inset-bottom, 0px) + 64px)',
      'border:1px solid rgba(255,215,0,0.15)',
      'border-bottom:none',
      'box-shadow:0 -8px 40px rgba(0,0,0,0.6)',
      'color:#F5F0E4',
      'box-sizing:border-box',
      'font-family:Vazirmatn,Tahoma,sans-serif'
    ].join(';');

    var header = inner.firstElementChild;
    if (header && header.tagName === 'DIV') {
      header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255,215,0,0.15)';
      var strong = header.querySelector('strong');
      if (strong) strong.style.cssText = 'flex:1;font-size:1rem;color:#F0D878;font-weight:700';
      var closeBtn = header.querySelector('button');
      if (closeBtn) {
        closeBtn.style.cssText = 'width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,215,0,0.15);background:rgba(255,255,255,0.08);color:#F5F0E4;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0';
      }
    }

    inner.querySelectorAll('input,textarea,select').forEach(function (inp) {
      inp.style.background = 'rgba(255,255,255,0.04)';
      inp.style.border = '1px solid rgba(255,215,0,0.15)';
      inp.style.borderRadius = '10px';
      inp.style.color = '#f0e6d3';
    });

    inner.querySelectorAll('button.subscription-plan-btn, button[data-plan-days]').forEach(function (b) {
      b.style.border = '1px solid rgba(255,215,0,0.15)';
      b.style.borderRadius = '12px';
      b.style.background = 'rgba(255,255,255,0.04)';
      b.style.color = '#F5F0E4';
      b.style.boxShadow = 'none';
    });

    inner.querySelectorAll('button').forEach(function (btn) {
      var txt = (btn.textContent || '');
      if (txt.indexOf('ثبت') >= 0 || txt.indexOf('ارسال') >= 0) {
        btn.style.background = 'linear-gradient(135deg,#a8872a,#c9a84c,#e8d5a3)';
        btn.style.color = '#0a1628';
        btn.style.border = 'none';
        btn.style.borderRadius = '12px';
        btn.style.fontWeight = '700';
        btn.style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)';
        var parent = btn.parentElement;
        if (parent && parent !== inner) {
          parent.style.position = 'sticky';
          parent.style.bottom = '0';
          parent.style.zIndex = '8';
          parent.style.paddingBottom = 'calc(12px + env(safe-area-inset-bottom, 0px))';
          parent.style.background = 'linear-gradient(180deg, rgba(12,20,36,0), rgba(12,20,36,0.98) 30%)';
        }
      }
    });

    var fab = document.getElementById('kafeSubCloseFab');
    if (!fab) {
      fab = document.createElement('button');
      fab.type = 'button';
      fab.id = 'kafeSubCloseFab';
      fab.className = 'kafe-sub-close-fab';
      fab.setAttribute('aria-label', 'بستن');
      fab.textContent = '\u2715';
      fab.onclick = function (ev) {
        try { ev.preventDefault(); } catch (e) {}
        try { var b = document.getElementById('subscriptionModalBox'); if (b) b.remove(); } catch (e2) {}
      };
      box.appendChild(fab);
    }
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
      if (prev.__kafeGlassV4) return;
      window[name] = function () {
        var r = prev.apply(this, arguments);
        try {
          if (r && typeof r.then === 'function') {
            r.then(function () { setTimeout(after, 30); setTimeout(after, 120); setTimeout(after, 400); })
             .catch(function () { setTimeout(after, 30); });
          } else {
            setTimeout(after, 30);
            setTimeout(after, 120);
            setTimeout(after, 400);
          }
        } catch (e) { setTimeout(after, 30); }
        return r;
      };
      window[name].__kafeGlassV4 = true;
    }
    attempt();
  }

  patch('showOnlineOrderForm', bootProduct);
  patch('showCallPurchaseInfo', bootProduct);
  patch('openSubscriptionPurchase', forceSubGlassLook);

  try {
    var obs = new MutationObserver(function () {
      if (document.getElementById('subscriptionModalBox')) forceSubGlassLook();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (eObs) {}
})();
