/** boot-flow-fix.js
 * مسیر ورود ثابت و یکسان:
 * - هر بار: صفحه شرایط
 * - موافقم + لاگین‌شده → اسپلش → صفحه اصلی
 * - موافقم + بدون نشست → ثبت‌نام/ورود → (بعد از موفقیت) اسپلش → صفحه اصلی
 */
(function () {
  'use strict';
  if (window.__KAFE_BOOT_FLOW_V1__) return;
  window.__KAFE_BOOT_FLOW_V1__ = true;

  var MIN_SPLASH = 1600;
  var MAX_SESSION_WAIT = 3500;

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

  function showTermsOnly() {
    hide(el('splashScreen'));
    hide(el('registerScreen'));
    hide(el('app'));
    var terms = el('termsScreen');
    if (terms) {
      try { terms.classList.remove('hidden'); } catch (e) {}
      terms.style.display = 'flex';
    }
  }

  function runSplashThen(done) {
    var splash = el('splashScreen');
    var started = Date.now();
    if (splash) {
      try { splash.classList.remove('waiting', 'hidden'); } catch (e) {}
      splash.style.display = 'flex';
      var bar = el('splashLoaderBar') || (splash.querySelector && splash.querySelector('.splash-loader-bar'));
      if (bar) {
        try {
          bar.style.animation = 'none';
          void bar.offsetWidth;
          bar.style.animation = 'loadBar 1.8s linear forwards';
        } catch (e2) {}
      }
    }
    var wait = MIN_SPLASH;
    setTimeout(function () {
      if (splash) {
        try { splash.classList.add('hidden'); } catch (e) {}
        setTimeout(function () { hide(splash); }, 160);
      }
      if (typeof done === 'function') done();
    }, wait);
  }

  function enterMainApp(profile) {
    hide(el('termsScreen'));
    hide(el('splashScreen'));
    hide(el('registerScreen'));
    showBlock(el('app'));
    try {
      if (profile && typeof updateUserDisplay === 'function') {
        Promise.resolve(updateUserDisplay(profile)).catch(function () {});
      }
    } catch (e) {}
    try {
      if (typeof window.refreshUserDashboardStats === 'function') window.refreshUserDashboardStats();
    } catch (e2) {}
  }

  function getSessionSafe() {
    return new Promise(function (resolve) {
      var done = false;
      function finish(v) {
        if (done) return;
        done = true;
        resolve(v || null);
      }
      setTimeout(function () { finish(null); }, MAX_SESSION_WAIT);
      try {
        if (!window.supabaseClient || !window.supabaseClient.auth) {
          finish(null);
          return;
        }
        window.supabaseClient.auth.getSession().then(function (sr) {
          var session = sr && sr.data && sr.data.session ? sr.data.session : null;
          finish(session);
        }).catch(function () { finish(null); });
      } catch (e) {
        finish(null);
      }
    });
  }

  function loadProfile(userId) {
    return new Promise(function (resolve) {
      try {
        if (!window.supabaseClient || !userId) {
          resolve(null);
          return;
        }
        window.supabaseClient
          .from('profiles')
          .select('id,name,phone,role')
          .eq('id', userId)
          .maybeSingle()
          .then(function (pr) {
            if (pr && !pr.error && pr.data) resolve(pr.data);
            else resolve(null);
          })
          .catch(function () { resolve(null); });
      } catch (e) {
        resolve(null);
      }
    });
  }

  /** بعد از موفق بودن ثبت‌نام/ورود: اسپلش → اصلی */
  window.kafeAfterAuthSuccess = function (profile) {
    hide(el('registerScreen'));
    hide(el('termsScreen'));
    runSplashThen(function () {
      enterMainApp(profile || null);
    });
  };

  window.acceptTermsAndContinue = function () {
    try { localStorage.setItem('kafeTermsAccepted', '1'); } catch (e) {}
    hide(el('termsScreen'));

    // اول وضعیت نشست را بفهم، بعد مسیر را انتخاب کن
    getSessionSafe().then(function (session) {
      if (session && session.user) {
        // لاگین قبلی → اسپلش → اصلی
        runSplashThen(function () {
          loadProfile(session.user.id).then(function (profile) {
            if (profile) {
              enterMainApp(profile);
            } else {
              // نشست هست ولی پروفایل نیست → صفحه ورود
              hide(el('app'));
              showFlex(el('registerScreen'));
            }
          });
        });
      } else {
        // بدون نشست → ثبت‌نام/ورود (بدون اسپلش)
        hide(el('splashScreen'));
        hide(el('app'));
        showFlex(el('registerScreen'));
      }
    });
  };

  /** بعد از registerUser موفق، به‌جای ورود مستقیم، اسپلش اجرا شود */
  function patchRegisterUser() {
    var prev = window.registerUser;
    if (typeof prev !== 'function' || prev.__kafeBootPatched) return;
    window.registerUser = async function () {
      var mode = window.phonePinAuthMode === 'login' ? 'login' : 'register';
      // اجرای تابع اصلی؛ اگر موفق شد UI را خودمان کنترل می‌کنیم
      var appBefore = el('app');
      var wasAppVisible = appBefore && appBefore.style.display === 'block';

      // موقتاً enter مستقیم را خنثی می‌کنیم با observer سبک بعد از اتمام
      await prev.apply(this, arguments);

      // اگر بعد از فراخوانی، اپ باز شده و register بسته شده → یعنی موفقیت
      var reg = el('registerScreen');
      var app = el('app');
      var loggedIn = app && app.style.display === 'block' && reg && (reg.style.display === 'none' || reg.classList.contains('hidden'));
      if (loggedIn && !wasAppVisible) {
        var profile = null;
        try {
          var raw = localStorage.getItem('cafeUser');
          if (raw) profile = JSON.parse(raw);
        } catch (e) {}
        // برگشت به مسیر استاندارد: اسپلش سپس اصلی
        hide(app);
        showFlex(reg); // کوتاه پنهان نشود تا فلش نزند — مستقیم اسپلش
        hide(reg);
        window.kafeAfterAuthSuccess(profile);
      }
    };
    window.registerUser.__kafeBootPatched = true;
  }

  function boot() {
    // هر بار اول شرایط — حتی اگر قبلاً قبول شده باشد
    showTermsOnly();
    patchRegisterUser();
    // چند بار تلاش برای wrap چون main.js دیرتر هم ممکن است registerUser را عوض کند
    setTimeout(patchRegisterUser, 300);
    setTimeout(patchRegisterUser, 1200);
    setTimeout(patchRegisterUser, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 0);
      setTimeout(boot, 200);
    }, true);
  } else {
    boot();
  }
  window.addEventListener('load', function () {
    setTimeout(boot, 100);
    setTimeout(patchRegisterUser, 500);
  });
})();
