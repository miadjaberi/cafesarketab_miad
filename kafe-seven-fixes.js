/** kafe-seven-fixes.js V3 — بدون دستکاری ظاهر خرید (purchase-hold مسئول است) */
(function () {
  'use strict';
  if (window.__KAFE_SEVEN_FIXES_V3__) return;
  window.__KAFE_SEVEN_FIXES_V3__ = true;

  function unifiedNotify(msg, type) {
    var text = String(msg || '');
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification(text, type === 'error' ? 'error' : type || '');
        return;
      }
    } catch (e) {}
  }
  window.kafeNotify = unifiedNotify;

  (function () {
    var id = 'kafe-unified-notify-css';
    if (document.getElementById(id)) return;
    var st = document.createElement('style');
    st.id = id;
    st.textContent = [
      '#notification{',
      '  position:fixed!important;left:50%!important;transform:translateX(-50%)!important;',
      '  bottom:calc(var(--bottom-nav-height,68px) + 16px)!important;',
      '  z-index:2147483000!important;max-width:92vw!important;',
      '  padding:12px 16px!important;border-radius:12px!important;',
      '  font-size:0.92rem!important;font-weight:800!important;text-align:center!important;direction:rtl!important;',
      '  background:#0b1120!important;color:#F0D878!important;',
      '  border:2px solid #c9a84c!important;',
      '}',
      '#notification.error{color:#fff!important;background:#5a1520!important;border-color:#c44!important;}',
      '#kafeHardToast{display:none!important;}'
    ].join('\n');
    document.head.appendChild(st);
  })();

  async function hardDeleteMessageVerified(msgId, convId) {
    unifiedNotify('در حال حذف پیام…');
    try {
      if (!msgId) {
        unifiedNotify('شناسه پیام نامعتبر است', 'error');
        return;
      }
      var ok = false;
      try {
        ok = window.confirm('این پیام حذف شود؟');
      } catch (e) {
        ok = true;
      }
      if (!ok) {
        unifiedNotify('حذف لغو شد');
        return;
      }
      var c = window.supabaseClient || null;
      if (!c) {
        unifiedNotify('اتصال سرور برقرار نیست', 'error');
        return;
      }
      var r = await c.from('messages').delete().eq('id', msgId);
      if (r && r.error) throw r.error;
      var check = await c.from('messages').select('id').eq('id', msgId).maybeSingle();
      if (check && check.data && check.data.id) {
        unifiedNotify('حذف انجام نشد (محدودیت دسترسی سرور / نقش admin).', 'error');
        return;
      }
      unifiedNotify('✅ پیام حذف شد');
      if (convId && typeof window.v18OpenAdminConversation === 'function') {
        try {
          await window.v18OpenAdminConversation(convId);
        } catch (e2) {}
      }
    } catch (e) {
      unifiedNotify('حذف ناموفق: ' + ((e && e.message) || e), 'error');
    }
  }

  window.v18DeleteAdminMessage = function (msgId, convId) {
    return hardDeleteMessageVerified(msgId, convId);
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

  if (!window.__kafeDelSevenV3) {
    window.__kafeDelSevenV3 = true;
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
          unifiedNotify('شناسه پیام پیدا نشد', 'error');
          return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        hardDeleteMessageVerified(a.mid, a.cid);
      },
      true
    );
  }

  function bindBuy() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    var buttons = nav.querySelectorAll('button.nav-item-bottom');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.classList.contains('center-btn')) continue;
      var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
      var oc = b.getAttribute('onclick') || '';
      if (!(oc.indexOf('openSubOrdersPanel') >= 0 || label.indexOf('خرید') >= 0)) continue;
      if (b.__kafeSevenBuyV3) continue;
      b.__kafeSevenBuyV3 = true;
      b.setAttribute('onclick', 'void(0)');
      b.addEventListener(
        'click',
        function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
          if (typeof window.openSubscriptionPurchase === 'function') {
            window.openSubscriptionPurchase();
          }
        },
        true
      );
    }
  }

  function run() {
    bindBuy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 800);
    });
  } else {
    run();
    setTimeout(run, 800);
  }
})();
