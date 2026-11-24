/** boot-flow-fix.js — ONLINE ONLY
 * حفظ مسیر شرایط، نشست Supabase، پروفایل سرور و ثبت‌نام آنلاین.
 * هیچ مسیر آفلاین، انتخاب آفلاین، قفل آفلاین یا fallback محلی ندارد.
 */
(function () {
  'use strict';
  if (window.__KAFE_BOOT_ONLINE_ONLY_V1__) return;
  window.__KAFE_BOOT_ONLINE_ONLY_V1__ = true;

  var TERMS_SESSION_KEY = 'kafeTermsSeenThisSessionV4';
  var STAGE_KEY = 'kafeBootStageOnlineV1';
  var NET_TIMEOUT = 3500;
  var SESSION_TIMEOUT = 4000;
  var PROFILE_TIMEOUT = 4500;

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
  function setStage(value) {
    try { sessionStorage.setItem(STAGE_KEY, value); } catch (e) {}
  }
  function termsSeenThisSession() {
    try { return sessionStorage.getItem(TERMS_SESSION_KEY) === '1'; } catch (e) { return false; }
  }
  function markTermsSeenThisSession() {
    try { sessionStorage.setItem(TERMS_SESSION_KEY, '1'); } catch (e) {}
  }
  function notify(message, kind) {
    try {
      if (typeof window.showNotification === 'function') window.showNotification(message, kind || 'error');
      else console.warn('[Kafe auth]', message);
    } catch (e) { console.warn('[Kafe auth]', message); }
  }
  function ensureLoader() {
    var box = el('kafeBootTransitionLoader');
    if (box) return box;
    box = document.createElement('div');
    box.id = 'kafeBootTransitionLoader';
    box.style.cssText = 'display:none;position:fixed;inset:0;z-index:10088;align-items:center;justify-content:center;background:rgba(7,11,20,.55);pointer-events:none;';
    box.innerHTML = '<div style="width:42px;height:42px;border-radius:50%;border:3px solid rgba(240,216,120,.25);border-top-color:#F0D878;animation:kafeBootSpin .8s linear infinite"></div><style>@keyframes kafeBootSpin{to{transform:rotate(360deg)}}</style>';
    (document.body || document.documentElement).appendChild(box);
    return box;
  }
  function showLoader() { ensureLoader().style.display = 'flex'; }
  function hideLoader() { var box = el('kafeBootTransitionLoader'); if (box) box.style.display = 'none'; }

  function probeOnline() {
    return new Promise(function (resolve) {
      try { if (navigator.onLine === false) { resolve(false); return; } } catch (e) {}
      var finished = false;
      var controller = null;
      var timer = setTimeout(function () {
        try { if (controller) controller.abort(); } catch (e) {}
        finish(false);
      }, NET_TIMEOUT);
      function finish(ok) {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        resolve(!!ok);
      }
      var options = { method: 'GET', cache: 'no-store', mode: 'cors', credentials: 'omit' };
      try {
        if (typeof AbortController !== 'undefined') {
          controller = new AbortController();
          options.signal = controller.signal;
        }
      } catch (e) {}
      fetch('https://evxxvnlwtbaqpjbjaxdk.supabase.co/auth/v1/health?_probe=' + Date.now(), options)
        .then(function (response) { finish(!!(response && response.ok)); })
        .catch(function () { finish(false); });
    });
  }

  function getSessionSafe() {
    return new Promise(function (resolve) {
      var finished = false;
      var timer = setTimeout(function () { finish(null); }, SESSION_TIMEOUT);
      function finish(session) {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        resolve(session || null);
      }
      try {
        if (!window.supabaseClient || !window.supabaseClient.auth ||
            typeof window.supabaseClient.auth.getSession !== 'function') {
          finish(null);
          return;
        }
        window.supabaseClient.auth.getSession().then(function (result) {
          finish(result && result.data ? result.data.session : null);
        }).catch(function () { finish(null); });
      } catch (e) { finish(null); }
    });
  }

  function loadProfile(userId) {
    return new Promise(function (resolve) {
      var finished = false;
      var timer = setTimeout(function () { finish(null); }, PROFILE_TIMEOUT);
      function finish(profile) {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        resolve(profile || null);
      }
      try {
        if (!window.supabaseClient || !userId) { finish(null); return; }
        window.supabaseClient.from('profiles')
          .select('id,name,phone,role')
          .eq('id', userId)
          .maybeSingle()
          .then(function (result) {
            finish(result && !result.error && result.data ? result.data : null);
          }).catch(function () { finish(null); });
      } catch (e) { finish(null); }
    });
  }

  function enterMainApp(profile) {
    setStage('main');
    hideLoader();
    hide(el('termsScreen'));
    hide(el('splashScreen'));
    hide(el('registerScreen'));
    showBlock(el('app'));
    try { document.body.classList.remove('is-offline'); } catch (e) {}
    try {
      if (profile && typeof window.updateUserDisplay === 'function') {
        Promise.resolve(window.updateUserDisplay(profile)).catch(function () {});
      }
    } catch (e) {}
    try {
      if (typeof window.refreshUserDashboardStats === 'function') window.refreshUserDashboardStats();
    } catch (e) {}
  }

  function showTermsOnly() {
    setStage('terms');
    hideLoader();
    hide(el('splashScreen'));
    hide(el('registerScreen'));
    hide(el('app'));
    showFlex(el('termsScreen'));
  }

  function showRegisterOnly(message) {
    setStage('auth');
    hideLoader();
    hide(el('splashScreen'));
    hide(el('termsScreen'));
    hide(el('app'));
    showFlex(el('registerScreen'));
    if (message) notify(message, 'error');
    probeOnline().then(function (ok) {
      if (!ok) notify('برای ورود و ثبت‌نام، اتصال اینترنت و دسترسی به سرور لازم است.', 'error');
    });
  }

  function continueAfterTermsOrSession() {
    showLoader();
    Promise.all([probeOnline(), getSessionSafe()]).then(function (values) {
      var online = values[0];
      var session = values[1];
      if (!online) {
        showRegisterOnly('اتصال به سرور برقرار نیست؛ ورود آفلاین در این نسخه پشتیبانی نمی‌شود.');
        return;
      }
      if (!session || !session.user || !session.user.id) {
        showRegisterOnly();
        return;
      }
      loadProfile(session.user.id).then(function (profile) {
        if (profile && profile.id) enterMainApp(profile);
        else showRegisterOnly('نشست یا پروفایل کاربر از سرور تأیید نشد؛ لطفاً با شماره و PIN دوباره وارد شوید.');
      });
    }).catch(function () {
      showRegisterOnly('بررسی ورود آنلاین ناموفق بود؛ لطفاً اتصال را بررسی و دوباره تلاش کنید.');
    });
  }

  function afterSplashRoute() {
    if (!termsSeenThisSession()) { showTermsOnly(); return; }
    continueAfterTermsOrSession();
  }

  window.kafeAfterAuthSuccess = function (profile) {
    if (!profile || !profile.id) {
      showRegisterOnly('پروفایل کاربر از سرور تأیید نشد؛ لطفاً دوباره وارد شوید.');
      return false;
    }
    markTermsSeenThisSession();
    hide(el('registerScreen'));
    hide(el('termsScreen'));
    hide(el('splashScreen'));
    hideLoader();
    enterMainApp(profile);
    return true;
  };

  window.acceptTermsAndContinue = function () {
    markTermsSeenThisSession();
    try { localStorage.setItem('kafeTermsAccepted', '1'); } catch (e) {}
    hide(el('termsScreen'));
    continueAfterTermsOrSession();
  };

  function patchRegisterUser() {
    var original = window.registerUser;
    if (typeof original !== 'function') return false;
    if (original.__kafeOnlineOnlyPatched) return true;
    var wrapped = async function () {
      var online = await probeOnline();
      if (!online) {
        notify('برای ورود یا ثبت‌نام باید به اینترنت و سرور متصل باشید.', 'error');
        return;
      }
      return await original.apply(this, arguments);
    };
    wrapped.__kafeOnlineOnlyPatched = true;
    window.registerUser = wrapped;
    return true;
  }

  function pollRegisterUser() {
    if (patchRegisterUser()) return;
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (patchRegisterUser() || tries >= 40) clearInterval(timer);
    }, 250);
  }

  window.addEventListener('online', function () {
    if (el('registerScreen') && el('registerScreen').style.display !== 'none') {
      notify('اتصال اینترنت برقرار شد؛ اکنون می‌توانید دوباره وارد شوید.', 'success');
    }
  });
  window.addEventListener('offline', function () {
    if (el('app') && el('app').style.display !== 'none') {
      notify('اتصال اینترنت قطع شد؛ قابلیت‌های نیازمند سرور موقتاً در دسترس نیستند.', 'error');
    }
  });

  var booted = false;
  function boot() {
    pollRegisterUser();
    if (booted) return;
    booted = true;
    hide(el('splashScreen'));
    afterSplashRoute();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 0); }, true);
  } else {
    boot();
  }
  window.addEventListener('load', function () { setTimeout(pollRegisterUser, 300); });
})();
