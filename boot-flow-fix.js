/** boot-flow-fix.js V3
 * مسیر کاربر:
 * 1) اسپلش (هر بار باز شدن برنامه، قبل از همه)
 * 2) شرایط
 * 3) ثبت‌نام/ورود (ساخت حساب فقط با اینترنت)
 * 4) پیشخوان — بدون اسپلش دوباره
 *
 * کاربر ثبت‌نام‌شده + قطع نت → پیام بله/خیر آفلاین
 * کاربر جدید بدون نت → ثبت‌نام ممکن نیست (بدون مهمان)
 * جلوگیری از دو بار طی شدن مسیر در یک نشست
 */
(function () {
  'use strict';
  if (window.__KAFE_BOOT_FLOW_V3__) return;
  window.__KAFE_BOOT_FLOW_V3__ = true;

  var MIN_SPLASH = 1600;
  var MAX_SESSION_WAIT = 3500;
  var STAGE_KEY = 'kafeBootStageV3';
  var stage = 'init';

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

  function isOnline() {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
    } catch (e) {}
    return true;
  }

  function termsAccepted() {
    try {
      return localStorage.getItem('kafeTermsAccepted') === '1';
    } catch (e) {
      return false;
    }
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

  function setStage(s) {
    stage = s;
    try {
      sessionStorage.setItem(STAGE_KEY, s);
    } catch (e) {}
  }

  function getStage() {
    try {
      return sessionStorage.getItem(STAGE_KEY) || stage;
    } catch (e) {
      return stage;
    }
  }

  function enterMainApp(profile) {
    setStage('main');
    hide(el('termsScreen'));
    hide(el('splashScreen'));
    hide(el('registerScreen'));
    hideOfflineDialog();
    showBlock(el('app'));
    try {
      if (profile && typeof updateUserDisplay === 'function') {
        Promise.resolve(updateUserDisplay(profile)).catch(function () {});
      }
    } catch (e) {}
    try {
      if (typeof window.refreshUserDashboardStats === 'function') {
        window.refreshUserDashboardStats();
      }
    } catch (e2) {}
  }

  function showTermsOnly() {
    setStage('terms');
    hide(el('splashScreen'));
    hide(el('registerScreen'));
    hide(el('app'));
    hideOfflineDialog();
    var terms = el('termsScreen');
    if (terms) {
      try {
        terms.classList.remove('hidden');
      } catch (e) {}
      terms.style.display = 'flex';
    }
  }

  function showRegisterOnly() {
    setStage('auth');
    hide(el('splashScreen'));
    hide(el('termsScreen'));
    hide(el('app'));
    hideOfflineDialog();
    showFlex(el('registerScreen'));
    // اگر آفلاین: راهنما روی فرم
    if (!isOnline()) {
      try {
        if (typeof showNotification === 'function') {
          showNotification('برای ثبت‌نام باید به اینترنت متصل باشید', 'error');
        }
      } catch (e) {}
    }
  }

  function ensureOfflineDialog() {
    var id = 'kafeOfflineChoiceDialog';
    var box = document.getElementById(id);
    if (box) return box;
    box = document.createElement('div');
    box.id = id;
    box.setAttribute('role', 'dialog');
    box.style.cssText =
      'display:none;position:fixed;inset:0;z-index:10090;align-items:center;justify-content:center;' +
      'background:rgba(0,0,0,0.72);padding:20px;box-sizing:border-box;';
    box.innerHTML =
      '<div style="max-width:360px;width:100%;background:#0b1120;border:1px solid rgba(201,168,76,0.45);' +
      'border-radius:16px;padding:20px 18px;text-align:center;direction:rtl;color:#F5F0E4;">' +
      '<p style="margin:0 0 18px;line-height:1.75;font-size:0.95rem;font-weight:600;">' +
      'شما در حال حاضر به شبکه متصل نیستید. در صورت تمایل می‌توانید از برنامه به‌صورت آفلاین استفاده کنید.' +
      '</p>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
      '<button type="button" id="kafeOfflineYes" style="min-width:100px;padding:10px 16px;border-radius:12px;' +
      'border:none;background:linear-gradient(180deg,#e8c76b,#c9a84c);color:#1A1208;font-weight:800;cursor:pointer;">بله</button>' +
      '<button type="button" id="kafeOfflineNo" style="min-width:100px;padding:10px 16px;border-radius:12px;' +
      'border:1px solid rgba(201,168,76,0.5);background:#111827;color:#F0D878;font-weight:700;cursor:pointer;">خیر</button>' +
      '</div></div>';
    document.body.appendChild(box);
    var yes = box.querySelector('#kafeOfflineYes');
    var no = box.querySelector('#kafeOfflineNo');
    if (yes) {
      yes.onclick = function () {
        hideOfflineDialog();
        setStage('main');
        if (typeof window.enterAppForLocalModals === 'function') {
          window.enterAppForLocalModals('نسخه آفلاین');
        } else {
          enterMainApp(getLocalCafeUser());
        }
      };
    }
    if (no) {
      no.onclick = function () {
        hideOfflineDialog();
        setStage('wait-online');
        hide(el('app'));
        hide(el('registerScreen'));
        hide(el('splashScreen'));
        try {
          if (typeof showNotification === 'function') {
            showNotification('اتصال اینترنت برقرار نیست. پس از اتصال دوباره برنامه را باز کنید.', 'error');
          }
        } catch (e) {}
      };
    }
    return box;
  }

  function showOfflineDialog() {
    setStage('offline-choice');
    hide(el('splashScreen'));
    hide(el('termsScreen'));
    hide(el('registerScreen'));
    hide(el('app'));
    var box = ensureOfflineDialog();
    box.style.display = 'flex';
  }

  function hideOfflineDialog() {
    var box = document.getElementById('kafeOfflineChoiceDialog');
    if (box) box.style.display = 'none';
  }

  function runSplashThen(done) {
    setStage('splash');
    hide(el('termsScreen'));
    hide(el('registerScreen'));
    hide(el('app'));
    hideOfflineDialog();
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

  function afterSplashRoute() {
    if (!termsAccepted()) {
      showTermsOnly();
      return;
    }
    // شرایط قبلاً قبول شده
    getSessionSafe().then(function (session) {
      if (session && session.user) {
        loadProfile(session.user.id).then(function (profile) {
          enterMainApp(profile || getLocalCafeUser());
        });
        return;
      }
      var local = getLocalCafeUser();
      if (!isOnline()) {
        if (local) {
          showOfflineDialog();
        } else {
          showRegisterOnly();
        }
        return;
      }
      // آنلاین بدون نشست → ثبت‌نام/ورود
      showRegisterOnly();
    });
  }

  // بعد از auth موفق: مستقیم پیشخوان — بدون اسپلش دوباره
  window.kafeAfterAuthSuccess = function (profile) {
    hide(el('registerScreen'));
    hide(el('termsScreen'));
    hide(el('splashScreen'));
    enterMainApp(profile || getLocalCafeUser());
  };

  window.acceptTermsAndContinue = function () {
    try {
      localStorage.setItem('kafeTermsAccepted', '1');
    } catch (e) {}
    hide(el('termsScreen'));

    getSessionSafe().then(function (session) {
      if (session && session.user) {
        loadProfile(session.user.id).then(function (profile) {
          enterMainApp(profile || getLocalCafeUser());
        });
        return;
      }
      var local = getLocalCafeUser();
      if (!isOnline()) {
        if (local) {
          showOfflineDialog();
        } else {
          showRegisterOnly();
        }
        return;
      }
      showRegisterOnly();
    });
  };

  function patchRegisterUser() {
    var prev = window.registerUser;
    if (typeof prev !== 'function' || prev.__kafeBootV3Patched) return;
    window.registerUser = async function () {
      if (!isOnline()) {
        try {
          if (typeof showNotification === 'function') {
            showNotification('برای ثبت‌نام باید به اینترنت متصل باشید', 'error');
          }
        } catch (e) {}
        return;
      }
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
        var profile = getLocalCafeUser();
        hide(app);
        hide(reg);
        window.kafeAfterAuthSuccess(profile);
      }
    };
    window.registerUser.__kafeBootV3Patched = true;
  }

  var booted = false;
  function boot() {
    patchRegisterUser();
    if (booted) return;
    booted = true;

    // اگر در همین نشست قبلاً به main رسیده‌ایم و رفرش نرم نیست — از تکرار اسپلش جلوگیری نسبی
    var prev = getStage();
    if (prev === 'main' && el('app') && el('app').style.display === 'block') {
      return;
    }

    // همیشه: اول اسپلش، بعد مسیریابی
    runSplashThen(afterSplashRoute);
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
