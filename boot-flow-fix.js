/** boot-flow-fix.js V4.3
 * - تشخیص دسترسی واقعی به Supabase Auth health با GET و timeout
 * - ورود آنلاین فقط با session و پروفایل تأییدشده از سرور
 * - مسیر آفلاین محدود فقط با انتخاب صریح کاربر
 * - کنترل یگانه شرایط، اسپلش و انتقال به صفحه ورود
 */
(function () {
  'use strict';
  if (window.__KAFE_BOOT_FLOW_V42__) return;
  window.__KAFE_BOOT_FLOW_V42__ = true;

  var MIN_SPLASH = 1600;
  var MAX_SESSION_WAIT = 3500;
  var PROFILE_TIMEOUT = 4000;
  var NET_PROBE_TIMEOUT = 3000;
  var TERMS_SESSION_KEY = 'kafeTermsSeenThisSessionV4';
  var STAGE_KEY = 'kafeBootStageV4';

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
      // فقط سلامت Supabase معیار آنلاین‌بودن ورود است؛ پاسخ کش‌شدهٔ GitHub Pages
      // یا fallback صفحه اصلی نباید به‌اشتباه اینترنتِ آمادهٔ احراز هویت تلقی شود.
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
    box.style.cssText = 'display:none;position:fixed;inset:0;z-index:10088;align-items:center;justify-content:center;background:rgba(7,11,20,0.55);pointer-events:none;';
    box.innerHTML = '<div style="width:42px;height:42px;border-radius:50%;border:3px solid rgba(240,216,120,0.25);border-top-color:#F0D878;animation:kafeBootSpin 0.8s linear infinite;"></div><style>@keyframes kafeBootSpin{to{transform:rotate(360deg)}}</style>';
    document.body.appendChild(box);
    return box;
  }
  function showBootLoader() { ensureBootLoader().style.display = 'flex'; }
  function hideBootLoader() { var box = document.getElementById('kafeBootTransitionLoader'); if (box) box.style.display = 'none'; }
  function enterMainApp(profile) {
    setStage('main'); hideBootLoader(); hide(el('termsScreen')); hide(el('splashScreen')); hide(el('registerScreen')); hideOfflineDialog(); hideRetryOnline(); showBlock(el('app'));
    try { document.body.classList.toggle('is-offline', !navigatorSaysOnline()); } catch (e0) {}
    try { if (profile && typeof updateUserDisplay === 'function') Promise.resolve(updateUserDisplay(profile)).catch(function () {}); } catch (e) {}
    try { if (typeof window.refreshUserDashboardStats === 'function') window.refreshUserDashboardStats(); } catch (e2) {}
  }
  function showTermsOnly() {
    setStage('terms'); hideBootLoader(); hide(el('splashScreen')); hide(el('registerScreen')); hide(el('app')); hideOfflineDialog(); hideRetryOnline();
    var terms = el('termsScreen');
    if (terms) { try { terms.classList.remove('hidden'); } catch (e) {} terms.style.display = 'flex'; }
  }
  function showRegisterOnly() {
    setStage('auth'); hideBootLoader(); hide(el('splashScreen')); hide(el('termsScreen')); hide(el('app')); hideOfflineDialog(); hideRetryOnline(); showFlex(el('registerScreen'));
    probeOnline().then(function (ok) {
      if (!ok) { try { if (typeof showNotification === 'function') showNotification('برای ثبت‌نام باید به اینترنت متصل باشید', 'error'); } catch (e) {} }
    });
  }
  function ensureOfflineDialog() {
    var id = 'kafeOfflineChoiceDialog'; var box = document.getElementById(id); if (box) return box;
    box = document.createElement('div'); box.id = id; box.setAttribute('role', 'dialog');
    box.style.cssText = 'display:none;position:fixed;inset:0;z-index:10090;align-items:center;justify-content:center;background:rgba(0,0,0,0.72);padding:20px;box-sizing:border-box;';
    box.innerHTML = '<div style="max-width:360px;width:100%;background:#0b1120;border:1px solid rgba(201,168,76,0.45);border-radius:16px;padding:20px 18px;text-align:center;direction:rtl;color:#F5F0E4;"><p style="margin:0 0 18px;line-height:1.75;font-size:0.95rem;font-weight:600;">شما در حال حاضر به شبکه متصل نیستید. در صورت تمایل می‌توانید از برنامه به‌صورت آفلاین استفاده کنید.</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;"><button type="button" id="kafeOfflineYes" style="min-width:100px;padding:10px 16px;border-radius:12px;border:none;background:linear-gradient(180deg,#e8c76b,#c9a84c);color:#1A1208;font-weight:800;cursor:pointer;">بله</button><button type="button" id="kafeOfflineNo" style="min-width:100px;padding:10px 16px;border-radius:12px;border:1px solid rgba(201,168,76,0.5);background:#111827;color:#F0D878;font-weight:700;cursor:pointer;">خیر</button></div></div>';
    document.body.appendChild(box);
    var yes = box.querySelector('#kafeOfflineYes'); var no = box.querySelector('#kafeOfflineNo');
    if (yes) yes.onclick = function () { hideOfflineDialog(); goOfflineLimited(); };
    if (no) no.onclick = function () { hideOfflineDialog(); showRetryOnline(); };
    return box;
  }
  function showOfflineDialog() {
    setStage('offline-choice'); hideBootLoader(); hide(el('splashScreen')); hide(el('termsScreen')); hide(el('registerScreen')); hide(el('app')); hideRetryOnline();
    ensureOfflineDialog().style.display = 'flex';
  }
  function hideOfflineDialog() { var box = document.getElementById('kafeOfflineChoiceDialog'); if (box) box.style.display = 'none'; }
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
    setStage('wait-online'); hideBootLoader(); hide(el('app')); hide(el('registerScreen')); hide(el('splashScreen')); hide(el('termsScreen')); hideOfflineDialog();
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
  function goOfflineLimited() {
    setStage('main-offline'); hideBootLoader();
    try { document.body.classList.add('is-offline'); window.__kafeOfflineLimited = true; } catch (e) {}
    if (typeof window.enterAppForLocalModals === 'function') window.enterAppForLocalModals('نسخه آفلاین');
    else enterMainApp(getLocalCafeUser());
    installOfflineLocks();
  }
  function installOfflineLocks() {
    if (window.__kafeOfflineLocksV4) return;
    window.__kafeOfflineLocksV4 = true;
    document.addEventListener('click', function (ev) {
      if (!window.__kafeOfflineLimited && navigatorSaysOnline()) return;
      var t = ev.target && ev.target.closest ? ev.target.closest('button, a') : null;
      if (!t) return;
      var oc = t.getAttribute('onclick') || '';
      var label = (t.textContent || '').replace(/\s+/g, ' ').trim();
      var isAdmin = oc.indexOf('toggleAdmin') >= 0 || oc.indexOf('openAdmin') >= 0 || (t.closest && t.closest('#adminPanel'));
      var isOrder = oc.indexOf('openSubOrders') >= 0 || oc.indexOf('openSubscription') >= 0 || label.indexOf('خرید') >= 0 || label.indexOf('سفارش') >= 0;
      if ((isAdmin || isOrder) && (window.__kafeOfflineLimited || !navigatorSaysOnline())) {
        ev.preventDefault(); ev.stopPropagation();
        try { if (typeof showNotification === 'function') showNotification(isAdmin ? 'پنل مدیریت در حالت آفلاین در دسترس نیست' : 'خرید و سفارش در حالت آفلاین بسته است', 'error'); } catch (e) {}
      }
    }, true);
    function blockWhenOffline(name, msg) {
      var prev = window[name];
      if (typeof prev !== 'function' || prev.__kafeOffLock) return;
      window[name] = function () {
        if (window.__kafeOfflineLimited || !navigatorSaysOnline()) {
          try { if (typeof showNotification === 'function') showNotification(msg, 'error'); } catch (e) {}
          return;
        }
        return prev.apply(this, arguments);
      };
      window[name].__kafeOffLock = true;
    }
    blockWhenOffline('toggleAdmin', 'پنل مدیریت در حالت آفلاین در دسترس نیست');
    blockWhenOffline('openSubOrdersPanel', 'سفارش در حالت آفلاین بسته است');
    blockWhenOffline('openSubscriptionPurchase', 'خرید اشتراک در حالت آفلاین بسته است');
  }
  function runSplashThen(done) {
    setStage('splash'); hideBootLoader(); hide(el('termsScreen')); hide(el('registerScreen')); hide(el('app')); hideOfflineDialog(); hideRetryOnline();
    var splash = el('splashScreen');
    if (splash) {
      try { splash.classList.remove('waiting', 'hidden'); } catch (e) {}
      splash.style.display = 'flex';
      var bar = el('splashLoaderBar') || (splash.querySelector && splash.querySelector('.splash-loader-bar'));
      if (bar) { try { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = 'loadBar 1.8s linear forwards'; } catch (e2) {} }
    }
    setTimeout(function () {
      if (splash) { try { splash.classList.add('hidden'); } catch (e) {} setTimeout(function () { hide(splash); }, 160); }
      if (typeof done === 'function') done();
    }, MIN_SPLASH);
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

    // مهلت کلی باید مجموع بررسی شبکه، نشست و پروفایل را پوشش دهد؛ وگرنه تایمر ۴ثانیه‌ای زودتر از پاسخ معتبر، صفحه ورود را نشان می‌دهد.
    var safety = setTimeout(function () {
      if (finished) return;
      finished = true;
      hideBootLoader();
      var local = getLocalCafeUser();
      // ورود محلی فقط پس از تشخیص آفلاین و انتخاب صریح مسیر محدود آفلاین مجاز است.
      if (onlineState === false && local) showOfflineDialog();
      else showRegisterOnly();
    }, NET_PROBE_TIMEOUT + MAX_SESSION_WAIT + PROFILE_TIMEOUT + 500);

    probeOnline().then(function (online) {
      onlineState = online;
      if (finished) return;
      getSessionSafe().then(function (session) {
        if (finished) return;

        if (session && session.user) {
          loadProfile(session.user.id).then(function (profile) {
            if (finished) return;
            clearTimeout(safety);
            finished = true;
            hideBootLoader();

            if (profile) {
              enterMainApp(profile);
              return;
            }

            // نشست معتبر بدون پروفایل سرور، مجوز ورود به برنامه نیست.
            var local = getLocalCafeUser();
            if (!online && local) {
              showOfflineDialog();
            } else {
              showRegisterOnly();
              try {
                if (typeof showNotification === 'function') {
                  showNotification('نشست دریافت شد اما پروفایل کاربر از سرور تأیید نشد؛ لطفاً دوباره با شماره و PIN وارد شوید.', 'error');
                }
              } catch (e) {}
            }
          });
          return;
        }

        clearTimeout(safety);
        finished = true;
        hideBootLoader();
        var local = getLocalCafeUser();
        if (!online && local) showOfflineDialog();
        else showRegisterOnly();
      });
    }).catch(function () {
      if (finished) return;
      finished = true;
      clearTimeout(safety);
      hideBootLoader();
      showRegisterOnly();
    });
  }
  function afterSplashRoute() {
    if (!termsSeenThisSession()) { showTermsOnly(); return; }
    continueAfterTermsOrSession();
  }
  window.kafeAfterAuthSuccess = function (profile) {
    // ورود آنلاین فقط با پروفایل واقعی و دارای شناسهٔ سرور پذیرفته می‌شود؛
    // دادهٔ محلی به‌تنهایی هرگز مجوز ورود آنلاین نیست.
    if (!profile || !profile.id) {
      showRegisterOnly();
      try { if (typeof showNotification === 'function') showNotification('پروفایل کاربر از سرور تأیید نشد؛ لطفاً دوباره وارد شوید.', 'error'); } catch (e0) {}
      return false;
    }
    markTermsSeenThisSession();
    hide(el('registerScreen')); hide(el('termsScreen')); hide(el('splashScreen')); hideRetryOnline(); hideOfflineDialog(); hideBootLoader();
    window.__kafeOfflineLimited = false;
    try { document.body.classList.remove('is-offline'); } catch (e) {}
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
      // نتیجه را فقط خود مسیر احراز هویت تعیین می‌کند؛
      // از تغییر display صفحه‌ها برای حدس‌زدن موفقیت استفاده نکن.
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
    try { document.body.classList.remove('is-offline'); } catch (e) {}
    var retry = document.getElementById('kafeRetryOnlineScreen');
    if (retry && retry.style.display === 'flex') tryRetryOnline();
  });
  window.addEventListener('offline', function () {
    try { document.body.classList.add('is-offline'); } catch (e) {}
  });
  var booted = false;
  function boot() {
    pollRegisterUser(); installOfflineLocks();
    if (booted) return;
    booted = true;
    runSplashThen(afterSplashRoute);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 0); }, true);
  } else { boot(); }
  window.addEventListener('load', function () { setTimeout(pollRegisterUser, 300); });
})();
