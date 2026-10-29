/* پیام‌ها: بدون Realtime دائمی.
   تب پیام‌ها بسته = هیچ رفرش و هیچ کانال.
   تب باز = حداکثر هر ۲.۵ ثانیه، بدون خالی‌کردن لیست (بدون چشمک).
   OTP تلگرام و مسیر ورود مدیر دست نخورده. */
(function () {
  'use strict';

  var POLL_MS = 2500;
  var adminInflight = false;
  var userInflight = false;
  var lastAdminAt = 0;
  var lastUserAt = 0;
  var adminOkUntil = 0;
  var openAdminId = null;
  var openUserId = null;

  function client() {
    return window.supabaseClient || window.v12Supabase || null;
  }

  function dummyChannel() {
    var d = {
      on: function () { return d; },
      subscribe: function () { return d; },
      unsubscribe: function () { return d; }
    };
    return d;
  }

  function killMessageRealtime() {
    var c = client();
    if (!c) return;
    try {
      var chans = typeof c.getChannels === 'function' ? c.getChannels() : [];
      for (var i = 0; i < chans.length; i++) {
        var topic = String((chans[i] && chans[i].topic) || '');
        if (topic.indexOf('v18-messages-live') !== -1) {
          try { c.removeChannel(chans[i]); } catch (e) {}
        }
      }
    } catch (e) {}
    if (c.channel && !c.__kafeMsgChannelPatched) {
      var orig = c.channel.bind(c);
      c.channel = function (name) {
        if (name === 'v18-messages-live') return dummyChannel();
        return orig.apply(c, arguments);
      };
      c.__kafeMsgChannelPatched = true;
    }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }
  function jsArg(v) {
    return JSON.stringify(String(v == null ? '' : v));
  }
  function fmt(d) {
    try { return d ? new Date(d).toLocaleString('fa-IR') : ''; } catch (e) { return ''; }
  }

  function panelOpen(id) {
    var panel = document.getElementById(id);
    if (!panel) return false;
    if (panel.classList.contains('active')) return true;
    var d = panel.style.display;
    return d === 'block' || d === 'flex';
  }

  function adminMessagesOpen() {
    if (!panelOpen('adminPanel')) return false;
    var content = document.getElementById('adminMessages');
    return !!(content && content.classList.contains('active'));
  }

  function userMessagesOpen() {
    return panelOpen('settingsPanel');
  }

  async function isAdminUser() {
    var now = Date.now();
    if (now < adminOkUntil) return true;
    try {
      var c = client();
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
      var ok = !!(r && !r.error && r.data && String(r.data.role || '').toLowerCase() === 'admin');
      if (ok) adminOkUntil = Date.now() + 20000;
      return ok;
    } catch (e) {
      return false;
    }
  }

  function paint(el, html, stickBottom) {
    if (!el) return;
    if (el.getAttribute('data-kafe-html') === html) return;
    var nearBottom = stickBottom && (el.scrollHeight - el.scrollTop - el.clientHeight < 48);
    var top = el.scrollTop;
    el.innerHTML = html;
    el.setAttribute('data-kafe-html', html);
    if (stickBottom && nearBottom) el.scrollTop = el.scrollHeight;
    else el.scrollTop = top;
  }

  async function refreshAdmin(force) {
    if (!force && !adminMessagesOpen()) return;
    if (adminInflight) return;
    var list = document.getElementById('v18AdminConversationList');
    if (!list) return;
    adminInflight = true;
    try {
      var ok = await isAdminUser();
      if (!adminMessagesOpen() && !force) return;
      if (!ok) {
        paint(list, '<p style="color:#8B4513;font-size:.85rem">نشست مدیریت کامل نیست. یک‌بار با OTP دوباره وارد شوید.</p>', false);
        return;
      }
      var c = client();
      if (!c) {
        paint(list, '<p style="color:#a00020">اتصال سرور برقرار نیست.</p>', false);
        return;
      }
      var r = await c
        .from('conversations')
        .select('id,user_id,subject,status,created_at,updated_at')
        .order('updated_at', { ascending: false })
        .limit(100);
      if (!adminMessagesOpen() && !force) return;
      if (r.error) throw r.error;
      var rows = r.data || [];
      window.__v18Conversations = rows;
      var html;
      if (!rows.length) {
        html = '<p style="color:#666;font-size:.8rem">هنوز گفتگویی ثبت نشده است.</p>';
      } else {
        html = rows.map(function (x) {
          var id = jsArg(x.id);
          var active = String(x.id) === String(openAdminId) ? ' active' : '';
          return (
            '<div class="v18-conversation-item' + active + '" style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">' +
            '<div style="flex:1;min-width:0;cursor:pointer" onclick="v18OpenAdminConversation(' + id + ')">' +
            '<strong>' + esc(x.subject || 'بدون موضوع') + '</strong>' +
            '<div class="muted" style="font-size:.75rem;opacity:.85">کاربر: ' + esc(x.user_id) + ' · ' + esc(x.status) + ' · ' + esc(fmt(x.updated_at || x.created_at)) + '</div>' +
            '</div>' +
            '<button type="button" class="danger" title="حذف گفتگو" onclick="event.stopPropagation();v18DeleteAdminConversation(' + id + ')" style="flex-shrink:0;padding:6px 10px;border-radius:8px;border:0;cursor:pointer;background:#a00020;color:#fff;font-size:0.75rem">🗑️ حذف</button>' +
            '</div>'
          );
        }).join('');
      }
      paint(list, html, false);

      var card = document.getElementById('v18AdminConversationCard');
      if (openAdminId && card && card.style.display !== 'none') {
        await refreshAdminThread(c, openAdminId);
      }
    } catch (e) {
      if (!list.getAttribute('data-kafe-html')) {
        paint(list, '<p style="color:#a00020">خطا: ' + esc((e && e.message) || e) + '</p>', false);
      }
    } finally {
      adminInflight = false;
    }
  }

  async function refreshAdminThread(c, id) {
    var box = document.getElementById('v18AdminMessageList');
    if (!box || !c || !id) return;
    var r = await c
      .from('messages')
      .select('id,content,body,text,sender_id,is_from_admin,created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    if (r.error) return;
    var html = (r.data || []).map(function (m) {
      var mid = m.id != null ? String(m.id) : '';
      var text = m.content || m.body || m.text || '';
      return (
        '<div class="v18-bubble ' + (m.is_from_admin ? 'admin' : 'user') + '" style="position:relative">' +
        esc(text) +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px">' +
        '<small>' + esc(m.is_from_admin ? 'مدیریت' : 'کاربر') + ' · ' + esc(fmt(m.created_at)) + '</small>' +
        (mid
          ? '<button type="button" onclick="v18DeleteAdminMessage(' + jsArg(mid) + ',' + jsArg(id) + ')" style="padding:2px 8px;font-size:0.7rem;border-radius:6px;border:1px solid rgba(160,0,32,0.5);background:rgba(160,0,32,0.15);color:#c00;cursor:pointer">حذف پیام</button>'
          : '') +
        '</div></div>'
      );
    }).join('') || '<p style="color:#666">پیامی وجود ندارد.</p>';
    paint(box, html, true);
  }

  async function refreshUser() {
    if (!userMessagesOpen()) return;
    if (userInflight) return;
    var list = document.getElementById('v18UserConversationList');
    if (!list) return;
    userInflight = true;
    try {
      var c = client();
      if (!c || !c.auth) return;
      var sr = await c.auth.getSession();
      var ses = sr && sr.data && sr.data.session;
      if (!ses || !ses.user) return;
      var r = await c
        .from('conversations')
        .select('id,subject,status,created_at,updated_at')
        .eq('user_id', ses.user.id)
        .order('updated_at', { ascending: false })
        .limit(30);
      if (!userMessagesOpen()) return;
      if (r.error) return;
      var rows = r.data || [];
      var html = !rows.length
        ? '<div class="settings-empty">هنوز گفتگویی ندارید.</div>'
        : rows.map(function (x) {
            var active = String(x.id) === String(openUserId) ? ' active' : '';
            return (
              '<div class="v18-conversation-item' + active + '" onclick="v18OpenUserConversation(' + jsArg(x.id) + ')">' +
              '<strong>' + esc(x.subject || 'بدون موضوع') + '</strong>' +
              '<div class="muted">' + esc(x.status || 'open') + ' · ' + esc(fmt(x.updated_at || x.created_at)) + '</div></div>'
            );
          }).join('');
      paint(list, html, false);
      if (openUserId) {
        var mr = await c
          .from('messages')
          .select('id,content,sender_id,is_from_admin,created_at,body,text')
          .eq('conversation_id', openUserId)
          .order('created_at', { ascending: true });
        var box = document.getElementById('v18UserConversationViewer');
        if (box && mr && !mr.error) {
          var mh = (mr.data || []).map(function (m) {
            var text = m.content || m.body || m.text || '';
            return '<div class="v18-bubble ' + (m.is_from_admin ? 'admin' : 'user') + '">' + esc(text) +
              '<small>' + esc(m.is_from_admin ? 'مدیریت' : 'شما') + ' · ' + esc(fmt(m.created_at)) + '</small></div>';
          }).join('') || '<div class="settings-empty">پیامی ثبت نشده است.</div>';
          paint(box, mh, true);
        }
      }
    } catch (e) {
    } finally {
      userInflight = false;
    }
  }

  function hookOpeners() {
    var a = window.v18OpenAdminConversation;
    if (typeof a === 'function' && !a.__kafeQuiet) {
      var wa = async function (id) {
        openAdminId = id;
        var ret = await a.apply(this, arguments);
        var card = document.getElementById('v18AdminConversationCard');
        var box = document.getElementById('v18AdminMessageList');
        if (box) box.removeAttribute('data-kafe-html');
        if (card) { /* original renderer already filled the thread */ }
        return ret;
      };
      wa.__kafeQuiet = true;
      window.v18OpenAdminConversation = wa;
    }
    var u = window.v18OpenUserConversation;
    if (typeof u === 'function' && !u.__kafeQuiet) {
      var wu = async function (id) {
        openUserId = id;
        var box = document.getElementById('v18UserConversationViewer');
        if (box) box.removeAttribute('data-kafe-html');
        return u.apply(this, arguments);
      };
      wu.__kafeQuiet = true;
      window.v18OpenUserConversation = wu;
    }
  }

  window.loadAdminConversations = function () {
    lastAdminAt = Date.now();
    return refreshAdmin(true);
  };
  window.v18LoadAdminMessages = window.loadAdminConversations;

  var prevTab = window.switchAdminTab;
  if (typeof prevTab === 'function' && !prevTab.__kafeMsgTab) {
    var wrappedTab = function (tabId) {
      var ret = prevTab.apply(this, arguments);
      if (tabId === 'messages') {
        lastAdminAt = Date.now();
        setTimeout(function () { refreshAdmin(true); }, 30);
      } else {
        lastAdminAt = 0;
      }
      return ret;
    };
    wrappedTab.__kafeMsgTab = true;
    window.switchAdminTab = wrappedTab;
  }

  function tick() {
    killMessageRealtime();
    hookOpeners();
    var now = Date.now();
    if (adminMessagesOpen()) {
      if (now - lastAdminAt >= POLL_MS) {
        lastAdminAt = now;
        refreshAdmin(false);
      }
    }
    if (userMessagesOpen()) {
      if (now - lastUserAt >= POLL_MS) {
        lastUserAt = now;
        refreshUser();
      }
    }
  }

  killMessageRealtime();
  [300, 900, 1400, 2200, 4000].forEach(function (ms) {
    setTimeout(killMessageRealtime, ms);
  });
  setInterval(tick, 500);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    lastAdminAt = 0;
    lastUserAt = 0;
  });
})();
