/* Admin messages + throttle (P1) — جلوگیری از رفرش پشت‌سرهم لیست */
(function () {
  'use strict';

  var lastLoad = 0;
  var MIN_GAP_MS = 2500;

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
      if (r && !r.error && r.data && String(r.data.role || '').toLowerCase() === 'admin') return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  window.kafeIsAdminUser = kafeIsAdminUser;
  window.isAdmin = kafeIsAdminUser;

  async function loadAdminConversationsFixed(force) {
    var list = document.getElementById('v18AdminConversationList');
    if (!list) return;
    var now = Date.now();
    if (!force && now - lastLoad < MIN_GAP_MS) return;
    lastLoad = now;

    var ok = await kafeIsAdminUser();
    if (!ok) {
      var panel = document.getElementById('adminPanel');
      var panelOpen = panel && (panel.classList.contains('active') || (panel.style.display && panel.style.display !== 'none'));
      list.innerHTML = panelOpen
        ? '<p style="color:#8B4513;font-size:.85rem">نشست مدیریت کامل نیست. یک‌بار با OTP دوباره وارد شوید.</p>'
        : '<p style="color:#666;font-size:.8rem">پس از ورود مدیریت، گفتگوها اینجا می‌آیند.</p>';
      return;
    }

    var c = window.supabaseClient;
    if (!c) {
      list.innerHTML = '<p style="color:#a00020">اتصال سرور برقرار نیست.</p>';
      return;
    }

    list.innerHTML = '<p style="color:#666;font-size:.8rem">در حال بارگذاری…</p>';
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
          .replace(/>/g, '&gt;');
      }
      function fmt(d) {
        try {
          return d ? new Date(d).toLocaleString('fa-IR') : '';
        } catch (e) {
          return '';
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
            '<div class="v18-conversation-item" style="display:flex;gap:8px;margin-bottom:8px;padding:10px;border-radius:10px;background:rgba(255,255,255,0.04)">' +
            '<div style="flex:1;cursor:pointer" onclick="window.v18OpenAdminConversation&&v18OpenAdminConversation(' +
            arg(x.id) +
            ')"><strong>' +
            esc(x.subject || 'بدون موضوع') +
            '</strong><div style="font-size:.75rem;opacity:.85">' +
            esc(x.status) +
            ' · ' +
            esc(fmt(x.updated_at || x.created_at)) +
            '</div></div></div>'
          );
        })
        .join('');
    } catch (e) {
      list.innerHTML = '<p style="color:#a00020">خطا: ' + String((e && e.message) || e) + '</p>';
    }
  }

  window.loadAdminConversations = function () {
    return loadAdminConversationsFixed(false);
  };
  window.v18LoadAdminMessages = function () {
    return loadAdminConversationsFixed(true);
  };

  var _sw = window.switchAdminTab;
  if (typeof _sw === 'function') {
    window.switchAdminTab = function (tabId) {
      var ret = _sw.apply(this, arguments);
      if (tabId === 'messages') setTimeout(function () {
        loadAdminConversationsFixed(true);
      }, 50);
      return ret;
    };
  }

  document.addEventListener(
    'click',
    function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var tab = t.closest('.admin-tab, [data-tab="messages"]');
      if (tab && (tab.getAttribute('data-tab') === 'messages' || /پیام/.test(tab.textContent || ''))) {
        setTimeout(function () {
          loadAdminConversationsFixed(true);
        }, 100);
      }
    },
    true
  );
})();
