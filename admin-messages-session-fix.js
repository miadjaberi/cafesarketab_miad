/**
 * admin-messages-session-fix.js
 * رفع: بعد از OTP مدیر، getSession گاهی null می‌ماند و loadUserMessages
 * پیام «باید وارد حساب شوید» نشان می‌دهد. نشست را با getSession+getUser محکم می‌کنیم
 * و بعد از SIGNED_IN لیست پیام‌ها را دوباره بار می‌کنیم.
 */
(function () {
  'use strict';
  if (window.__KAFE_MSG_SESSION_FIX__) return;
  window.__KAFE_MSG_SESSION_FIX__ = true;

  function client() {
    return window.supabaseClient || window.v12Supabase || null;
  }

  function setStatus(t, err) {
    var x = document.getElementById('v18MessageStatus');
    if (!x) return;
    x.textContent = t || '';
    x.style.color = err ? '#a00020' : '';
  }

  async function getAuthSession() {
    var c = client();
    if (!c || !c.auth) return null;
    try {
      var sr = await c.auth.getSession();
      var ses = sr && sr.data && sr.data.session;
      if (ses && ses.user && !ses.user.is_anonymous) return ses;
    } catch (e1) {}
    try {
      var ur = await c.auth.getUser();
      var u = ur && ur.data && ur.data.user;
      if (!u || !u.id || u.is_anonymous) return null;
      var sr2 = await c.auth.getSession();
      if (sr2 && sr2.data && sr2.data.session) return sr2.data.session;
      return { user: u };
    } catch (e2) {
      return null;
    }
  }

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmt(v) {
    try {
      return v ? new Date(v).toLocaleString('fa-IR') : '';
    } catch (e) {
      return String(v || '');
    }
  }

  async function forceLoadUserMessages() {
    var list = document.getElementById('v18UserConversationList');
    if (!list) return;
    var c = client();
    var ses = await getAuthSession();
    if (!ses || !ses.user) {
      setStatus('برای ارسال و مشاهده پیام‌ها باید وارد حساب کاربری باشید.', true);
      list.innerHTML = '<div class="settings-empty">ابتدا وارد حساب شوید.</div>';
      return;
    }
    setStatus('پیام‌ها و پاسخ‌ها از سرور دریافت می‌شوند.', false);
    if (!c) return;
    try {
      var r = await c
        .from('conversations')
        .select('id,subject,status,created_at,updated_at')
        .eq('user_id', ses.user.id)
        .order('updated_at', { ascending: false })
        .limit(30);
      if (r.error) throw r.error;
      var rows = r.data || [];
      if (!rows.length) {
        list.innerHTML = '<div class="settings-empty">هنوز گفتگویی ندارید.</div>';
        return;
      }
      list.innerHTML = rows
        .map(function (x) {
          return (
            '<div class="v18-conversation-item" onclick="v18OpenUserConversation(' +
            JSON.stringify(String(x.id)) +
            ')"><strong>' +
            esc(x.subject || 'بدون موضوع') +
            '</strong><div class="muted">' +
            esc(x.status || 'open') +
            ' · ' +
            esc(fmt(x.updated_at || x.created_at)) +
            '</div></div>'
          );
        })
        .join('');
    } catch (e) {
      console.error('[msg-session] loadUserMessages', e);
      list.innerHTML =
        '<div class="settings-empty">خطا در دریافت پیام‌ها: ' +
        esc(e.message || e) +
        '</div>';
    }
  }

  async function forceLoadAdminMessages() {
    if (typeof window.loadAdminConversations === 'function') {
      try {
        await window.loadAdminConversations();
      } catch (e) {
        console.warn('[msg-session] admin load', e);
      }
    }
  }

  function onAuthReady() {
    setTimeout(function () {
      forceLoadUserMessages();
      forceLoadAdminMessages();
    }, 50);
    setTimeout(function () {
      forceLoadUserMessages();
      forceLoadAdminMessages();
    }, 400);
    setTimeout(forceLoadUserMessages, 1200);
  }

  function hookAuth() {
    var c = client();
    if (!c || !c.auth || c.__kafeMsgAuthHooked) return;
    c.__kafeMsgAuthHooked = true;
    try {
      c.auth.onAuthStateChange(function (event, session) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (session && session.user)) {
          onAuthReady();
        }
      });
    } catch (e) {
      console.warn('[msg-session] onAuthStateChange', e);
    }
  }

  function hookToggleAdmin() {
    var prev = window.toggleAdmin;
    if (typeof prev !== 'function' || prev.__kafeMsgSessionWrap) return;
    window.toggleAdmin = async function () {
      var ret = await prev.apply(this, arguments);
      onAuthReady();
      return ret;
    };
    window.toggleAdmin.__kafeMsgSessionWrap = true;
  }

  async function clearFalseLoginBanner() {
    var ses = await getAuthSession();
    if (!ses) return;
    var st = document.getElementById('v18MessageStatus');
    if (st && /وارد حساب/.test(st.textContent || '')) {
      setStatus('پیام‌ها و پاسخ‌ها از سرور دریافت می‌شوند.', false);
    }
  }

  function run() {
    hookAuth();
    hookToggleAdmin();
    clearFalseLoginBanner();
    forceLoadUserMessages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 200);
    });
  } else {
    setTimeout(run, 200);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 600);
    setTimeout(hookToggleAdmin, 1000);
  });
  [1500, 3000].forEach(function (ms) {
    setTimeout(function () {
      hookAuth();
      hookToggleAdmin();
      clearFalseLoginBanner();
    }, ms);
  });

  window.__kafeForceLoadUserMessages = forceLoadUserMessages;
})();
