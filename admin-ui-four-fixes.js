/** admin-ui-four-fixes.js V2
 * - خرید اشتراک: دقیقاً در فضای بین هدر و نوار پایین (مثل فروشگاه/منوی مودال‌ها)
 * - حذف پیام: بازخورد قطعی + handler پایدار
 * - جزئیات ادمین بالای پنل
 * - برای من در لیست ادمین
 */
(function () {
  'use strict';
  // force re-init on new version
  window.__KAFE_ADMIN_UI_FOUR_FIXES_V2__ = true;

  function notify(msg, type) {
    try {
      if (typeof showNotification === 'function') {
        showNotification(msg, type || 'info');
        return;
      }
    } catch (e) {}
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification(msg, type || 'info');
        return;
      }
    } catch (e2) {}
    // fallback toast
    try {
      var t = document.getElementById('kafeHardToast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'kafeHardToast';
        t.style.cssText =
          'position:fixed;left:50%;bottom:calc(var(--bottom-nav-height,68px) + 18px);transform:translateX(-50%);' +
          'z-index:200000;max-width:92vw;padding:12px 16px;border-radius:12px;font-size:0.9rem;font-weight:700;' +
          'background:#0b1120;color:#F0D878;border:1px solid #c9a84c;box-shadow:0 8px 24px rgba(0,0,0,.45);' +
          'text-align:center;pointer-events:none;';
        document.body.appendChild(t);
      }
      t.textContent = String(msg || '');
      t.style.display = 'block';
      clearTimeout(t._hide);
      t._hide = setTimeout(function () {
        t.style.display = 'none';
      }, 3200);
    } catch (e3) {
      try {
        alert(String(msg || ''));
      } catch (e4) {}
    }
  }

  function injectCSS() {
    var id = 'kafe-admin-ui-four-fixes-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '#kafeAdminPurchaseDetail{z-index:100150!important;pointer-events:auto!important;}',

      /* ===== خرید اشتراک = صفحه داخل فریم اپ (مثل فروشگاه) ===== */
      '#subscriptionModalBox{',
      '  position:fixed!important;',
      '  top:var(--header-height,152px)!important;',
      '  bottom:calc(var(--bottom-nav-height,68px) + env(safe-area-inset-bottom,0px))!important;',
      '  left:0!important;right:0!important;',
      '  inset:auto!important;',
      '  width:100%!important;height:auto!important;',
      '  z-index:40!important;',
      '  display:flex!important;',
      '  flex-direction:column!important;',
      '  align-items:stretch!important;',
      '  justify-content:flex-start!important;',
      '  padding:0!important;margin:0!important;',
      '  box-sizing:border-box!important;',
      '  background:#0b1120!important;',
      '  background-color:#0b1120!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  border:none!important;border-radius:0!important;',
      '  overflow:hidden!important;',
      '}',
      '#subscriptionModalBox > div{',
      '  flex:1 1 auto!important;',
      '  width:100%!important;max-width:none!important;',
      '  height:100%!important;max-height:none!important;',
      '  margin:0!important;padding:14px 14px 20px!important;',
      '  border-radius:0!important;',
      '  border:none!important;',
      '  border-top:1px solid rgba(201,168,76,.25)!important;',
      '  background:#0b1120!important;',
      '  box-shadow:none!important;',
      '  overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;',
      '  box-sizing:border-box!important;',
      '}',

      /* پنل خرید (subOrders) هم در همان فریم */
      '#subOrdersPanel{',
      '  position:fixed!important;',
      '  top:var(--header-height,152px)!important;',
      '  bottom:calc(var(--bottom-nav-height,68px) + env(safe-area-inset-bottom,0px))!important;',
      '  left:0!important;right:0!important;',
      '  inset:auto!important;',
      '  z-index:35!important;',
      '  background:#0b1120!important;',
      '  align-items:stretch!important;',
      '  justify-content:flex-start!important;',
      '  padding:0!important;',
      '}',
      '#subOrdersPanel .sub-orders-sheet{',
      '  width:100%!important;max-width:none!important;',
      '  height:100%!important;max-height:none!important;',
      '  border-radius:0!important;',
      '  margin:0!important;',
      '  background:#0b1120!important;',
      '  border:none!important;',
      '  border-top:1px solid rgba(201,168,76,.25)!important;',
      '  overflow:auto!important;',
      '}',

      '.kafe-admin-for-me-item{',
      '  border:1px dashed rgba(201,168,76,.55)!important;',
      '  background:rgba(201,168,76,.08)!important;',
      '}',
      '.kafe-admin-for-me-item .kafe-for-me-badge{',
      '  display:inline-block;margin-right:6px;padding:2px 8px;border-radius:999px;',
      '  background:rgba(45,212,191,.15);color:#2dd4bf;font-size:.72rem;font-weight:700;',
      '}',

      '#v18AdminMessageList button[data-kafe-del="1"]{',
      '  pointer-events:auto!important;cursor:pointer!important;z-index:5!important;',
      '  position:relative!important;',
      '}'
    ].join('\n');
  }

  function elevateDetail() {
    var el = document.getElementById('kafeAdminPurchaseDetail');
    if (!el) return;
    el.style.setProperty('z-index', '100150', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('display', 'flex', 'important');
  }

  function patchShowDetail() {
    var prev = window.showAdminPurchaseDetail;
    if (typeof prev !== 'function' || prev.__kafeZFixV2) return;
    window.showAdminPurchaseDetail = function () {
      var ret = prev.apply(this, arguments);
      setTimeout(elevateDetail, 0);
      setTimeout(elevateDetail, 80);
      return ret;
    };
    window.showAdminPurchaseDetail.__kafeZFixV2 = true;
  }

  /** خرید اشتراک را مثل صفحه فروشگاه در فریم اپ بنشان */
  function forceSubAsPage() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;

    var headerH = 0;
    var navH = 0;
    try {
      var hdr = document.querySelector('header, .app-header, #appHeader');
      if (hdr) headerH = hdr.getBoundingClientRect().height;
      var nav = document.getElementById('bottomNav');
      if (nav) navH = nav.getBoundingClientRect().height;
    } catch (e) {}
    if (!headerH) headerH = 152;
    if (!navH) navH = 68;

    box.style.cssText = '';
    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('top', headerH + 'px', 'important');
    box.style.setProperty('bottom', navH + 'px', 'important');
    box.style.setProperty('left', '0', 'important');
    box.style.setProperty('right', '0', 'important');
    box.style.setProperty('inset', 'auto', 'important');
    box.style.setProperty('width', '100%', 'important');
    box.style.setProperty('z-index', '40', 'important');
    box.style.setProperty('display', 'flex', 'important');
    box.style.setProperty('flex-direction', 'column', 'important');
    box.style.setProperty('align-items', 'stretch', 'important');
    box.style.setProperty('justify-content', 'flex-start', 'important');
    box.style.setProperty('padding', '0', 'important');
    box.style.setProperty('margin', '0', 'important');
    box.style.setProperty('background', '#0b1120', 'important');
    box.style.setProperty('background-color', '#0b1120', 'important');
    box.style.setProperty('border-radius', '0', 'important');
    box.style.setProperty('backdrop-filter', 'none', 'important');

    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('max-width', 'none', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      sheet.style.setProperty('margin', '0', 'important');
      sheet.style.setProperty('border-radius', '0', 'important');
      sheet.style.setProperty('border', 'none', 'important');
      sheet.style.setProperty('border-top', '1px solid rgba(201,168,76,0.25)', 'important');
      sheet.style.setProperty('background', '#0b1120', 'important');
      sheet.style.setProperty('box-shadow', 'none', 'important');
      sheet.style.setProperty('overflow-y', 'auto', 'important');
      sheet.style.setProperty('padding', '14px 14px 20px', 'important');
    }
  }

  function forceSubOrdersAsPage() {
    var p = document.getElementById('subOrdersPanel');
    if (!p || p.style.display === 'none' || !p.style.display) return;
    if (p.style.display !== 'flex' && p.style.display !== 'block') return;

    var headerH = 152,
      navH = 68;
    try {
      var hdr = document.querySelector('header, .app-header, #appHeader');
      if (hdr) headerH = hdr.getBoundingClientRect().height || headerH;
      var nav = document.getElementById('bottomNav');
      if (nav) navH = nav.getBoundingClientRect().height || navH;
    } catch (e) {}

    p.style.setProperty('position', 'fixed', 'important');
    p.style.setProperty('top', headerH + 'px', 'important');
    p.style.setProperty('bottom', navH + 'px', 'important');
    p.style.setProperty('left', '0', 'important');
    p.style.setProperty('right', '0', 'important');
    p.style.setProperty('inset', 'auto', 'important');
    p.style.setProperty('background', '#0b1120', 'important');
    p.style.setProperty('z-index', '35', 'important');
    p.style.setProperty('align-items', 'stretch', 'important');
    p.style.setProperty('padding', '0', 'important');

    var sheet = p.querySelector('.sub-orders-sheet');
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('max-width', 'none', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('border-radius', '0', 'important');
      sheet.style.setProperty('background', '#0b1120', 'important');
      sheet.style.setProperty('margin', '0', 'important');
    }
  }

  function patchSubPurchase() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function') return;
    if (prev.__kafePageFrameV2) return;
    window.openSubscriptionPurchase = async function () {
      var ret = await prev.apply(this, arguments);
      forceSubAsPage();
      setTimeout(forceSubAsPage, 0);
      setTimeout(forceSubAsPage, 50);
      setTimeout(forceSubAsPage, 150);
      setTimeout(forceSubAsPage, 400);
      return ret;
    };
    window.openSubscriptionPurchase.__kafePageFrameV2 = true;
  }

  function patchSubOrdersPanel() {
    var prev = window.openSubOrdersPanel;
    if (typeof prev !== 'function' || prev.__kafePageFrameV2) return;
    window.openSubOrdersPanel = async function () {
      var ret = await prev.apply(this, arguments);
      setTimeout(forceSubOrdersAsPage, 0);
      setTimeout(forceSubOrdersAsPage, 80);
      return ret;
    };
    window.openSubOrdersPanel.__kafePageFrameV2 = true;
  }

  function injectForMeAdminCard() {
    var container = document.getElementById('adminModalsList');
    if (!container || container.querySelector('.kafe-admin-for-me-item')) return;
    var card = document.createElement('div');
    card.className = 'admin-item modal-admin-item kafe-admin-for-me-item';
    card.innerHTML =
      '<span class="modal-admin-name">👤 <b>برای من</b> <span class="kafe-for-me-badge">در حال توسعه</span></span>';
    if (container.firstChild) container.insertBefore(card, container.firstChild);
    else container.appendChild(card);
  }

  function patchRenderAdminModals() {
    var prev = window.renderAdminModals;
    if (typeof prev !== 'function' || prev.__kafeForMeV2) return;
    window.renderAdminModals = function () {
      var ret = prev.apply(this, arguments);
      try {
        injectForMeAdminCard();
      } catch (e) {}
      return ret;
    };
    window.renderAdminModals.__kafeForMeV2 = true;
  }

  function safeJsArg(value) {
    return "'" + String(value == null ? '' : value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  }

  window.kafeHtmlJsArg = function (value) {
    return safeJsArg(value);
  };

  async function hardDeleteMessage(msgId, convId) {
    notify('در حال حذف پیام…', 'info');
    try {
      if (!msgId) {
        notify('شناسه پیام نامعتبر است', 'error');
        return;
      }
      if (!window.confirm('این پیام حذف شود؟')) {
        notify('حذف لغو شد', 'info');
        return;
      }
      var c = window.supabaseClient || window.v12Supabase || null;
      if (!c) {
        notify('اتصال سرور برقرار نیست', 'error');
        return;
      }
      var r = await c.from('messages').delete().eq('id', msgId);
      if (r && r.error) throw r.error;
      notify('✅ پیام حذف شد', 'success');
      if (convId && typeof window.v18OpenAdminConversation === 'function') {
        try {
          await window.v18OpenAdminConversation(convId);
        } catch (e2) {}
      }
    } catch (e) {
      console.error('hardDeleteMessage', e);
      notify('حذف پیام ناموفق: ' + ((e && e.message) || e), 'error');
    }
  }

  window.v18DeleteAdminMessage = async function (msgId, convId) {
    return hardDeleteMessage(msgId, convId);
  };

  function enhanceDeleteButtons() {
    var list = document.getElementById('v18AdminMessageList');
    if (!list) return;
    var buttons = list.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var label = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (label.indexOf('حذف') === -1) continue;
      btn.setAttribute('data-kafe-del', '1');
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';

      var mid = btn.getAttribute('data-msg-id');
      var cid = btn.getAttribute('data-conv-id');
      if (!mid) {
        var oc = btn.getAttribute('onclick') || '';
        var m = oc.match(/v18DeleteAdminMessage\(([^)]*)\)/);
        if (m) {
          var parts = m[1].split(',');
          if (parts.length >= 1) {
            mid = parts[0].replace(/[&quot;"'\s]/g, '');
            btn.setAttribute('data-msg-id', mid);
          }
          if (parts.length >= 2) {
            cid = parts[1].replace(/[&quot;"'\s]/g, '');
            btn.setAttribute('data-conv-id', cid);
          }
        }
      }

      if (!btn.__kafeDelBound) {
        btn.__kafeDelBound = true;
        btn.addEventListener(
          'click',
          function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var id = this.getAttribute('data-msg-id');
            var conv = this.getAttribute('data-conv-id');
            hardDeleteMessage(id, conv);
          },
          true
        );
      }
    }
  }

  // capture-phase global fallback
  if (!window.__kafeDelCapture) {
    window.__kafeDelCapture = true;
    document.addEventListener(
      'click',
      function (ev) {
        var t = ev.target;
        if (!t || !t.closest) return;
        var btn = t.closest('button');
        if (!btn) return;
        var label = (btn.textContent || '').replace(/\s+/g, ' ').trim();
        if (label !== 'حذف پیام' && label.indexOf('حذف پیام') === -1) return;
        if (!btn.closest('#v18AdminMessageList') && !btn.closest('#adminPanel')) return;

        var mid = btn.getAttribute('data-msg-id');
        var cid = btn.getAttribute('data-conv-id');
        if (!mid) {
          var oc = btn.getAttribute('onclick') || '';
          var m = oc.match(/v18DeleteAdminMessage\(([^)]*)\)/);
          if (m) {
            var parts = m[1].split(',');
            mid = (parts[0] || '').replace(/[&quot;"'\s]/g, '');
            cid = (parts[1] || '').replace(/[&quot;"'\s]/g, '');
          }
        }
        if (!mid) {
          notify('شناسه پیام پیدا نشد', 'error');
          return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        hardDeleteMessage(mid, cid);
      },
      true
    );
  }

  function run() {
    injectCSS();
    patchShowDetail();
    patchSubPurchase();
    patchSubOrdersPanel();
    patchRenderAdminModals();
    injectForMeAdminCard();
    forceSubAsPage();
    forceSubOrdersAsPage();
    elevateDetail();
    enhanceDeleteButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 400);
      setTimeout(run, 1200);
    });
  } else {
    run();
    setTimeout(run, 400);
    setTimeout(run, 1200);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 300);
  });
  document.addEventListener(
    'click',
    function () {
      setTimeout(function () {
        forceSubAsPage();
        forceSubOrdersAsPage();
        elevateDetail();
        enhanceDeleteButtons();
        injectForMeAdminCard();
        patchSubPurchase();
        patchSubOrdersPanel();
        patchShowDetail();
      }, 40);
    },
    true
  );
})();
