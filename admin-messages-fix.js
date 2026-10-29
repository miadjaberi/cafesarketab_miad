/* Admin messages: fix false "دسترسی مدیریت لازم است" when panel is already open */
(function () {
  'use strict';

  async function kafeIsAdminUser() {
    try {
      var c = window.supabaseClient;
      if (!c || !c.auth) return false;
      var user = null;
      try {
        var ur = await c.auth.getUser();
        user = ur && ur.data && ur.data.user;
      } catch (eU) {}
      if (!user || !user.id || user.is_anonymous) {
        try {
          var sr = await c.auth.getSession();
          var ses = sr && sr.data && sr.data.session;
          user = ses && ses.user;
        } catch (eS) {}
      }
      if (!user || !user.id || user.is_anonymous) return false;

      var r = await c.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (r && !r.error && r.data && String(r.data.role || '').toLowerCase() === 'admin') {
        return true;
      }
      /* اگر پنل مدیریت باز است، یک‌بار دیگر session را تازه کن */
      var panel = document.getElementById('adminPanel');
      if (panel && (panel.classList.contains('active') || panel.style.display === 'block')) {
        try {
          await c.auth.refreshSession();
        } catch (eR) {}
        var r2 = await c.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (r2 && !r2.error && r2.data && String(r2.data.role || '').toLowerCase() === 'admin') {
          return true;
        }
      }
      return false;
    } catch (e) {
      console.warn('kafeIsAdminUser', e);
      return false;
    }
  }

  window.kafeIsAdminUser = kafeIsAdminUser;

  /* جایگزینی isAdmin سراسری برای بخش پیام‌ها */
  window.isAdmin = kafeIsAdminUser;

  async function loadAdminConversationsFixed() {
    var list = document.getElementById('v18AdminConversationList');
    if (!list) return;

    var ok = await kafeIsAdminUser();
    if (!ok) {
      var panel = document.getElementById('adminPanel');
      var panelOpen = panel && (panel.classList.contains('active') || (panel.style.display && panel.style.display !== 'none'));
      if (panelOpen) {
        list.innerHTML =
          '<p style="color:#8B4513;font-size:.85rem;line-height:1.7">نشست مدیریت برای پیام‌ها کامل تأیید نشد.<br>یک‌بار پنل را ببندید و با OTP دوباره وارد شوید، یا تب پیام‌ها را دوباره بزنید.</p>';
      } else {
        list.innerHTML =
          '<p style="color:#666;font-size:.8rem;line-height:1.7">پس از ورود به پنل مدیریت، گفتگوهای کاربران اینجا نمایش داده می‌شوند.</p>';
      }
      return;
    }

    var c = window.supabaseClient;
    if (!c) {
      list.innerHTML = '<p style="color:#a00020">اتصال سرور برقرار نیست.</p>';
      return;
    }

    list.innerHTML = '<p style="color:#666;font-size:.8rem">در حال بارگذاری پیام‌ها...</p>';
    try {
      var r = await c
        .from('conversations')
        .select('id,user_id,subject,status,created_at,updated_at')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (r.error) throw r.error;
      var rows = r.data || [];
      window.__v18Conversations = rows;

      function esc(s) {
        return String(s == null ? '' : s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }
      function fmt(d) {
        try {
          return d ? new Date(d).toLocaleString('fa-IR') : '';
        } catch (e) {
          return String(d || '');
        }
      }
      function arg(v) {
        return JSON.stringify(String(v == null ? '' : v));
      }

      if (!rows.length) {
        list.innerHTML = '<p style="color:#666;font-size:.8rem">هنوز گفتگویی ثبت نشده است.</p>';
        return;
      }

      list.innerHTML = rows
        .map(function (x) {
          return (
            '<div class="v18-conversation-item" style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;padding:10px;border-radius:10px;background:rgba(255,255,255,0.04)">' +
            '<div style="flex:1;min-width:0;cursor:pointer" onclick="window.v18OpenAdminConversation && v18OpenAdminConversation(' +
            arg(x.id) +
            ')">' +
            '<strong>' +
            esc(x.subject || 'بدون موضوع') +
            '</strong>' +
            '<div class="muted" style="font-size:.75rem;opacity:.85">کاربر: ' +
            esc(x.user_id) +
            ' · ' +
            esc(x.status) +
            ' · ' +
            esc(fmt(x.updated_at || x.created_at)) +
            '</div></div>' +
            '<button type="button" class="danger" onclick="event.stopPropagation();window.v18DeleteAdminConversation && v18DeleteAdminConversation(' +
            arg(x.id) +
            ')" style="flex-shrink:0;padding:6px 10px;border-radius:8px;border:0;cursor:pointer;background:#a00020;color:#fff;font-size:0.75rem">حذف</button>' +
            '</div>'
          );
        })
        .join('');
    } catch (e) {
      console.error('loadAdminConversationsFixed', e);
      list.innerHTML =
        '<p style="color:#a00020;font-size:.85rem">خطا در دریافت پیام‌ها: ' +
        String((e && e.message) || e) +
        '</p>';
    }
  }

  window.loadAdminConversations = loadAdminConversationsFixed;
  window.v18LoadAdminMessages = loadAdminConversationsFixed;

  /* وقتی تب پیام‌ها باز شد دوباره بارگذاری کن */
  var _sw = window.switchAdminTab;
  if (typeof _sw === 'function') {
    window.switchAdminTab = function (tabId) {
      var ret = _sw.apply(this, arguments);
      if (tabId === 'messages') {
        setTimeout(function () {
          loadAdminConversationsFixed();
        }, 50);
      }
      return ret;
    };
  }

  document.addEventListener(
    'click',
    function (ev) {
      var t = ev.target;
      if (!t) return;
      var tab = t.closest && t.closest('.admin-tab, [data-tab="messages"]');
      if (tab && (tab.getAttribute('data-tab') === 'messages' || /پیام/.test(tab.textContent || ''))) {
        setTimeout(function () {
          loadAdminConversationsFixed();
        }, 100);
      }
    },
    true
  );
})();
