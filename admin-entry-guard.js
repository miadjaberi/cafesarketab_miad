/* Kafe Miad — narrow admin-flow guards.
   - Prevent concurrent Telegram OTP flows caused by rapid repeated taps.
   - Replace local-only dashboard counts with verified server counts.
   This file does not grant permissions; the existing Supabase session/profile checks remain authoritative.
*/
(function () {
  'use strict';

  async function refreshServerStats() {
    var c = window.supabaseClient;
    var ids = {
      products: 'adminTotalProducts',
      subscriptions: 'adminTotalSubscriptions',
      users: 'adminTotalUsers'
    };
    function setAll(value) {
      Object.keys(ids).forEach(function (k) {
        var el = document.getElementById(ids[k]);
        if (el) el.textContent = value;
      });
    }
    if (!c || !c.auth) { setAll('—'); return; }
    setAll('…');
    try {
      var sr = await c.auth.getSession();
      var session = sr && sr.data && sr.data.session;
      if (!session || !session.user || !session.user.id || session.user.is_anonymous) {
        setAll('—');
        return;
      }
      var role = await c.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      if (role.error || !role.data || role.data.role !== 'admin') {
        setAll('—');
        return;
      }
      var results = await Promise.all([
        c.from('products').select('id', { count: 'exact', head: true }),
        c.from('subscription_requests').select('id', { count: 'exact', head: true }),
        c.from('profiles').select('id', { count: 'exact', head: true })
      ]);
      var keys = ['products', 'subscriptions', 'users'];
      keys.forEach(function (key, i) {
        var el = document.getElementById(ids[key]);
        if (!el) return;
        var r = results[i];
        el.textContent = (!r.error && typeof r.count === 'number') ? String(r.count) : '—';
      });
    } catch (e) {
      console.warn('Kafe Miad server dashboard counts unavailable:', e);
      setAll('—');
    }
  }

  function install() {
    var originalToggle = window.toggleAdmin;
    if (typeof originalToggle === 'function' && !originalToggle.__kafeSingleFlightGuard) {
      var running = false;
      async function guardedToggleAdmin() {
        if (running) {
          try {
            if (typeof window.showNotification === 'function') {
              window.showNotification('درخواست ورود مدیریت در حال بررسی است؛ لطفاً چند لحظه صبر کنید.', 'info');
            }
          } catch (_) {}
          return false;
        }
        running = true;
        try {
          var result = await originalToggle.apply(this, arguments);
          var panel = document.getElementById('adminPanel');
          if (panel && panel.classList.contains('active')) setTimeout(refreshServerStats, 0);
          return result;
        } finally {
          running = false;
        }
      }
      guardedToggleAdmin.__kafeSingleFlightGuard = true;
      guardedToggleAdmin.__kafeOriginalToggleAdmin = originalToggle;
      window.toggleAdmin = guardedToggleAdmin;
      console.info('Kafe Miad: admin login single-flight guard installed.');
    }

    var originalSwitch = window.switchAdminTab;
    if (typeof originalSwitch === 'function' && !originalSwitch.__kafeServerStatsGuard) {
      function guardedSwitchAdminTab(tab) {
        var result = originalSwitch.apply(this, arguments);
        if (tab === 'dashboard') setTimeout(refreshServerStats, 0);
        return result;
      }
      guardedSwitchAdminTab.__kafeServerStatsGuard = true;
      guardedSwitchAdminTab.__kafeOriginalSwitchAdminTab = originalSwitch;
      window.switchAdminTab = guardedSwitchAdminTab;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
