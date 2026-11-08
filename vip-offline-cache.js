/* حافظه آفلاین اشتراک — فقط برای UI/ابزارهای محلی؛ نه مجوز امنیتی سرور */
(function () {
  'use strict';
  var PREFIX = 'kafeVipOfflineCache:';
  var NOTICE_KEY = 'kafeVipPendingNoticeShown';
  var lastUid = null;
  function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (e) { return fallback; } }
  function currentLocalUser() { return readJSON('cafeUser', {}); }
  function readCache(uid) { return uid ? readJSON(PREFIX + String(uid), null) : null; }
  function writeCache(c) {
    if (!c || !c.userId) return;
    try { localStorage.setItem(PREFIX + String(c.userId), JSON.stringify(c)); } catch (e) {}
  }
  function applyCache(uid) {
    if (!uid) return null;
    var c = readCache(uid);
    if (!c) return null;
    var exp = c.expiry ? new Date(c.expiry) : null;
    var active = !!(c.active && exp && !isNaN(exp.getTime()) && exp.getTime() > Date.now());
    var sub = { active: active, expiry: c.expiry || null, plan: c.plan || null, role: c.role || 'user', userId: String(uid), source: 'offline-cache' };
    try { localStorage.setItem('userSubscription', JSON.stringify(sub)); } catch (e) {}
    window.__kafeVipOfflineState = c;
    if (c.pending && !sessionStorage.getItem(NOTICE_KEY)) {
      try { sessionStorage.setItem(NOTICE_KEY, '1'); } catch (e2) {}
      setTimeout(function () {
        if (typeof window.showNotification === 'function') window.showNotification('درخواست اشتراک شما در انتظار تأیید مدیریت است؛ هنوز فعال نشده است.', 'warning');
      }, 1800);
    }
    return c;
  }
  async function refresh() {
    var client = window.supabaseClient || null;
    var uid = null;
    if (client && client.auth) {
      try {
        var sr = await client.auth.getSession();
        uid = sr && sr.data && sr.data.session && sr.data.session.user ? sr.data.session.user.id : null;
      } catch (e) {}
    }
    if (!uid) {
      var local = currentLocalUser();
      uid = local && local.id ? String(local.id) : null;
    }
    lastUid = uid ? String(uid) : null;
    var previous = applyCache(uid);
    if (!uid || !client || !client.auth || !navigator.onLine) return previous;
    var session;
    try {
      var sr2 = await client.auth.getSession();
      session = sr2 && sr2.data && sr2.data.session;
    } catch (e2) { return previous; }
    if (!session || !session.user || String(session.user.id) !== String(uid)) return previous;
    var cache = previous || { userId: String(uid), role: 'user', active: false, expiry: null, plan: null, pending: false };
    cache.userId = String(uid);
    try {
      var pr = await client.from('profiles').select('role').eq('id', uid).maybeSingle();
      if (!pr.error && pr.data) cache.role = String(pr.data.role || 'user');
    } catch (e3) {}
    try {
      var subs = await client.from('subscriptions').select('plan,expiry_date,active,created_at').eq('user_id', uid).eq('active', true).order('created_at', { ascending: false }).limit(20);
      if (!subs.error && Array.isArray(subs.data)) {
        var now = Date.now();
        var active = subs.data.find(function (x) {
          var d = x && x.expiry_date ? new Date(x.expiry_date) : null;
          return !!(x && x.active && d && !isNaN(d.getTime()) && d.getTime() > now);
        });
        cache.active = !!active;
        cache.expiry = active ? active.expiry_date : null;
        cache.plan = active ? (active.plan || 'اشتراک') : null;
      }
    } catch (e4) {}
    try {
      var req = await client.from('subscription_requests').select('status,plan,created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(20);
      if (!req.error && Array.isArray(req.data)) {
        var pending = req.data.find(function (x) { return !x.status || /pending|انتظار|جدید/i.test(String(x.status)); });
        cache.pending = !!pending;
        cache.pendingStatus = pending ? String(pending.status || 'در انتظار تأیید') : null;
        cache.pendingPlan = pending ? (pending.plan || null) : null;
      }
    } catch (e5) {}
    cache.checkedAt = new Date().toISOString();
    writeCache(cache);
    applyCache(uid);
    return cache;
  }
  window.kafeRefreshVipOfflineCache = refresh;
  function start() {
    refresh().catch(function () {});
    var c = window.supabaseClient;
    if (c && c.auth && typeof c.auth.onAuthStateChange === 'function' && !window.__kafeVipAuthListener) {
      window.__kafeVipAuthListener = true;
      c.auth.onAuthStateChange(function (event) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') setTimeout(function () { refresh().catch(function () {}); }, 0);
        if (event === 'SIGNED_OUT') {
          var signedOutUid = lastUid;
          try { if (signedOutUid) localStorage.removeItem(PREFIX + String(signedOutUid)); } catch (e0) {}
          try { localStorage.setItem('userSubscription', JSON.stringify({ active: false, expiry: null, plan: null })); } catch (e1) {}
          window.__kafeVipOfflineState = null;
          lastUid = null;
        }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
