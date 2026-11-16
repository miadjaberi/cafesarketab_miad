/* product-modal-safe-fix.js v5 — اشتراک دقیقاً شبیه modal-glass محصول */
(function () {
  'use strict';
  if (window.__KAFE_PRODUCT_MODAL_SAFE_V5__) return;
  window.__KAFE_PRODUCT_MODAL_SAFE_V5__ = true;

  var css = [
    '#productDetailModal.modal-glass{align-items:flex-end!important;padding:0!important;z-index:4000!important}',
    '#productDetailModal .modal-glass-content{max-height:min(90dvh,90vh)!important;padding-bottom:calc(28px + env(safe-area-inset-bottom,0px) + 72px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important}',
    '#productDetailModal .kafe-product-close-fab{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));left:12px;z-index:4010;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,215,0,.15);background:rgba(10,22,40,.92);color:#F0D878;font-size:18px;font-weight:800;display:none;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.45)}',
    '#productDetailModal.active .kafe-product-close-fab{display:flex}',
    '#subscriptionModalBox #kafeSubCloseFab{display:none!important}'
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

    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('inset', '0', 'important');
    box.style.setProperty('z-index', '6000', 'important');
    box.style.setProperty('background', 'rgba(0,0,0,0.72)', 'important');
    box.style.setProperty('backdrop-filter', 'blur(12px)', 'important');
    box.style.setProperty('-webkit-backdrop-filter', 'blur(12px)', 'important');
    box.style.setProperty('display', 'flex', 'important');
    box.style.setProperty('align-items', 'flex-end', 'important');
    box.style.setProperty('justify-content', 'center', 'important');
    box.style.setProperty('padding', '0', 'important');

    var inner = null;
    for (var i = 0; i < box.children.length; i++) {
      var ch = box.children[i];
      if (ch.id === 'kafeSubCloseFab') {
        ch.style.display = 'none';
        continue;
      }
      if (ch.tagName === 'DIV') { inner = ch; break; }
    }
    if (!inner) return;

    inner.style.cssText = '';
    inner.style.setProperty('width', '100%', 'important');
    inner.style.setProperty('max-width', '500px', 'important');
    inner.style.setProperty('max-height', 'min(90dvh, 90vh)', 'important');
    inner.style.setProperty('overflow-y', 'auto', 'important');
    inner.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
    inner.style.setProperty('background', 'rgba(10,22,40,0.97)', 'important');
    inner.style.setProperty('backdrop-filter', 'blur(30px)', 'important');
    inner.style.setProperty('-webkit-backdrop-filter', 'blur(30px)', 'important');
    inner.style.setProperty('border-radius', '24px 24px 0 0', 'important');
    inner.style.setProperty('padding', '20px 18px calc(28px + env(safe-area-inset-bottom, 0px) + 64px)', 'important');
    inner.style.setProperty('border', '1px solid rgba(201,168,76,0.35)', 'important');
    inner.style.setProperty('border-bottom', 'none', 'important');
    inner.style.setProperty('box-shadow', '0 -8px 40px rgba(0,0,0,0.6)', 'important');
    inner.style.setProperty('color', '#F5F0E4', 'important');
    inner.style.setProperty('box-sizing', 'border-box', 'important');
    inner.style.setProperty('font-family', 'Vazirmatn, Tahoma, sans-serif', 'important');

    var header = inner.firstElementChild;
    if (header && header.tagName === 'DIV') {
      header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255,215,0,0.15)';
      var strong = header.querySelector('strong');
      if (strong) {
        strong.style.cssText = 'flex:1;font-size:1rem;color:#F0D878;font-weight:700;text-align:right';
      }
      var closes = header.querySelectorAll('button');
      for (var c = 0; c < closes.length; c++) {
        if (c === 0) {
          closes[c].style.cssText = 'width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,215,0,0.15);background:rgba(255,255,255,0.08);color:#F5F0E4;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0';
        } else {
          closes[c].style.display = 'none';
        }
      }
    }

    inner.querySelectorAll('input,textarea,select').forEach(function (inp) {
      inp.style.setProperty('background', 'rgba(255,255,255,0.04)', 'important');
      inp.style.setProperty('border', '1px solid rgba(255,215,0,0.15)', 'important');
      inp.style.setProperty('border-radius', '10px', 'important');
      inp.style.setProperty('color', '#f0e6d3', 'important');
    });

    inner.querySelectorAll('button.subscription-plan-btn, button[data-plan-days]').forEach(function (b) {
      b.style.setProperty('border', '1px solid rgba(255,215,0,0.15)', 'important');
      b.style.setProperty('border-radius', '12px', 'important');
      b.style.setProperty('background', 'rgba(255,255,255,0.04)', 'important');
      b.style.setProperty('color', '#F5F0E4', 'important');
      b.style.setProperty('box-shadow', 'none', 'important');
    });

    inner.querySelectorAll('button').forEach(function (btn) {
      var txt = (btn.textContent || '');
      if (txt.indexOf('ثبت') >= 0 || txt.indexOf('ارسال') >= 0) {
        btn.style.setProperty('background', 'linear-gradient(135deg,#a8872a,#c9a84c,#e8d5a3)', 'important');
        btn.style.setProperty('color', '#0a1628', 'important');
        btn.style.setProperty('border', 'none', 'important');
        btn.style.setProperty('border-radius', '12px', 'important');
        btn.style.setProperty('font-weight', '700', 'important');
        btn.style.setProperty('box-shadow', '0 4px 20px rgba(201,168,76,0.3)', 'important');
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
      if (prev.__kafeGlassV5) return;
      window[name] = function () {
        var r = prev.apply(this, arguments);
        try {
          if (r && typeof r.then === 'function') {
            r.then(function () {
              setTimeout(after, 20);
              setTimeout(after, 80);
              setTimeout(after, 200);
              setTimeout(after, 500);
            }).catch(function () { setTimeout(after, 20); });
          } else {
            setTimeout(after, 20);
            setTimeout(after, 80);
            setTimeout(after, 200);
            setTimeout(after, 500);
          }
        } catch (e) { setTimeout(after, 20); }
        return r;
      };
      window[name].__kafeGlassV5 = true;
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
