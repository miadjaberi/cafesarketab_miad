/** admin-ui-four-fixes.js V3
 * خرید اشتراک = صفحه داخل فریم (بین هدر و نوار پایین)
 * حذف پیام = بازخورد قطعی (toast + alert fallback)
 * جزئیات ادمین بالای پنل
 */
(function () {
  'use strict';
  window.__KAFE_ADMIN_UI_FOUR_FIXES_V3__ = true;

  function notify(msg, type) {
    var text = String(msg || '');
    var shown = false;
    try {
      if (typeof showNotification === 'function') {
        showNotification(text, type || 'info');
        shown = true;
      }
    } catch (e) {}
    try {
      if (!shown && typeof window.showNotification === 'function') {
        window.showNotification(text, type || 'info');
        shown = true;
      }
    } catch (e2) {}
    try {
      var t = document.getElementById('kafeHardToast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'kafeHardToast';
        t.style.cssText =
          'position:fixed;left:50%;bottom:calc(var(--bottom-nav-height,68px) + 20px);transform:translateX(-50%);' +
          'z-index:2147483000;max-width:92vw;padding:12px 16px;border-radius:12px;font-size:0.92rem;font-weight:800;' +
          'background:#0b1120;color:#F0D878;border:2px solid #c9a84c;box-shadow:0 10px 28px rgba(0,0,0,.5);' +
          'text-align:center;direction:rtl;';
        document.body.appendChild(t);
      }
      t.textContent = text;
      t.style.display = 'block';
      clearTimeout(t._hide);
      t._hide = setTimeout(function () {
        t.style.display = 'none';
      }, 4000);
      shown = true;
    } catch (e3) {}
    if (!shown) {
      try {
        alert(text);
      } catch (e4) {}
    }
  }

  function headerNavHeights() {
    var headerH = 152,
      navH = 68;
    try {
      var hdr =
        document.querySelector('#appHeader') ||
        document.querySelector('header.app-header') ||
        document.querySelector('header');
      if (hdr) headerH = Math.round(hdr.getBoundingClientRect().height) || headerH;
      var nav = document.getElementById('bottomNav');
      if (nav) navH = Math.round(nav.getBoundingClientRect().height) || navH;
    } catch (e) {}
    return { headerH: headerH, navH: navH };
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
      '#subscriptionModalBox{',
      '  position:fixed!important;',
      '  left:0!important;right:0!important;',
      '  inset:auto!important;',
      '  width:100%!important;',
      '  z-index:120!important;',
      '  display:flex!important;',
      '  flex-direction:column!important;',
      '  align-items:stretch!important;',
      '  justify-content:flex-start!important;',
      '  padding:0!important;margin:0!important;',
      '  background:#0b1120!important;',
      '  border-radius:0!important;',
      '  backdrop-filter:none!important;',
      '}',
      '#subscriptionModalBox > div{',
      '  width:100%!important;max-width:none!important;',
      '  height:100%!important;max-height:none!important;',
      '  margin:0!important;',
      '  border-radius:0!important;',
      '  border:none!important;',
      '  border-top:1px solid rgba(201,168,76,.28)!important;',
      '  background:#0b1120!important;',
      '  box-shadow:none!important;',
      '  overflow-y:auto!important;',
      '  padding:14px 14px 22px!important;',
      '}',
      '#subOrdersPanel{',
      '  position:fixed!important;',
      '  left:0!important;right:0!important;',
      '  inset:auto!important;',
      '  z-index:110!important;',
      '  background:#0b1120!important;',
      '  padding:0!important;',
      '  align-items:stretch!important;',
      '}',
      '#subOrdersPanel .sub-orders-sheet{',
      '  width:100%!important;max-width:none!important;',
      '  height:100%!important;border-radius:0!important;',
      '  margin:0!important;background:#0b1120!important;',
      '  border:none!important;border-top:1px solid rgba(201,168,76,.28)!important;',
      '  overflow:auto!important;',
      '}'
    ].join('\n');
  }

  function forceSubAsPage() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    var h = headerNavHeights();
    box.style.cssText = '';
    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('top', h.headerH + 'px', 'important');
    box.style.setProperty('bottom', h.navH + 'px', 'important');
    box.style.setProperty('left', '0', 'important');
    box.style.setProperty('right', '0', 'important');
    box.style.setProperty('inset', 'auto', 'important');
    box.style.setProperty('width', '100%', 'important');
    box.style.setProperty('z-index', '120', 'important');
    box.style.setProperty('display', 'flex', 'important');
    box.style.setProperty('flex-direction', 'column', 'important');
    box.style.setProperty('align-items', 'stretch', 'important');
    box.style.setProperty('justify-content', 'flex-start', 'important');
    box.style.setProperty('padding', '0', 'important');
    box.style.setProperty('margin', '0', 'important');
    box.style.setProperty('background', '#0b1120', 'important');
    box.style.setProperty('border-radius', '0', 'important');
    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('max-width', 'none', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      sheet.style.setProperty('margin', '0', 'important');
      sheet.style.setProperty('border-radius', '0', 'important');
      sheet.style.setProperty('border', 'none', 'important');
      sheet.style.setProperty('background', '#0b1120', 'important');
      sheet.style.setProperty('box-shadow', 'none', 'important');
      sheet.style.setProperty('overflow-y', 'auto', 'important');
      sheet.style.setProperty('padding', '14px 14px 22px', 'important');
    }
  }

  function forceSubOrdersAsPage() {
    var p = document.getElementById('subOrdersPanel');
    if (!p) return;
    var vis = p.style.display;
    if (vis !== 'flex' && vis !== 'block') return;
    var h = headerNavHeights();
    p.style.setProperty('position', 'fixed', 'important');
    p.style.setProperty('top', h.headerH + 'px', 'important');
    p.style.setProperty('bottom', h.navH + 'px', 'important');
    p.style.setProperty('left', '0', 'important');
    p.style.setProperty('right', '0', 'important');
    p.style.setProperty('inset', 'auto', 'important');
    p.style.setProperty('background', '#0b1120', 'important');
    p.style.setProperty('z-index', '110', 'important');
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
    if (typeof prev !== 'function' || prev.__kafeV3) return;
    window.openSubscriptionPurchase = async function () {
      var ret = await prev.apply(this, arguments);
      forceSubAsPage();
      [0, 30, 80, 160, 300, 600].forEach(function (ms) {
        setTimeout(forceSubAsPage, ms);
      });
      return ret;
    };
    window.openSubscriptionPurchase.__kafeV3 = true;
  }

  function patchSubOrders() {
    var prev = window.openSubOrdersPanel;
    if (typeof prev !== 'function' || prev.__kafeV3) return;
    window.openSubOrdersPanel = async function () {
      var ret = await prev.apply(this, arguments);
      setTimeout(forceSubOrdersAsPage, 0);
      setTimeout(forceSubOrdersAsPage, 100);
      return ret;
    };
    window.openSubOrdersPanel.__kafeV3 = true;
  }

  function elevateDetail() {
    var el = document.getElementById('kafeAdminPurchaseDetail');
    if (!el) return;
    el.style.setProperty('z-index', '100150', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('display', 'flex', 'important');
  }

  function patchDetail() {
    var prev = window.showAdminPurchaseDetail;
    if (typeof prev !== 'function' || prev.__kafeV3) return;
    window.showAdminPurchaseDetail = function () {
      var ret = prev.apply(this, arguments);
      setTimeout(elevateDetail, 0);
      setTimeout(elevateDetail, 80);
      return ret;
    };
    window.showAdminPurchaseDetail.__kafeV3 = true;
  }

  window.kafeHtmlJsArg = function (value) {
    return (
      "'" +
      String(value == null ? '' : value)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'") +
      "'"
    );
  };

  async function hardDeleteMessage(msgId, convId) {
    notify('در حال حذف پیام…');
    try {
      if (!msgId) {
        notify('شناسه پیام نامعتبر است');
        return;
      }
      var ok = false;
      try {
        ok = window.confirm('این پیام حذف شود؟');
      } catch (eC) {
        ok = true;
      }
      if (!ok) {
        notify('حذف لغو شد');
        return;
      }
      var c = window.supabaseClient || window.v12Supabase || null;
      if (!c) {
        notify('اتصال سرور برقرار نیست');
        return;
      }
      var r = await c.from('messages').delete().eq('id', msgId);
      if (r && r.error) throw r.error;
      notify('✅ پیام حذف شد');
      if (convId && typeof window.v18OpenAdminConversation === 'function') {
        try {
          await window.v18OpenAdminConversation(convId);
        } catch (e2) {}
      }
    } catch (e) {
      console.error('hardDeleteMessage', e);
      notify('حذف ناموفق: ' + ((e && e.message) || e));
    }
  }

  window.v18DeleteAdminMessage = function (msgId, convId) {
    return hardDeleteMessage(msgId, convId);
  };

  function parseDeleteArgs(btn) {
    var mid = btn.getAttribute('data-msg-id');
    var cid = btn.getAttribute('data-conv-id');
    if (mid) return { mid: mid, cid: cid };
    var oc = btn.getAttribute('onclick') || '';
    var m = oc.match(/v18DeleteAdminMessage\s*\(([^)]*)\)/);
    if (!m) return null;
    var parts = m[1].split(',');
    mid = (parts[0] || '').replace(/[&quot;"'\s]/g, '');
    cid = (parts[1] || '').replace(/[&quot;"'\s]/g, '');
    return { mid: mid, cid: cid };
  }

  function enhanceDeleteButtons() {
    var roots = [
      document.getElementById('v18AdminMessageList'),
      document.getElementById('adminPanel')
    ];
    roots.forEach(function (root) {
      if (!root) return;
      root.querySelectorAll('button').forEach(function (btn) {
        var label = (btn.textContent || '').replace(/\s+/g, ' ').trim();
        if (label.indexOf('حذف پیام') === -1) return;
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        var args = parseDeleteArgs(btn);
        if (args && args.mid) {
          btn.setAttribute('data-msg-id', args.mid);
          if (args.cid) btn.setAttribute('data-conv-id', args.cid);
        }
        if (!btn.__kafeDelV3) {
          btn.__kafeDelV3 = true;
          btn.addEventListener(
            'click',
            function (ev) {
              ev.preventDefault();
              ev.stopImmediatePropagation();
              var a = parseDeleteArgs(this) || {
                mid: this.getAttribute('data-msg-id'),
                cid: this.getAttribute('data-conv-id')
              };
              hardDeleteMessage(a && a.mid, a && a.cid);
            },
            true
          );
        }
      });
    });
  }

  if (!window.__kafeDelCaptureV3) {
    window.__kafeDelCaptureV3 = true;
    document.addEventListener(
      'click',
      function (ev) {
        var t = ev.target;
        if (!t || !t.closest) return;
        var btn = t.closest('button');
        if (!btn) return;
        var label = (btn.textContent || '').replace(/\s+/g, ' ').trim();
        if (label.indexOf('حذف پیام') === -1) return;
        if (!btn.closest('#adminPanel') && !btn.closest('#v18AdminMessageList')) return;
        var a = parseDeleteArgs(btn);
        if (!a || !a.mid) {
          notify('شناسه پیام پیدا نشد');
          return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        hardDeleteMessage(a.mid, a.cid);
      },
      true
    );
  }

  // observer for subscription box appearance
  try {
    var mo = new MutationObserver(function () {
      if (document.getElementById('subscriptionModalBox')) forceSubAsPage();
      enhanceDeleteButtons();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  function run() {
    injectCSS();
    patchSubPurchase();
    patchSubOrders();
    patchDetail();
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
        patchSubPurchase();
        patchSubOrders();
        patchDetail();
      }, 40);
    },
    true
  );
})();
