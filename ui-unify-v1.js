/** ui-unify-v1.js
 * یکدست‌سازی ظاهر و رفع کندی جزئیات ادمین:
 * 1) پنجره خرید اشتراک — شیشه‌ای مرکزی مثل مودال‌ها
 * 2) ابزارهای کاربردی — گرید ۳ستونه شیشه‌ای یکسان
 * 3) تنظیمات — متن تیره فیلد، لیبل طلایی، دکمه‌های تم هماهنگ
 * 4) جزئیات/فیش ادمین — بازخورد فوری + لودینگ
 */
(function () {
  'use strict';
  if (window.__KAFE_UI_UNIFY_V1__) return;
  window.__KAFE_UI_UNIFY_V1__ = true;

  function injectCSS() {
    var id = 'kafe-ui-unify-v1-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
    }
    st.textContent = [
      '#utilityToolsGrid.utility-tools-grid,#utilityToolsGrid{',
      '  display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;',
      '  gap:10px!important;padding:2px 0 16px!important;width:100%!important;box-sizing:border-box!important;',
      '}',
      '#utilityToolsGrid .utility-tool-card{',
      '  display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;',
      '  text-align:center!important;gap:4px!important;',
      '  height:88px!important;min-height:88px!important;max-height:88px!important;padding:8px 5px!important;',
      '  border-radius:14px!important;background:rgba(255,255,255,.08)!important;',
      '  border:1px solid rgba(201,168,76,.38)!important;',
      '  backdrop-filter:blur(12px) saturate(1.15)!important;-webkit-backdrop-filter:blur(12px) saturate(1.15)!important;',
      '  box-shadow:0 4px 14px rgba(0,0,0,.22)!important;cursor:pointer!important;color:inherit!important;',
      '  font-family:inherit!important;-webkit-tap-highlight-color:transparent!important;box-sizing:border-box!important;',
      '  transition:transform .15s ease,border-color .15s ease,background .15s ease!important;',
      '}',
      '#utilityToolsGrid .utility-tool-card:active{',
      '  transform:scale(0.96)!important;border-color:rgba(240,216,120,.75)!important;background:rgba(201,168,76,.14)!important;',
      '}',
      '#utilityToolsGrid .ut-icon{font-size:1.35rem!important;line-height:1!important;display:block!important;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35));}',
      '#utilityToolsGrid .ut-title{',
      '  font-size:.68rem!important;font-weight:700!important;color:#F5E9C9!important;-webkit-text-fill-color:#F5E9C9!important;',
      '  line-height:1.25!important;max-width:100%!important;overflow:hidden!important;display:-webkit-box!important;',
      '  -webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;',
      '}',
      '#utilityToolsGrid .ut-desc{',
      '  font-size:.58rem!important;line-height:1.2!important;color:rgba(200,192,176,.75)!important;',
      '  -webkit-text-fill-color:rgba(200,192,176,.75)!important;overflow:hidden!important;display:-webkit-box!important;',
      '  -webkit-line-clamp:1!important;-webkit-box-orient:vertical!important;max-width:100%!important;',
      '}',
      '@media (max-width:360px){',
      '  #utilityToolsGrid .utility-tool-card{height:82px!important;min-height:82px!important;max-height:82px!important;}',
      '  #utilityToolsGrid .ut-title{font-size:.62rem!important;}',
      '}',
      '#settingsPanel .settings-field label,#settingsPanel .settings-section label,#settingsPanel label{',
      '  color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;font-weight:700!important;font-size:.82rem!important;',
      '}',
      '#settingsPanel input[type=text],#settingsPanel input[type=tel],#settingsPanel input[type=password],',
      '#settingsPanel input[type=number],#settingsPanel input[type=email],#settingsPanel input[type=search],',
      '#settingsPanel textarea,#settingsPanel select,#settingsPanel .settings-input,',
      'html body #settingsPanel .settings-field input,html body #settingsPanel .settings-field input[readonly]{',
      '  background:#FFF8E8!important;background-color:#FFF8E8!important;color:#14110C!important;-webkit-text-fill-color:#14110C!important;',
      '  border:1px solid rgba(201,168,76,.55)!important;border-radius:12px!important;font-weight:700!important;font-size:.95rem!important;',
      '  opacity:1!important;caret-color:#14110C!important;',
      '}',
      '#settingsPanel input::placeholder,#settingsPanel textarea::placeholder{',
      '  color:rgba(40,40,40,.45)!important;-webkit-text-fill-color:rgba(40,40,40,.45)!important;',
      '}',
      '#settingsPanel .theme-btn,#settingsPanel .font-btn,#settingsPanel [data-theme],',
      '#settingsPanel .theme-option,#settingsPanel button.theme-btn{',
      '  background:rgba(255,255,255,.1)!important;border:1px solid rgba(201,168,76,.4)!important;border-radius:12px!important;',
      '  color:#F5E9C9!important;-webkit-text-fill-color:#F5E9C9!important;',
      '  backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;font-weight:700!important;',
      '}',
      '#settingsPanel .theme-btn.active,#settingsPanel .font-btn.active,#settingsPanel .theme-option.active{',
      '  background:rgba(201,168,76,.28)!important;border-color:rgba(240,216,120,.7)!important;',
      '  color:#FFF8E0!important;-webkit-text-fill-color:#FFF8E0!important;',
      '}',
      'html body #settingsPanel .settings-section > p,html body #settingsPanel .settings-hint,',
      'html body #settingsPanel .settings-contact-fixed,html body #settingsPanel .settings-contact-fixed p,',
      'html body #settingsPanel .settings-history-card,html body #settingsPanel .settings-history-card span,',
      'html body #settingsPanel .settings-history-card strong,html body #settingsPanel .settings-empty,',
      'html body #settingsPanel .v18-msg-status{',
      '  opacity:1!important;color:#FFF6DE!important;-webkit-text-fill-color:#FFF6DE!important;font-weight:700!important;',
      '}',
      'html body.theme-light #settingsPanel .settings-section > p,html body.theme-light #settingsPanel .settings-hint,',
      'html body.theme-light #settingsPanel .settings-contact-fixed,html body.theme-light #settingsPanel .settings-contact-fixed p,',
      'html body.theme-light #settingsPanel .settings-empty,html body.theme-light #settingsPanel .settings-field label{',
      '  opacity:1!important;color:#1A1208!important;-webkit-text-fill-color:#1A1208!important;font-weight:700!important;',
      '}',
      '#subscriptionModalBox{',
      '  background:rgba(0,0,0,.18)!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important;',
      '  align-items:center!important;justify-content:center!important;',
      '  padding:12px 12px calc(var(--bottom-nav-height,64px) + 12px)!important;box-sizing:border-box!important;',
      '}',
      '#subscriptionModalBox > div{',
      '  background:rgba(12,16,28,.28)!important;border:none!important;border-radius:28px!important;',
      '  backdrop-filter:blur(14px) saturate(1.1)!important;-webkit-backdrop-filter:blur(14px) saturate(1.1)!important;',
      '  box-shadow:0 12px 36px rgba(0,0,0,.3)!important;max-height:min(88vh,780px)!important;',
      '  width:calc(100% - 10px)!important;max-width:440px!important;margin:0 auto!important;color:#F5F0E4!important;',
      '}',
      '#subscriptionModalBox input,#subscriptionModalBox select,#subscriptionModalBox textarea{',
      '  background:rgba(255,255,255,.14)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;',
      '  border:1px solid rgba(255,255,255,.2)!important;border-radius:14px!important;',
      '}',
      '#subscriptionModalBox label{color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;}',
      '#kafeAdminBusyOverlay{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;direction:rtl;}',
      '#kafeAdminBusyOverlay .kafe-busy-card{background:rgba(18,22,34,.92);border:1px solid rgba(201,168,76,.35);border-radius:16px;padding:18px 22px;color:#F5E9C9;font-weight:700;font-size:.9rem;box-shadow:0 10px 30px rgba(0,0,0,.4);text-align:center;min-width:160px;}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function patchSubscriptionModal() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function' || prev.__kafeUnify) return;
    window.openSubscriptionPurchase = async function () {
      var ret = await prev.apply(this, arguments);
      try {
        var box = document.getElementById('subscriptionModalBox');
        if (box) {
          box.style.alignItems = 'center';
          box.style.justifyContent = 'center';
          box.style.padding = '12px';
          var inner = box.firstElementChild;
          if (inner) {
            inner.style.borderRadius = '28px';
            inner.style.border = 'none';
            inner.style.background = 'rgba(12,16,28,0.32)';
            inner.style.backdropFilter = 'blur(14px)';
            inner.style.webkitBackdropFilter = 'blur(14px)';
            inner.style.maxHeight = 'min(88vh, 780px)';
            inner.style.maxWidth = '440px';
            inner.style.width = 'calc(100% - 10px)';
            inner.style.margin = '0 auto';
          }
        }
      } catch (e) {}
      return ret;
    };
    window.openSubscriptionPurchase.__kafeUnify = true;
  }

  function showBusy(msg) {
    var old = document.getElementById('kafeAdminBusyOverlay');
    if (old) old.remove();
    var el = document.createElement('div');
    el.id = 'kafeAdminBusyOverlay';
    el.innerHTML = '<div class="kafe-busy-card">⏳ ' + (msg || 'لطفاً صبر کنید...') + '</div>';
    document.body.appendChild(el);
  }
  function hideBusy() {
    var el = document.getElementById('kafeAdminBusyOverlay');
    if (el) el.remove();
  }

  function findRowById(kind, id) {
    id = String(id || '');
    var pools = kind === 'subscription'
      ? [window.__adminInboxSubCache, window.__adminSubCache, window.__adminSubscriptionRequests]
      : [window.__adminInboxOrderCache, window.__adminOrdersCache];
    for (var p = 0; p < pools.length; p++) {
      var arr = pools[p];
      if (!Array.isArray(arr)) continue;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] && String(arr[i].id) === id) return arr[i];
      }
    }
    return null;
  }

  function patchAdminDetail() {
    var prevDetail = window.showAdminPurchaseDetail;
    if (typeof prevDetail === 'function' && !prevDetail.__kafeUnify) {
      window.showAdminPurchaseDetail = function (kind, row) {
        try {
          if (typeof showNotification === 'function') showNotification('⏳ در حال باز کردن جزئیات...', 'info');
        } catch (e) {}
        showBusy('در حال بارگذاری جزئیات...');
        setTimeout(function () {
          try {
            if (row && (typeof row === 'string' || typeof row === 'number')) {
              row = findRowById(kind, row) || row;
            }
            if (!row || typeof row !== 'object') {
              hideBusy();
              if (typeof showNotification === 'function') {
                showNotification('❌ جزئیات پیدا نشد — لیست را یک‌بار رفرش کنید', 'error');
              }
              return;
            }
            prevDetail.call(window, kind, row);
            if (typeof showNotification === 'function') showNotification('✅ جزئیات باز شد', 'success');
          } catch (err) {
            console.warn('showAdminPurchaseDetail', err);
            if (typeof showNotification === 'function') showNotification('❌ خطا در نمایش جزئیات', 'error');
          } finally {
            hideBusy();
          }
        }, 30);
      };
      window.showAdminPurchaseDetail.__kafeUnify = true;
    }

    var prevReceipt = window.viewCloudReceipt;
    if (typeof prevReceipt === 'function' && !prevReceipt.__kafeUnify) {
      window.viewCloudReceipt = async function (path, bucket) {
        showBusy('در حال دریافت فیش...');
        try {
          if (typeof showNotification === 'function') showNotification('⏳ در حال دریافت فیش از سرور...', 'info');
          var ret = await prevReceipt.apply(this, arguments);
          if (document.getElementById('kafeReceiptViewer') && typeof showNotification === 'function') {
            showNotification('✅ فیش آماده است', 'success');
          }
          return ret;
        } catch (e) {
          if (typeof showNotification === 'function') showNotification('❌ خواندن فیش ناموفق بود', 'error');
          throw e;
        } finally {
          hideBusy();
        }
      };
      window.viewCloudReceipt.__kafeUnify = true;
    }

    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var btn = t.closest('button');
      if (!btn) return;
      var txt = (btn.textContent || '').trim();
      if (txt.indexOf('جزئیات') === -1 && txt.indexOf('فیش') === -1) return;
      try {
        btn.style.opacity = '0.7';
        setTimeout(function () { try { btn.style.opacity = ''; } catch (e2) {} }, 400);
      } catch (e) {}
    }, true);
  }

  function run() {
    injectCSS();
    patchSubscriptionModal();
    patchAdminDetail();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0); setTimeout(run, 600); setTimeout(run, 1600);
    });
  } else {
    run(); setTimeout(run, 600); setTimeout(run, 1600);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 400); setTimeout(run, 1200);
  });
})();
