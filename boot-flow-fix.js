/** boot-flow-fix.js V2
 * مسیر ثابت یک‌باره:
 * شرایط → (لاگین؟ اسپلش→اصلی : ثبت‌نام) → بعد از auth: اسپلش→اصلی
 * جلوگیری از دو بار اجرا شدن boot
 */
(function () {
  'use strict';
  if (window.__KAFE_BOOT_FLOW_V2__) return;
  window.__KAFE_BOOT_FLOW_V2__ = true;

  var MIN_SPLASH = 1600;
  var MAX_SESSION_WAIT = 3500;
  var stage = 'init'; // init | terms | auth | splash | main

  function el(id) {
    return document.getElementById(id);
  }

  function hide(node) {
    if (!node) return;
    node.style.display = 'none';
    try {
      node.classList.add('hidden');
      node.classList.remove('active');
    } catch (e) {}
  }

  function showFlex(node) {
    if (!node) return;
    try {
      node.classList.remove('hidden');
      node.classList.add('active');
    } catch (e) {}
    node.style.display = 'flex';
  }

  function showBlock(node) {
    if (!node) return;
    try {
      node.classList.remove('hidden');
    } catch (e) {}
    node.style.display = 'block';
  }

  function showTermsOnly() {
    if (stage === 'main' || stage === 'splash' || stage === 'auth') return;
    stage = 'terms';
    hide(el('splashScreen'));
    hide(el('registerScreen'));
    hide(el('app'));
    var terms = el('termsScreen');
    if (terms) {
      try {
        terms.classList.remove('hidden');
      } catch (e) {}
      terms.style.display = 'flex';
    }
  }

  function runSplashThen(done) {
    stage = 'splash';
    var splash = el('splashScreen');
    if (splash) {
      try {
        splash.classList.remove('waiting', 'hidden');
      } catch (e) {}
      splash.style.display = 'flex';
      var bar =
        el('splashLoaderBar') ||
        (splash.querySelector && splash.querySelector('.splash-loader-bar'));
      if (bar) {
        try {
          bar.style.animation = 'none';
          void bar.offsetWidth;
          bar.style.animation = 'loadBar 1.8s linear forwards';
        } catch (e2) {}
      }
    }
    setTimeout(function () {
      if (splash) {
        try {
          splash.classList.add('hidden');
        } catch (e) {}
        setTimeout(function () {
          hide(splash);
        }, 160);
      }
      if (typeof done === 'function') done();
    }, MIN_SPLASH);
  }

  function enterMainApp(profile) {
    stage = 'main';
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
      setTimeout(function () {
        finish(null);
      }, MAX_SESSION_WAIT);
      try {
        if (!window.supabaseClient || !window.supabaseClient.auth) {
          finish(null);
          return;
        }
        window.supabaseClient.auth
          .getSession()
          .then(function (sr) {
            var session =
              sr && sr.data && sr.data.session ? sr.data.session : null;
            finish(session);
          })
          .catch(function () {
            finish(null);
          });
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
          .catch(function () {
            resolve(null);
          });
      } catch (e) {
        resolve(null);
      }
    });
  }

  window.kafeAfterAuthSuccess = function (profile) {
    hide(el('registerScreen'));
    hide(el('termsScreen'));
    runSplashThen(function () {
      enterMainApp(profile || null);
    });
  };

  window.acceptTermsAndContinue = function () {
    try {
      localStorage.setItem('kafeTermsAccepted', '1');
    } catch (e) {}
    hide(el('termsScreen'));

    getSessionSafe().then(function (session) {
      if (session && session.user) {
        runSplashThen(function () {
          loadProfile(session.user.id).then(function (profile) {
            if (profile) {
              enterMainApp(profile);
            } else {
              stage = 'auth';
              hide(el('app'));
              showFlex(el('registerScreen'));
            }
          });
        });
      } else {
        stage = 'auth';
        hide(el('splashScreen'));
        hide(el('app'));
        showFlex(el('registerScreen'));
      }
    });
  };

  function patchRegisterUser() {
    var prev = window.registerUser;
    if (typeof prev !== 'function' || prev.__kafeBootPatched) return;
    window.registerUser = async function () {
      var appBefore = el('app');
      var wasAppVisible = appBefore && appBefore.style.display === 'block';
      await prev.apply(this, arguments);
      var reg = el('registerScreen');
      var app = el('app');
      var loggedIn =
        app &&
        app.style.display === 'block' &&
        reg &&
        (reg.style.display === 'none' || reg.classList.contains('hidden'));
      if (loggedIn && !wasAppVisible) {
        var profile = null;
        try {
          var raw = localStorage.getItem('cafeUser');
          if (raw) profile = JSON.parse(raw);
        } catch (e) {}
        hide(app);
        hide(reg);
        window.kafeAfterAuthSuccess(profile);
      }
    };
    window.registerUser.__kafeBootPatched = true;
  }

  var booted = false;
  function boot() {
    if (booted) {
      patchRegisterUser();
      return;
    }
    booted = true;
    showTermsOnly();
    patchRegisterUser();
    setTimeout(patchRegisterUser, 400);
    setTimeout(patchRegisterUser, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        setTimeout(boot, 0);
      },
      true
    );
  } else {
    boot();
  }
  window.addEventListener('load', function () {
    setTimeout(patchRegisterUser, 300);
  });
})();
