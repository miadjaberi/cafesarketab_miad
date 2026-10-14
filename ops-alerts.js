/* کاربران داشبورد + اعلان درخواست خرید/اشتراک و نتیجه برای کاربر
   جدا از main.js تا فایل اصلی دست نخورَد. */
(function () {
  'use strict';

  function sb() { return window.supabaseClient || null; }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (m) {
      return { '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#039;' }[m];
    });
  }

  function fmt(v) {
    if (!v) return '';
    try { return new Date(v).toLocaleString('fa-IR'); } catch (e) { return String(v); }
  }

  function decided(status) {
    var s = String(status || '');
    if (!s || /انتظار|pending|بررسی|جدید/i.test(s)) return '';
    if (/reject|رد|نشد|لغو/i.test(s)) return 'rejected';
    if (/approv|^approved$|تایید|تأیید|فعال/i.test(s)) return 'approved';
    return '';
  }

  async function sessionUser() {
    var c = sb();
    if (!c || !c.auth) return null;
    try {
      var r = await c.auth.getSession();
      return r && r.data && r.data.session && r.data.session.user || null;
    } catch (e) { return null; }
  }

  async function isAdminUser() {
    var c = sb();
    var u = await sessionUser();
    if (!c || !u || u.is_anonymous) return false;
    try {
      var p = await c.from('profiles').select('role').eq('id', u.id).maybeSingle();
      return !!(p && !p.error && p.data && p.data.role === 'admin');
    } catch (e) { return false; }
  }

  function ensureDash() {
    var dash = document.getElementById('adminDashboard');
    if (!dash || document.getElementById('adminLiveAlerts')) return;
    var alerts = document.createElement('div');
    alerts.className = 'admin-card';
    alerts.innerHTML = '<h4>🔔 درخواست‌های خرید و اشتراک</h4><div id="adminLiveAlerts" style="font-size:.82rem;line-height:1.9"></div>';
    var users = document.createElement('div');
    users.className = 'admin-card';
    users.innerHTML = '<h4>👥 کاربران ثبت‌شده</h4><div id="adminLiveUsersList" style="font-size:.82rem;line-height:1.9"></div>';
    dash.appendChild(alerts);
    dash.appendChild(users);
  }

  function readMap(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (e) { return {}; }
  }

  async function refreshAdminBoard() {
    var c = sb();
    if (!c) return;
    ensureDash();
    var profiles = [], orders = [], subs = [], err = '';
    try {
      var p = await c.from('profiles').select('id,name,phone,role,registered_at').order('registered_at', { ascending: false }).limit(300);
      if (p.error) err = p.error.message || String(p.error);
      else profiles = p.data || [];
    } catch (e) { err = e.message || String(e); }
    try {
      var o = await c.from('orders').select('id,user_id,name,phone,customer_name,customer_phone,productName,status,created_at,date').order('created_at', { ascending: false }).limit(200);
      if (!o.error) orders = o.data || [];
      else if (!err) err = o.error.message || String(o.error);
    } catch (e) {}
    try {
      var s = await c.from('subscription_requests').select('id,user_id,name,phone,plan,status,created_at').order('created_at', { ascending: false }).limit(200);
      if (!s.error) subs = s.data || [];
      else if (!err) err = s.error.message || String(s.error);
    } catch (e) {}

    var map = {};
    function put(key, row) {
      if (!key) return;
      if (!map[key]) map[key] = { name: '', phone: '', role: '', at: '' };
      if (row.name && !map[key].name) map[key].name = row.name;
      if (row.phone && !map[key].phone) map[key].phone = row.phone;
      if (row.role) map[key].role = row.role;
      if (row.at && !map[key].at) map[key].at = row.at;
    }
    profiles.forEach(function (u) {
      put(u.id || u.phone || u.name, { name: u.name || '', phone: u.phone || '', role: u.role || '', at: u.registered_at || '' });
    });
    orders.forEach(function (row) {
      put(row.user_id || row.phone || row.customer_phone || row.name, {
        name: row.name || row.customer_name || '',
        phone: row.phone || row.customer_phone || '',
        at: row.created_at || ''
      });
    });
    subs.forEach(function (row) {
      put(row.user_id || row.phone || row.name, { name: row.name || '', phone: row.phone || '', at: row.created_at || '' });
    });
    var list = Object.keys(map).map(function (k) { return map[k]; });
    list.sort(function (a, b) { return String(b.at || '').localeCompare(String(a.at || '')); });

    var total = document.getElementById('adminTotalUsers');
    if (total) total.textContent = String(list.length);
    var subTotal = document.getElementById('adminTotalSubscriptions');
    if (subTotal) subTotal.textContent = String(subs.length);

    var usersBox = document.getElementById('adminLiveUsersList');
    if (usersBox) {
      if (!list.length) {
        usersBox.innerHTML = '<p style="color:#b00020">کاربری از سرور خوانده نشد.' + (err ? ' علت: ' + esc(err) : ' اگر کاربر تازه ثبت‌نام کرده، سیاست دسترسی جدول profiles را برای نقش admin باز کنید.') + '</p>';
      } else {
        usersBox.innerHTML = list.slice(0, 100).map(function (u) {
          return '<div style="padding:6px 0;border-bottom:1px solid rgba(201,168,76,.28)">' +
            esc(u.name || 'بدون نام') + ' · ' + esc(u.phone || '—') +
            (u.role === 'admin' ? ' · مدیریت' : '') +
            (u.at ? ' · ' + esc(fmt(u.at)) : '') + '</div>';
        }).join('');
      }
    }

    var pendingO = orders.filter(function (row) { return !decided(row.status); });
    var pendingS = subs.filter(function (row) { return !decided(row.status); });
    var alerts = document.getElementById('adminLiveAlerts');
    if (alerts) {
      var html = '';
      pendingO.forEach(function (row) {
        html += '<div>🛒 خرید: ' + esc(row.productName || 'محصول') + ' — ' + esc(row.name || row.customer_name || '') + ' · ' + esc(row.phone || row.customer_phone || '') + ' · ' + esc(row.status || 'در انتظار') + '</div>';
      });
      pendingS.forEach(function (row) {
        html += '<div>⭐ اشتراک: ' + esc(row.plan || '') + ' — ' + esc(row.name || '') + ' · ' + esc(row.phone || '') + ' · ' + esc(row.status || 'در انتظار') + '</div>';
      });
      alerts.innerHTML = html || '<p>درخواست بازی نیست.</p>';
    }

    var seen = readMap('kafeAdminSeenRequests');
    var fresh = [];
    pendingO.forEach(function (row) {
      var id = 'o:' + row.id;
      if (!seen[id]) { fresh.push('خرید ' + (row.productName || '') + ' از ' + (row.name || row.customer_name || row.phone || 'کاربر')); seen[id] = Date.now(); }
    });
    pendingS.forEach(function (row) {
      var id = 's:' + row.id;
      if (!seen[id]) { fresh.push('اشتراک ' + (row.plan || '') + ' از ' + (row.name || row.phone || 'کاربر')); seen[id] = Date.now(); }
    });
    try { localStorage.setItem('kafeAdminSeenRequests', JSON.stringify(seen)); } catch (e) {}
    if (fresh.length && typeof showNotification === 'function') {
      showNotification('🔔 درخواست جدید: ' + fresh[0] + (fresh.length > 1 ? ' و ' + (fresh.length - 1) + ' مورد دیگر' : ''));
    }
  }

  async function refreshUserResults() {
    var c = sb();
    var u = await sessionUser();
    if (!c || !u) return;
    var rows = [];
    try {
      var o = await c.from('orders').select('id,status,productName,created_at').eq('user_id', u.id).order('created_at', { ascending: false }).limit(40);
      if (!o.error) rows = rows.concat((o.data || []).map(function (x) { return { id: 'o' + x.id, kind: 'order', status: x.status, title: x.productName || 'محصول' }; }));
    } catch (e) {}
    try {
      var s = await c.from('subscription_requests').select('id,status,plan,created_at').eq('user_id', u.id).order('created_at', { ascending: false }).limit(40);
      if (!s.error) rows = rows.concat((s.data || []).map(function (x) { return { id: 's' + x.id, kind: 'sub', status: x.status, title: x.plan || 'اشتراک' }; }));
    } catch (e) {}

    var seen = readMap('kafeUserSeenDecisions');
    if (!localStorage.getItem('kafeUserSeenReady')) {
      rows.forEach(function (row) {
        var d = decided(row.status);
        if (d) seen[row.id + ':' + d] = 1;
      });
      try {
        localStorage.setItem('kafeUserSeenDecisions', JSON.stringify(seen));
        localStorage.setItem('kafeUserSeenReady', '1');
      } catch (e) {}
      return;
    }
    var hit = null;
    rows.some(function (row) {
      var d = decided(row.status);
      if (d && !seen[row.id + ':' + d]) { hit = row; hit.decision = d; return true; }
      return false;
    });
    if (!hit) return;
    seen[hit.id + ':' + hit.decision] = Date.now();
    try { localStorage.setItem('kafeUserSeenDecisions', JSON.stringify(seen)); } catch (e) {}
    var approved = hit.decision === 'approved';
    var msg = hit.kind === 'sub'
      ? (approved ? 'درخواست اشتراک «' + hit.title + '» توسط مدیریت تأیید شد.' : 'درخواست اشتراک «' + hit.title + '» توسط مدیریت رد شد.')
      : (approved ? 'خرید «' + hit.title + '» توسط مدیریت تأیید شد.' : 'خرید «' + hit.title + '» توسط مدیریت رد شد.');
    if (typeof window.v7ShowOperationalNotification === 'function') {
      window.v7ShowOperationalNotification({
        id: hit.id,
        type: hit.kind === 'sub' ? 'subscription_status' : 'order_status',
        message: msg,
        related_id: hit.id
      });
    } else if (typeof showNotification === 'function') {
      showNotification((approved ? '✅ ' : '❌ ') + msg);
    }
  }

  var ticking = false;
  async function tick() {
    if (ticking) return;
    ticking = true;
    try {
      if (await isAdminUser()) await refreshAdminBoard();
      else await refreshUserResults();
    } catch (e) {
      console.warn('ops-alerts', e);
    } finally {
      ticking = false;
    }
  }

  function boot() {
    setTimeout(tick, 1800);
    setInterval(tick, 12000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  var prevOpen = window.openAdmin;
  if (typeof prevOpen === 'function') {
    window.openAdmin = async function () {
      var result = await prevOpen.apply(this, arguments);
      setTimeout(tick, 500);
      return result;
    };
  }
  var prevTab = window.switchAdminTab;
  if (typeof prevTab === 'function') {
    window.switchAdminTab = function (tab) {
      var result = prevTab.apply(this, arguments);
      if (tab === 'dashboard') setTimeout(tick, 300);
      return result;
    };
  }
})();
