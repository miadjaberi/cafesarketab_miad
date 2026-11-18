/** boot-flow-fix.js V4.9 — online-only hard, no offline choice, splash stay skipped
 * restored after accidental placeholder
 */
(function () {
  'use strict';
  if (window.__KAFE_BOOT_FLOW_V49__) return;
  window.__KAFE_BOOT_FLOW_V49__ = true;
  window.__KAFE_BOOT_FLOW_V48__ = true;
  window.__KAFE_BOOT_FLOW_V47__ = true;
  window.__KAFE_BOOT_FLOW_V46__ = true;
  window.__KAFE_BOOT_FLOW_V45__ = true;
  window.__KAFE_BOOT_FLOW_V44__ = true;
  window.__KAFE_BOOT_FLOW_V42__ = true;

  var MAX_SESSION_WAIT = 3500;
  var PROFILE_TIMEOUT = 4000;
  var NET_PROBE_TIMEOUT = 3000;
  var TERMS_SESSION_KEY = 'kafeTermsSeenThisSessionV4';
  var STAGE_KEY = 'kafeBootStageV4';

  try {
    var _sc = document.getElementById('stars-canvas');
    if (_sc) { _sc.style.display = 'none'; _sc.style.visibility = 'hidden'; }
  } catch (eEarly) {}

  try {
    if (!document.getElementById('kafeAuthScrollFix')) {
      var stAuth = document.createElement('style');
      stAuth.id = 'kafeAuthScrollFix';
      stAuth.textContent = "html.kafe-auth-lock,html.kafe-auth-lock body{height:100%;height:100dvh;overflow:hidden!important;overscroll-behavior:none;padding-top:0!important;padding-bottom:0!important}#termsScreen{height:100%;height:100dvh;max-height:100dvh;overflow:hidden}#termsScreen .terms-inner{flex:1 1 auto;min-height:0;overflow-y:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding-bottom:calc(120px + env(safe-area-inset-bottom,0px))}#registerScreen{height:100%;height:100dvh;max-height:100dvh;overflow-y:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}#termsScreen,#termsScreen *{font-family:Vazirmatn,Tahoma,sans-serif!important}#termsScreen .terms-card,#termsScreen .terms-card p,#termsScreen .terms-inner p{font-size:0.88rem!important;font-weight:400!important;line-height:1.85!important;-webkit-text-size-adjust:100%;text-size-adjust:100%}#termsScreen .terms-card h3{font-size:0.95rem!important;font-weight:800!important}#termsScreen .terms-header h1{font-size:1.25rem!important;font-weight:800!important}#termsScreen .terms-agree-btn{font-size:1rem!important;font-weight:800!important}";
      (document.head || document.documentElement).appendChild(stAuth);
    }
  } catch (eAuthCss) {}

  function el(id) { return document.getElementById(id); }
  function hide(node) {
    if (!node) return;
    node.style.display = 'none';
    try { node.classList.add('hidden'); node.classList.remove('active'); } catch (e) {}
  }
  function showFlex(node) {
    if (!node) return;
    try { node.classList.remove('hidden'); node.classList.add('active'); } catch (e) {}
    node.style.display = 'flex';
  }
  function showBlock(node) {
    if (!node) return;
    try { node.classList.remove('hidden'); } catch (e) {}
    node.style.display = 'block';
  }
  function navigatorSaysOnline() {
    try { if (typeof navigator !== 'undefined' && navigator.onLine === false) return false; } catch (e) {}
    return true;
  }
  function probeOnline() {
    return new Promise(function (resolve) {
      if (!navigatorSaysOnline()) { resolve(false); return; }
      var done = false;
      var ctrl = null;
      var timer = setTimeout(function () {
        try { if (ctrl) ctrl.abort(); } catch (e) {}
        finish(false);
      }, NET_PROBE_TIMEOUT);
      function finish(v) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(!!v);
      }
      var probeTok = String(Date.now());
      var healthUrl = 'https://evxxvnlwtbaqpjbjaxdk.supabase.co/auth/v1/health?_probe=' + probeTok;
      var opts = { method: 'GET', cache: 'no-store', mode: 'cors', credentials: 'omit' };
      try {
        if (typeof AbortController !== 'undefined') {
          ctrl = new AbortController();
          opts.signal = ctrl.signal;
        }
      } catch (e0) {}
      fetch(healthUrl, opts).then(function (response) {
        finish(!!(response && response.ok));
      }).catch(function () {
        finish(false);
      });
    });
  }
  function isOnline() { return navigatorSaysOnline(); }
  function termsSeenThisSession() {
    try { return sessionStorage.getItem(TERMS_SESSION_KEY) === '1'; } catch (e) { return false; }
  }
  function markTermsSeenThisSession() {
    try { sessionStorage.setItem(TERMS_SESSION_KEY, '1'); } catch (e) {}
  }
  function getLocalCafeUser() {
    try {
      var raw = localStorage.getItem('cafeUser');
      if (!raw) return null;
      var u = JSON.parse(raw);
      if (u && (u.id || u.phone || u.name)) return u;
    } catch (e) {}
    return null;
  }
  function setStage(s) { try { sessionStorage.setItem(STAGE_KEY, s); } catch (e) {} }
  function ensureBootLoader() {
    var id = 'kafeBootTransitionLoader';
    var box = document.getElementById(id);
    if (box) return box;
    box = document.createElement('div');
    box.id = id;
    box.style.cssText = 'display:none;position:fixed;inset:0;z-index:10088;align-items:center;justify-content:center;background:#070B14;pointer-events:none;';
    box.innerHTML = '<div style="width:42px;height:42px;border-radius:50%;border:3px solid rgba(240,216,120,0.25);border-top-color:#F0D878;animation:kafeBootSpin 0.8s linear infinite;"></div><style>@keyframes kafeBootSpin{to{transform:rotate(360deg)}}</style>';
    document.body.appendChild(box);
    return box;
  }
  function showBootLoader() { ensureBootLoader().style.display = 'flex'; }
  function hideBootLoader() { var box = document.getElementById('kafeBootTransitionLoader'); if (box) box.style.display = 'none'; }
  function hideStars() {
    var c = el('stars-canvas');
    if (c) { try { c.style.display = 'none'; c.style.visibility = 'hidden'; } catch (e) {} }
  }
  function showStars() {
    var c = el('stars-canvas');
    if (c) { try { c.style.display = ''; c.style.visibility = ''; } catch (e) {} }
  }
  function lockAuth() {
    try { document.documentElement.classList.add('kafe-auth-lock'); document.body.classList.add('kafe-auth-lock'); } catch (e) {}
  }
  function unlockAuth() {
    try { document.documentElement.classList.remove('kafe-auth-lock'); document.body.classList.remove('kafe-auth-lock'); } catch (e) {}
  }
  function enterMainApp(profile) {
    setStage('main'); unlockAuth(); hideBootLoader(); hide(el('termsScreen')); hide(el('registerScreen')); hideRetryOnline(); showStars(); showBlock(el('app'));
    try { if (profile && typeof updateUserDisplay === 'function') Promise.resolve(updateUserDisplay(profile)).catch(function () {}); } catch (e) {}
    try { if (typeof window.refreshUserDashboardStats === 'function') window.refreshUserDashboardStats(); } catch (e2) {}
  }
  function showTermsOnly() {
    setStage('terms'); lockAuth(); hideBootLoader(); hideStars(); hide(el('registerScreen')); hide(el('app')); hideRetryOnline();
    var terms = el('termsScreen');
    if (terms) { try { terms.classList.remove('hidden'); } catch (e) {} terms.style.display = 'flex'; }
  }
  function showRegisterOnly() {
    setStage('auth'); lockAuth(); hideBootLoader(); hideStars(); hide(el('termsScreen')); hide(el('app')); hideRetryOnline(); showFlex(el('registerScreen'));
    probeOnline().then(function (ok) {
      if (!ok) { try { if (typeof showNotification === 'function') showNotification('برای ثبت‌نام باید به اینترنت متصل باشید', 'error'); } catch (e) {} }
    });
  }
  function ensureRetryOnline() {
    var id = 'kafeRetryOnlineScreen'; var box = document.getElementById(id); if (box) return box;
    box = document.createElement('div'); box.id = id;
    box.style.cssText = 'display:none;position:fixed;inset:0;z-index:10085;align-items:center;justify-content:center;background:#070B14;padding:24px;box-sizing:border-box;direction:rtl;';
    box.innerHTML = '<div style="max-width:380px;text-align:center;color:#F5F0E4;"><p style="font-size:1.05rem;font-weight:800;color:#F0D878;margin:0 0 12px;">اتصال برقرار نیست</p><p style="line-height:1.7;margin:0 0 20px;font-size:0.9rem;opacity:0.9;">برای ورود آنلاین منتظر اتصال بمانید. به‌محض آنلاین شدن، برنامه ادامه می‌دهد.</p><button type="button" id="kafeRetryOnlineBtn" style="padding:12px 20px;border-radius:12px;border:none;background:linear-gradient(180deg,#e8c76b,#c9a84c);color:#1A1208;font-weight:800;cursor:pointer;">تلاش مجدد</button><p id="kafeRetryOnlineHint" style="margin-top:14px;font-size:0.8rem;color:#C8C0B0;"></p></div>';
    document.body.appendChild(box);
    var btn = box.querySelector('#kafeRetryOnlineBtn');
    if (btn) btn.onclick = function () { tryRetryOnline(); };
    return box;
  }
  function showRetryOnline() {
    setStage('wait-online'); hideBootLoader(); hide(el('app')); hide(el('registerScreen')); hide(el('termsScreen'));
    var box = ensureRetryOnline(); box.style.display = 'flex';
    var hint = document.getElementById('kafeRetryOnlineHint');
    if (hint) hint.textContent = 'در حال بررسی اتصال…';
    probeOnline().then(function (ok) {
      if (hint) hint.textContent = ok ? 'متصل شدید — ادامه…' : 'هنوز آفلاین هستید';
      if (ok) tryRetryOnline();
    });
  }
  function hideRetryOnline() { var box = document.getElementById('kafeRetryOnlineScreen'); if (box) box.style.display = 'none'; }
  function tryRetryOnline() {
    var hint = document.getElementById('kafeRetryOnlineHint');
    showBootLoader();
    probeOnline().then(function (ok) {
      if (!ok) { hideBootLoader(); if (hint) hint.textContent = 'هنوز متصل نیستید. صبر کنید یا دوباره تلاش کنید.'; return; }
      if (hint) hint.textContent = 'متصل شدید — ادامه…';
      hideRetryOnline(); continueAfterTermsOrSession();
    });
  }
  function getSessionSafe() {
    return new Promise(function (resolve) {
      var done = false;
      function finish(v) { if (done) return; done = true; resolve(v || null); }
      setTimeout(function () { finish(null); }, MAX_SESSION_WAIT);
      try {
        if (!window.supabaseClient || !window.supabaseClient.auth) { finish(null); return; }
        window.supabaseClient.auth.getSession().then(function (sr) {
          finish(sr && sr.data && sr.data.session ? sr.data.session : null);
        }).catch(function () { finish(null); });
      } catch (e) { finish(null); }
    });
  }
  function loadProfile(userId) {
    return new Promise(function (resolve) {
      var done = false;
      function finish(v) { if (done) return; done = true; resolve(v || null); }
      setTimeout(function () { finish(null); }, PROFILE_TIMEOUT);
      try {
        if (!window.supabaseClient || !userId) { finish(null); return; }
        window.supabaseClient.from('profiles').select('id,name,phone,role').eq('id', userId).maybeSingle()
          .then(function (pr) { finish(pr && !pr.error && pr.data ? pr.data : null); })
          .catch(function () { finish(null); });
      } catch (e) { finish(null); }
    });
  }
  function continueAfterTermsOrSession() {
    showBootLoader();
    var finished = false;
    var onlineState = null;
    var safety = setTimeout(function () {
      if (finished) return;
      finished = true;
      hideBootLoader();
      showRegisterOnly();
    }, Math.max(NET_PROBE_TIMEOUT, MAX_SESSION_WAIT) + PROFILE_TIMEOUT + 800);
    var probeP = probeOnline().then(function (online) { onlineState = online; return online; });
    var sessionP = getSessionSafe();
    Promise.all([probeP, sessionP]).then(function (pair) {
      if (finished) return;
      var online = pair[0];
      var session = pair[1];
      onlineState = online;
      if (session && session.user && session.user.id) {
        return loadProfile(session.user.id).then(function (profile) {
          if (finished) return;
          clearTimeout(safety);
          finished = true;
          hideBootLoader();
          if (profile && profile.id) { enterMainApp(profile); return; }
          showRegisterOnly();
        });
      }
      clearTimeout(safety);
      finished = true;
      hideBootLoader();
      showRegisterOnly();
    }).catch(function () {
      if (finished) return;
      finished = true;
      clearTimeout(safety);
      hideBootLoader();
      showRegisterOnly();
    });
  }
  function routeAfterTermsCheck() {
    if (!termsSeenThisSession()) { showTermsOnly(); return; }
    continueAfterTermsOrSession();
  }
  window.kafeAfterAuthSuccess = function (profile) {
    if (!profile || !profile.id) {
      showRegisterOnly();
      return false;
    }
    markTermsSeenThisSession();
    hide(el('registerScreen')); hide(el('termsScreen')); hideRetryOnline(); hideBootLoader();
    enterMainApp(profile);
    return true;
  };
  window.acceptTermsAndContinue = function () {
    markTermsSeenThisSession();
    try { localStorage.setItem('kafeTermsAccepted', '1'); } catch (e) {}
    hide(el('termsScreen')); showBootLoader(); continueAfterTermsOrSession();
  };
  function patchRegisterUser() {
    var prev = window.registerUser;
    if (typeof prev !== 'function') return false;
    if (prev.__kafeBootV4Patched) return true;
    window.registerUser = async function () {
      var online = await probeOnline();
      if (!online) {
        try { if (typeof showNotification === 'function') showNotification('برای ثبت‌نام باید به اینترنت متصل باشید', 'error'); } catch (e) {}
        return;
      }
      await prev.apply(this, arguments);
    };
    window.registerUser.__kafeBootV4Patched = true;
    return true;
  }
  function pollRegisterUser() {
    if (patchRegisterUser()) return;
    var tries = 0;
    var t = setInterval(function () { tries++; if (patchRegisterUser() || tries > 40) clearInterval(t); }, 250);
    setTimeout(patchRegisterUser, 400);
    setTimeout(patchRegisterUser, 1500);
  }
  window.addEventListener('online', function () {
    var retry = document.getElementById('kafeRetryOnlineScreen');
    if (retry && retry.style.display === 'flex') tryRetryOnline();
  });
  var booted = false;
  function boot() {
    pollRegisterUser();
    if (booted) return;
    booted = true;
    hideStars();
    routeAfterTermsCheck();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 0); }, true);
  } else { boot(); }
  window.addEventListener('load', function () { setTimeout(pollRegisterUser, 300); });
})();
