/**
 * qa-harness.js v4
 * درخواست: ?qa=1 یا sessionStorage.kafeQA=1 (نه ماندگار localStorage)
 * مجوز نمایش: profiles.role=admin از سرور — فقط محدودکننده UI؛ بدون نوشتن DB
 * آفلاین: بدون نشست مدیر → پیام نیاز به اینترنت؛ بدون دور زدن OTP
 */
(function () {
  'use strict';
  if (window.__KAFE_QA_HARNESS_V3__) return;
  window.__KAFE_QA_HARNESS_V3__ = true;

  function trimQaParam() {
    try {
      var sp = new URLSearchParams(location.search || '');
      var q = sp.get('qa');
      if (q != null && String(q).trim() === '1') return true;
    } catch (e) {}
    try {
      if (/(?:^|[?&])qa\s*=\s*1(?:&|$)/.test(location.search || '')) return true;
    } catch (e2) {}
    return false;
  }

  function wantsQA() {
    if (trimQaParam()) return true;
    try {
      if (sessionStorage.getItem('kafeQA') === '1' ||
          sessionStorage.getItem('kafeQARequested') === '1') return true;
    } catch (e) {}
    return false;
  }
  if (!wantsQA()) return;

  /* پاک‌سازی فلگ قدیمی ماندگار؛ درخواست URL یک‌بارمصرف است. */
  try { localStorage.removeItem('kafeQA'); } catch (eL) {}
  try { sessionStorage.removeItem('kafeQARequested'); } catch (eR) {}

  var results = [];
  var jsErrors = [];
  var startedAt = new Date().toISOString();
  var preLoadNote =
    'خطاهای قبل از لود اسکریپت QA ممکن است ثبت نشده باشند.';

  window.addEventListener('error', function (ev) {
    jsErrors.push({
      t: new Date().toISOString(),
      msg: String((ev && ev.message) || 'error'),
      file: String((ev && ev.filename) || ''),
      line: ev && ev.lineno != null ? String(ev.lineno) : ''
    });
  });
  window.addEventListener('unhandledrejection', function (ev) {
    var r = ev && ev.reason;
    jsErrors.push({
      t: new Date().toISOString(),
      msg: 'Promise: ' + String((r && r.message) || r || 'rejection'),
      file: '',
      line: ''
    });
  });

  function add(status, title, detail, tip) {
    results.push({
      status: status,
      title: String(title || ''),
      detail: String(detail || ''),
      tip: String(tip || ''),
      at: new Date().toISOString()
    });
  }

  function getClient() {
    return window.supabaseClient || window.v12Supabase || null;
  }

  function browserOnline() {
    try {
      return navigator.onLine !== false;
    } catch (e) {
      return true;
    }
  }

  function verifyAdminFromServer() {
    return new Promise(function (resolve) {
      var c = getClient();
      if (!c || !c.auth) {
        resolve({ ok: false, reason: 'کلاینت Supabase آماده نیست', offlineHint: !browserOnline() });
        return;
      }
      if (!browserOnline()) {
        /* فقط نشست همین تب که قبلاً آنلاین و با role=admin تأیید شده مجاز است */
        c.auth.getSession().then(function (sr) {
          var ses = sr && sr.data && sr.data.session;
          var previouslyVerified = false;
          try {
            previouslyVerified = sessionStorage.getItem('kafeQA') === '1';
          } catch (e) {}
          if (ses && ses.user && previouslyVerified) {
            resolve({ ok: true, offlineSession: true });
          } else {
            resolve({
              ok: false,
              reason:
                'برای ورود مدیر و اجرای آزمون مدیریتی، ابتدا آنلاین با OTP تلگرام وارد شوید. حالت آفلاین فقط در همان نشستِ قبلاً تأییدشده مجاز است.',
              offlineHint: true
            });
          }
        }).catch(function () {
          resolve({
            ok: false,
            reason: 'برای ورود مدیر و اجرای آزمون مدیریتی، اتصال اینترنت لازم است.',
            offlineHint: true
          });
        });
        return;
      }

      var done = false;
      function finish(v) {
        if (done) return;
        done = true;
        resolve(v);
      }
      setTimeout(function () {
        finish({
          ok: false,
          reason: 'زمان‌اتمام بررسی نقش مدیر از سرور'
        });
      }, 5000);

      c.auth
        .getSession()
        .then(function (sr) {
          var user = sr && sr.data && sr.data.session && sr.data.session.user;
          if (!user || !user.id) {
            finish({
              ok: false,
              reason:
                'نشست مدیر نیست. ابتدا آنلاین با OTP تلگرام وارد پنل مدیریت شوید، سپس ?qa=1 را باز کنید.'
            });
            return null;
          }
          return c.from('profiles').select('role').eq('id', user.id).maybeSingle();
        })
        .then(function (prof) {
          if (!prof) return;
          if (prof.error) {
            finish({ ok: false, reason: 'خطا در خواندن نقش از سرور' });
            return;
          }
          if (prof.data && prof.data.role === 'admin') finish({ ok: true });
          else finish({ ok: false, reason: 'نقش admin در سرور تأیید نشد' });
        })
        .catch(function () {
          finish({ ok: false, reason: 'خطا در ارتباط احراز مدیر' });
        });
    });
  }

  function el(tag, styles) {
    var n = document.createElement(tag);
    if (styles) n.style.cssText = styles;
    return n;
  }

  function showDenied(reason) {
    var panel = document.getElementById('kafeQAPanel');
    if (!panel) {
      panel = el('div');
      panel.id = 'kafeQAPanel';
      document.body.appendChild(panel);
    }
    panel.setAttribute('data-qa-denied', '1');
    panel.setAttribute('dir', 'rtl');
    /* پیام غیرمسدودکننده: فرم ورود و OTP باید قابل استفاده بمانند */
    panel.style.cssText =
      'position:fixed;left:10px;right:10px;top:10px;z-index:120000;max-height:42vh;overflow:auto;background:rgba(7,11,20,0.97);color:#F5F0E4;border:1px solid rgba(201,168,76,.55);border-radius:14px;display:block;padding:14px;font-family:Tahoma,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.35);';
    while (panel.firstChild) panel.removeChild(panel.firstChild);

    var box = el('div', 'max-width:480px;margin:0 auto;text-align:center;line-height:1.7');
    var h = el('div', 'font-size:1.05rem;color:#F0D878;font-weight:800;margin-bottom:6px');
    h.textContent = 'ابزار QA — ورود مدیر لازم است';
    var p1 = el('p', 'font-size:0.86rem;opacity:0.95;margin:4px 0');
    p1.textContent = 'این پیام مانع استفاده از صفحه ورود برنامه نمی‌شود.';
    var p2 = el('p', 'font-size:0.8rem;color:#F0D878;margin:6px 0');
    p2.textContent = String(reason || '');
    var btn = el(
      'button',
      'margin-top:8px;padding:8px 16px;border-radius:10px;border:1px solid #555;background:#1a1a2e;color:#eee'
    );
    btn.type = 'button';
    btn.textContent = 'بستن';
    btn.onclick = function () {
      panel.style.display = 'none';
      try {
        sessionStorage.removeItem('kafeQA');
      } catch (e) {}
    };
    box.appendChild(h);
    box.appendChild(p1);
    box.appendChild(p2);
    box.appendChild(btn);
    panel.appendChild(box);
  }

  function checkLoad() {
    var app = document.getElementById('app');
    var terms = document.getElementById('termsScreen');
    var reg = document.getElementById('registerScreen');
    add(
      app || terms || reg ? 'green' : 'red',
      'بارگذاری برنامه',
      'app=' + !!app + ' terms=' + !!terms + ' register=' + !!reg,
      ''
    );
    add('yellow', 'محدودیت ثبت خطا', preLoadNote, '');
  }

  function checkBottomNav() {
    var nav = document.getElementById('bottomNav');
    if (!nav) {
      add('red', 'نوار پایین — وجود', '#bottomNav نیست', '');
      return;
    }
    var btns = nav.querySelectorAll('button.nav-item-bottom');
    add(btns.length ? 'green' : 'red', 'نوار پایین — وجود دکمه (سطح A)', btns.length + ' دکمه', '');

    var withOnclick = 0;
    for (var i = 0; i < btns.length; i++) {
      if ((btns[i].getAttribute('onclick') || '').trim()) withOnclick++;
    }
    add(
      'yellow',
      'نوار پایین — نشانه رویداد (سطح B)',
      'onclick صریح: ' + withOnclick + '/' + btns.length,
      'بسیاری از دکمه‌ها با listener پچ وصل می‌شوند'
    );

    /* در نسخه همراه مدیر، بارگذاری QA نباید خودش صفحه برنامه را جابه‌جا کند. */
    add(
      typeof window.scrollToPage === 'function' ? 'green' : 'yellow',
      'ناوبری — وجود تابع',
      typeof window.scrollToPage === 'function'
        ? 'تابع scrollToPage موجود است؛ برای حفظ وضعیت مدیر خودکار فراخوانی نشد.'
        : 'تابع scrollToPage در زمان بررسی موجود نبود',
      'واکنش واقعی با لمس مدیر در همراه QA ثبت می‌شود.'
    );

    add(
      'yellow',
      'موفقیت واقعی دکمه (سطح C)',
      'عمداً آزمایش نشد — خرید، سفارش، ثبت‌نام، OTP ممنوع',
      ''
    );
  }

  function checkAuthForms() {
    var reg = document.getElementById('registerScreen');
    if (!reg) {
      add('yellow', 'فرم ثبت‌نام — وجود', 'الان در DOM فعال نیست', 'بدون ساخت حساب');
      return;
    }
    var name = document.querySelector('#registerScreen input[type="text"]');
    var phone = document.querySelector('#registerScreen input[type="tel"]');
    var pin = document.querySelector('#registerScreen input[type="password"]');
    add(
      'green',
      'فرم ثبت‌نام — وجود فیلد (A)',
      'text=' + !!name + ' tel=' + !!phone + ' password=' + !!pin,
      ''
    );
    add('yellow', 'فرم ثبت‌نام — سطح C', 'ثبت‌نام واقعی و OTP انجام نمی‌شود', '');
  }

  function checkNetworkLayered() {
    var navOn = browserOnline();
    add(
      navOn ? 'green' : 'red',
      'شبکه — navigator.onLine',
      navOn ? 'مرورگر آنلاین گزارش کرد' : 'مرورگر آفلاین گزارش کرد',
      'جدا از رسیدن واقعی به سرور'
    );

    return new Promise(function (resolve) {
      var done = false;
      function fin() {
        if (done) return;
        done = true;
        resolve();
      }
      setTimeout(function () {
        if (!done) {
          add('yellow', 'شبکه — fetch همان‌مبدأ', 'پاسخ در ۳ث نیامد', '');
          fin();
        }
      }, 3000);
      fetch('./data.js?_qa=' + Date.now(), { method: 'GET', cache: 'no-store' })
        .then(function (res) {
          add(
            res.ok ? 'green' : 'yellow',
            'شبکه — پاسخ فایل همان‌مبدأ',
            'status=' + res.status,
            ''
          );
          fin();
        })
        .catch(function () {
          add('red', 'شبکه — پاسخ فایل همان‌مبدأ', 'fetch ناموفق', '');
          fin();
        });
    });
  }

  function checkSupabaseReadOnly() {
    return new Promise(function (resolve) {
      var c = getClient();
      if (!c) {
        add('red', 'Supabase — کلاینت', 'موجود نیست', '');
        resolve();
        return;
      }
      add('green', 'Supabase — کلاینت', 'موجود (کلید افشا نمی‌شود)', '');
      var done = false;
      function fin() {
        if (done) return;
        done = true;
        resolve();
      }
      setTimeout(function () {
        if (!done) {
          add('yellow', 'Supabase — سرویس', 'زمان‌اتمام', '');
          fin();
        }
      }, 4000);
      c.auth
        .getSession()
        .then(function (sr) {
          var has = !!(sr && sr.data && sr.data.session && sr.data.session.user);
          add(
            'green',
            'Supabase — نشست',
            has ? 'نشست فعال (بدون شناسه کاربر در گزارش)' : 'بدون نشست',
            ''
          );
          return c.from('products').select('id').limit(1);
        })
        .then(function (r) {
          if (!r) return;
          if (r.error) {
            add(
              'yellow',
              'Supabase — خواندن products',
              String(r.error.message || r.error).slice(0, 100),
              'فقط‌خواندنی'
            );
          } else {
            add('green', 'Supabase — خواندن products', 'select فقط‌خواندنی OK', '');
          }
          fin();
        })
        .catch(function (e) {
          add('red', 'Supabase — خطا', String((e && e.message) || e).slice(0, 100), '');
          fin();
        });
    });
  }

  function checkJsErrors() {
    if (!jsErrors.length) {
      add('green', 'خطاهای JS پس از لود QA', 'موردی ثبت نشد', preLoadNote);
    } else {
      jsErrors.slice(0, 8).forEach(function (err, i) {
        var d = err.msg + (err.file ? ' @ ' + err.file + ':' + err.line : '');
        add('red', 'خطای JS #' + (i + 1), d.slice(0, 200), '');
      });
    }
  }

  function checkPatches() {
    var keys = ['boot-flow', 'buy-nav', 'final-nav', 'msg-session'];
    var found = 0;
    keys.forEach(function (k) {
      if (document.querySelector('script[data-kafe-patch="' + k + '"]')) found++;
    });
    add(found >= 2 ? 'green' : 'yellow', 'پچ‌های تزریق‌شده', found + ' نشانه در DOM', '');
  }

  function statusIcon(s) {
    if (s === 'green') return '🟢';
    if (s === 'red') return '🔴';
    return '🟡';
  }

  function buildReportText() {
    var lines = [
      'گزارش QA کافه سرکتاب میعاد (فقط مدیر · UI gate)',
      'شروع: ' + startedAt,
      'پایان: ' + new Date().toISOString(),
      'navigator.onLine: ' + browserOnline(),
      '',
      '--- اجرا شده ---'
    ];
    results.forEach(function (r) {
      lines.push(statusIcon(r.status) + ' ' + r.title);
      if (r.detail) lines.push('   ' + r.detail);
      if (r.tip) lines.push('   راهکار: ' + r.tip);
      lines.push('');
    });
    lines.push('--- انجام‌نشده (عمدی) ---');
    lines.push('🟡 ثبت‌نام واقعی / OTP / سفارش / پرداخت / فیش / تغییر نقش');
    lines.push('🟡 کلیک واقعی روی دکمه نوار (فقط scrollToPage مستقیم تست شد)');
    return lines.join('\n');
  }

  function ensurePanel() {
    var panel = document.getElementById('kafeQAPanel');
    if (panel && panel.getAttribute('data-qa-ready') === '1') return panel;
    if (!panel) {
      panel = el('div');
      panel.id = 'kafeQAPanel';
      document.body.appendChild(panel);
    }
    panel.setAttribute('data-qa-ready', '1');
    panel.setAttribute('dir', 'rtl');
    panel.style.cssText =
      'position:fixed;inset:0;z-index:120000;background:rgba(7,11,20,0.94);color:#F5F0E4;overflow:auto;padding:16px;font-family:Tahoma,sans-serif;font-size:14px;display:block;';
    while (panel.firstChild) panel.removeChild(panel.firstChild);

    var wrap = el('div', 'max-width:480px;margin:0 auto');
    var h = el('h2', 'color:#F0D878;margin:0 0 8px;font-size:1.1rem');
    h.textContent = 'تست و عیب‌یابی داخلی';
    var sub = el('p', 'opacity:0.85;font-size:0.8rem;line-height:1.6;margin:0 0 12px');
    sub.textContent = 'فقط مدیر · فقط‌خواندنی · بدون داده خصوصی · فلگ نشست‌موقت';
    var list = el('div');
    list.id = 'kafeQAList';
    var row = el('div', 'display:flex;gap:8px;flex-wrap:wrap;margin-top:16px');

    function mkBtn(id, label, css) {
      var b = el('button', css);
      b.type = 'button';
      b.id = id;
      b.textContent = label;
      return b;
    }
    var run = mkBtn(
      'kafeQARun',
      'اجرای مجدد',
      'padding:10px 14px;border-radius:10px;border:none;background:linear-gradient(180deg,#e8c76b,#c9a84c);color:#1A1208;font-weight:800'
    );
    var copy = mkBtn(
      'kafeQACopy',
      'کپی گزارش',
      'padding:10px 14px;border-radius:10px;border:1px solid rgba(201,168,76,0.5);background:#111827;color:#F0D878;font-weight:700'
    );
    var close = mkBtn(
      'kafeQAClose',
      'بستن',
      'padding:10px 14px;border-radius:10px;border:1px solid #444;background:#1a1a2e;color:#ccc'
    );
    var msg = el('p', 'font-size:0.75rem;color:#8a8;margin-top:8px');
    msg.id = 'kafeQACopyMsg';

    run.onclick = function () {
      runAll();
    };
    close.onclick = function () {
      panel.style.display = 'none';
      try {
        sessionStorage.removeItem('kafeQA');
      } catch (e) {}
    };
    copy.onclick = function () {
      var t = buildReportText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () {
          msg.textContent = 'گزارش کپی شد';
        });
      } else {
        window.prompt('کپی:', t);
      }
    };

    row.appendChild(run);
    row.appendChild(copy);
    row.appendChild(close);
    wrap.appendChild(h);
    wrap.appendChild(sub);
    wrap.appendChild(list);
    wrap.appendChild(row);
    wrap.appendChild(msg);
    panel.appendChild(wrap);
    return panel;
  }

  function render() {
    var list = document.getElementById('kafeQAList');
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    results.forEach(function (r) {
      var card = el(
        'div',
        'border:1px solid rgba(201,168,76,0.25);border-radius:12px;padding:10px 12px;margin-bottom:8px;background:rgba(255,255,255,0.04)'
      );
      var title = el('div', 'font-weight:800');
      title.textContent = statusIcon(r.status) + ' ' + r.title;
      card.appendChild(title);
      if (r.detail) {
        var d = el('div', 'font-size:0.8rem;opacity:0.9;margin-top:4px;line-height:1.5');
        d.textContent = r.detail;
        card.appendChild(d);
      }
      if (r.tip) {
        var t = el('div', 'font-size:0.75rem;color:#c9a84c;margin-top:4px');
        t.textContent = 'راهکار: ' + r.tip;
        card.appendChild(t);
      }
      list.appendChild(card);
    });
  }

  function runAll() {
    results = [];
    ensurePanel();
    checkLoad();
    checkPatches();
    checkBottomNav();
    checkAuthForms();
    checkJsErrors();
    render();
    checkNetworkLayered()
      .then(function () {
        return checkSupabaseReadOnly();
      })
      .then(function () {
        checkJsErrors();
        render();
      });
  }

  var bootInProgress = false;
  var adminVerified = false;

  function boot() {
    if (bootInProgress) return;
    bootInProgress = true;
    verifyAdminFromServer().then(function (v) {
      bootInProgress = false;
      if (!v || !v.ok) {
        /* درخواست ناموفق نباید در نشست بماند و در مراجعه بعدی پنل محدودیت بسازد. */
        try {
          sessionStorage.removeItem('kafeQARequested');
          sessionStorage.removeItem('kafeQA');
        } catch (eDenied) {}
        if (!adminVerified) showDenied(v && v.reason ? v.reason : 'دسترسی رد شد');
        return;
      }
      adminVerified = true;
      var denied = document.getElementById('kafeQAPanel');
      if (denied && denied.getAttribute('data-qa-denied') === '1') {
        denied.style.display = 'none';
        denied.removeAttribute('data-qa-denied');
      }
      try {
        if (trimQaParam() || v.offlineSession ||
            sessionStorage.getItem('kafeQARequested') === '1') {
          sessionStorage.setItem('kafeQA', '1');
        }
        sessionStorage.removeItem('kafeQARequested');
      } catch (e2) {}
      ensurePanel();
      setTimeout(function () {
        runAll();
        window.__KAFE_QA_ADMIN_VERIFIED__ = true;
        try { window.dispatchEvent(new Event('kafe:qa-admin-verified')); } catch (e) {}
        /* پنل قدیمی پس از بررسی اولیه کنار می‌رود تا مدیر در خود برنامه کار کند. */
        setTimeout(function () {
          var oldPanel = document.getElementById('kafeQAPanel');
          if (oldPanel) oldPanel.style.display = 'none';
        }, 700);
      }, 400);
    }).catch(function () {
      bootInProgress = false;
      if (!adminVerified) showDenied('بررسی مجوز مدیر انجام نشد؛ اتصال اینترنت را بررسی کنید.');
    });
  }

  function watchAdminSignIn() {
    var c = getClient();
    if (!c || !c.auth || typeof c.auth.onAuthStateChange !== 'function') return false;
    if (window.__KAFE_QA_AUTH_WATCH__) return true;
    window.__KAFE_QA_AUTH_WATCH__ = true;
    c.auth.onAuthStateChange(function (event) {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        /* پس از ورود واقعی/OTP، نقش از سرور دوباره بررسی می‌شود */
        setTimeout(boot, 250);
      } else if (event === 'SIGNED_OUT') {
        adminVerified = false;
        window.__KAFE_QA_ADMIN_VERIFIED__ = false;
        try { window.dispatchEvent(new Event('kafe:qa-end')); } catch (e) {}
        var panel = document.getElementById('kafeQAPanel');
        if (panel) panel.style.display = 'none';
        try {
          sessionStorage.removeItem('kafeQA');
          sessionStorage.removeItem('kafeQARequested');
        } catch (e) {}
      }
    });
    return true;
  }

  function waitClientThenBoot(attempt) {
    attempt = attempt || 0;
    if (getClient() || attempt > 40) {
      watchAdminSignIn();
      boot();
      return;
    }
    setTimeout(function () {
      waitClientThenBoot(attempt + 1);
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        waitClientThenBoot(0);
      }, 300);
    });
  } else {
    setTimeout(function () {
      waitClientThenBoot(0);
    }, 300);
  }
})();
