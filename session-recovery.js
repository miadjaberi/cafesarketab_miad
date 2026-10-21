/* Kafe Miad — fail-closed server session/profile gate.
   A cached cafeUser value is never accepted as authentication. */
(function () {
  'use strict';
  var started = false, validated = false, observer = null;
  function client() { return window.supabaseClient || window.v12Supabase || null; }
  function byId(id) { return document.getElementById(id); }
  function hide(id) {
    var el = byId(id); if (!el) return;
    el.style.display = 'none'; el.classList.add('hidden'); el.classList.remove('active');
  }
  function clearCachedUser() { try { localStorage.removeItem('cafeUser'); } catch (e) {} }
  function showRegister() {
    validated = false; window.__kafeServerAuthValidated = false;
    var app = byId('app');
    if (app) { app.style.display = 'none'; app.classList.add('hidden'); }
    hide('splashScreen'); hide('termsScreen');
    var register = byId('registerScreen');
    if (register) { register.classList.remove('hidden'); register.style.display = 'flex'; }
  }
  function showApp() {
    validated = true; window.__kafeServerAuthValidated = true;
    hide('termsScreen'); hide('splashScreen'); hide('registerScreen');
    var app = byId('app');
    if (app) { app.style.display = 'block'; app.classList.remove('hidden'); }
  }
  function enforceGate() {
    if (validated || window.__kafeServerAuthValidated === true) return;
    var app = byId('app');
    if (app && (app.style.display !== 'none' || !app.classList.contains('hidden'))) {
      app.style.display = 'none'; app.classList.add('hidden');
    }
  }
  function installGate() {
    window.__kafeServerAuthValidated = false;
    var app = byId('app');
    if (app) { app.style.display = 'none'; app.classList.add('hidden'); }
    if (!observer && app && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(enforceGate);
      observer.observe(app, { attributes: true, attributeFilter: ['style', 'class'] });
    }
  }
  async function recover() {
    if (started || validated) return;
    started = true; installGate();
    try {
      var c = client();
      for (var i = 0; !c && i < 30; i++) {
        await new Promise(function (resolve) { setTimeout(resolve, 100); }); c = client();
      }
      if (!c || !c.auth || typeof c.auth.getSession !== 'function' || typeof c.auth.getUser !== 'function') {
        clearCachedUser(); showRegister(); return;
      }
      var sr = await c.auth.getSession(), session = sr && sr.data && sr.data.session;
      if ((sr && sr.error) || !session || !session.user || !session.user.id) {
        clearCachedUser(); showRegister(); return;
      }
      var ur = await c.auth.getUser(), serverUser = ur && ur.data && ur.data.user;
      if ((ur && ur.error) || !serverUser || serverUser.id !== session.user.id) {
        clearCachedUser(); showRegister(); return;
      }
      var pr = await c.from('profiles').select('id,name,phone,role,registered_at')
        .eq('id', serverUser.id).maybeSingle();
      if (pr.error) { clearCachedUser(); showRegister(); return; }
      var profile = pr.data, role = profile && String(profile.role || '').toLowerCase();
      var validProfile = !!(profile && profile.id === serverUser.id &&
        typeof profile.name === 'string' && profile.name.trim() &&
        typeof profile.phone === 'string' && /^09[0-9]{9}$/.test(profile.phone.replace(/\s/g, '')) &&
        (role === 'user' || role === 'admin'));
      if (!validProfile) {
        clearCachedUser();
        try { await c.auth.signOut(); } catch (e) {}
        showRegister(); return;
      }
      var user = {
        name: profile.name.trim(), phone: profile.phone,
        registeredAt: profile.registered_at || '', user_id: profile.id, role: role
      };
      try { localStorage.setItem('cafeUser', JSON.stringify(user)); } catch (e) {}
      showApp();
      try {
        if (typeof window.updateUserDisplay === 'function') await window.updateUserDisplay(profile);
      } catch (e) { console.warn('session recovery display', e); }
      console.info('Kafe Miad: server session and registered profile verified.');
    } catch (e) {
      clearCachedUser(); showRegister();
      console.warn('Kafe Miad auth gate blocked entry:', e && e.message ? e.message : e);
    } finally { started = false; }
  }
  installGate();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { recover(); }, { once: true });
  } else { recover(); }
  window.addEventListener('pageshow', function () { if (!validated) recover(); });
})();
