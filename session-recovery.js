/* Kafe Miad — session recovery for returning registered users.
   Restores a server-backed profile when browser-local cafeUser is missing.
   It never grants admin rights and never creates a profile from client-supplied identity. */
(function () {
  'use strict';
  var started = false;

  function client() { return window.supabaseClient || null; }
  function hide(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'none';
    el.classList.add('hidden');
    el.classList.remove('active');
  }
  function showApp() {
    hide('termsScreen');
    hide('splashScreen');
    hide('registerScreen');
    var app = document.getElementById('app');
    if (app) {
      app.style.display = 'block';
      app.classList.remove('hidden');
    }
  }
  function hasLocalUser() {
    try {
      var u = JSON.parse(localStorage.getItem('cafeUser') || 'null');
      return !!(u && (u.name || u.phone));
    } catch (e) { return false; }
  }
  async function recover() {
    if (started || hasLocalUser()) return;
    var panel = document.getElementById('adminPanel');
    if (panel && panel.classList.contains('active')) return;
    started = true;
    try {
      var c = client();
      for (var i = 0; !c && i < 20; i++) {
        await new Promise(function (resolve) { setTimeout(resolve, 100); });
        c = client();
      }
      if (!c || !c.auth) return;
      var sr = await c.auth.getSession();
      var session = sr && sr.data && sr.data.session;
      if (!session || !session.user || !session.user.id) return;

      // The session UID is authoritative; never look up another person's profile by phone.
      var pr = await c.from('profiles')
        .select('id,name,phone,role,registered_at')
        .eq('id', session.user.id)
        .maybeSingle();
      if (pr.error || !pr.data || (!pr.data.name && !pr.data.phone)) return;

      var profile = pr.data;
      var user = {
        name: profile.name || '',
        phone: profile.phone || '',
        registeredAt: profile.registered_at || new Date().toISOString(),
        user_id: profile.id,
        role: profile.role || 'user'
      };
      try {
        localStorage.setItem('cafeUser', JSON.stringify(user));
        // Existing server profile is only created by the registration flow after the terms gate.
        localStorage.setItem('kafeTermsAccepted', '1');
      } catch (e) {}
      showApp();
      try {
        if (typeof window.updateUserDisplay === 'function') {
          await window.updateUserDisplay(profile);
        }
      } catch (e) { console.warn('session recovery display', e); }
      console.info('Kafe Miad: restored existing profile from Supabase.');
    } catch (e) {
      // Recovery must never hold up the app or block manual registration.
      console.warn('Kafe Miad session recovery skipped:', e && e.message ? e.message : e);
    } finally {
      started = false;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(recover, 250); }, { once: true });
  } else {
    setTimeout(recover, 250);
  }
  window.addEventListener('pageshow', function () { setTimeout(recover, 250); });
})();
