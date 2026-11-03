/** kafe-seven-fixes.js V4 — بدون دستکاری خرید */
(function () {
  'use strict';
  if (window.__KAFE_SEVEN_FIXES_V4__) return;
  window.__KAFE_SEVEN_FIXES_V4__ = true;

  function unifiedNotify(msg, type) {
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification(String(msg || ''), type === 'error' ? 'error' : '');
      }
    } catch (e) {}
  }
  window.kafeNotify = unifiedNotify;

  async function hardDeleteMessageVerified(msgId, convId) {
    unifiedNotify('در حال حذف پیام…');
    try {
      if (!msgId) {
        unifiedNotify('شناسه پیام نامعتبر است', 'error');
        return;
      }
      if (!window.confirm('این پیام حذف شود؟')) {
        unifiedNotify('حذف لغو شد');
        return;
      }
      var c = window.supabaseClient;
      if (!c) {
        unifiedNotify('اتصال سرور برقرار نیست', 'error');
        return;
      }
      var r = await c.from('messages').delete().eq('id', msgId);
      if (r && r.error) throw r.error;
      var check = await c.from('messages').select('id').eq('id', msgId).maybeSingle();
      if (check && check.data && check.data.id) {
        unifiedNotify('حذف انجام نشد (محدودیت دسترسی).', 'error');
        return;
      }
      unifiedNotify('✅ پیام حذف شد');
      if (convId && typeof window.v18OpenAdminConversation === 'function') {
        await window.v18OpenAdminConversation(convId);
      }
    } catch (e) {
      unifiedNotify('حذف ناموفق: ' + ((e && e.message) || e), 'error');
    }
  }

  window.v18DeleteAdminMessage = function (msgId, convId) {
    return hardDeleteMessageVerified(msgId, convId);
  };

  document.addEventListener(
    'click',
    function (ev) {
      var btn = ev.target && ev.target.closest && ev.target.closest('button');
      if (!btn) return;
      var label = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (label.indexOf('حذف پیام') === -1) return;
      if (!btn.closest('#adminPanel') && !btn.closest('#v18AdminMessageList')) return;
      var oc = btn.getAttribute('onclick') || '';
      var m = oc.match(/v18DeleteAdminMessage\s*\(([^)]*)\)/);
      if (!m) return;
      var parts = m[1].split(',');
      var mid = (parts[0] || '').replace(/[&quot;"'\s]/g, '');
      var cid = (parts[1] || '').replace(/[&quot;"'\s]/g, '');
      if (!mid) return;
      ev.preventDefault();
      ev.stopPropagation();
      hardDeleteMessageVerified(mid, cid);
    },
    true
  );
})();
