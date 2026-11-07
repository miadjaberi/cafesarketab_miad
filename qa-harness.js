/**
 * qa-harness.js v2 — تست داخلی فقط‌خواندنی، فقط مدیر با role=admin از سرور
 * فعال‌سازی درخواست: ?qa=1 یا localStorage.kafeQA=1
 * مجوز واقعی: نشست Supabase + profiles.role === 'admin' (نه فلگ محلی)
 */
(function () {
  'use strict';
  if (window.__KAFE_QA_HARNESS_V2__) return;
  window.__KAFE_QA_HARNESS_V2__ = true;

  function wantsQA() {
    try {
      var sp = new URLSearchParams(location.search || '');
      var q = sp.get('qa');
      if (q != null && String(q).trim() === '1') return true;
      // پشتیبان بدون URLSearchParams
      if (/(?:^|[?&])qa\s*=\s*1(?:&|$)/.test(location.search || '')) return true;
      if (localStorage.getItem('kafeQA') === '1') return true;
    } catch (e) {}
    return false;
  }
  if (!wantsQA()) return;

  var results = [];
  var jsErrors = [];
  var startedAt = new Date().toISOString();
  var preLoadNote =
    'خطاهای رخ‌داده قبل از لود این اسکریپت ممکن است ثبت نشده باشند (محدودیت ابزار).';

  window.addEventListener('error', function (ev) {
    jsErrors.push({
      t: new Date().toISOString(),
      msg: String((ev && ev.message) || 'error'),
      file: String((ev && ev.filename) || ''),
      line: ev && ev.lineno != null ? ev.lineno : ''
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
      title: title,
      detail: detail || '',
      tip: tip || '',
      at: new Date().toISOString()
    });
  }

  function getClient() {
    return window.supabaseClient || window.v12Supabase || null;
  }

  /** مجوز سمت سرور: session + profiles.role=admin */
  function verifyAdminFromServer() {
    return new Promise(function (resolve) {
      var c = getClient();
      if (!c || !c.auth) {
        resolve({ ok: false, reason: 'کلاینت Supabase آماده نیست' });
        return;
      }
      var done = false;
      function finish(v) {
        if (done) return;
        done = true;
        resolve(v);
      }
      setTimeout(function () {
        finish({ ok: false, reason: 'زمان‌اتمام بررسی نقش مدیر' });
      }, 5000);
      c.auth
        .getSession()
        .then(function (sr) {
          var ses = sr && sr.data && sr.data.session;
          var user = ses && ses.user;
          if (!user || !user.id) {
            finish({ ok: false, reason: 'نشست مدیر نیست — ابتدا با OTP تلگرام وارد پنل مدیریت شوید' });
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
          if (prof.data && prof.data.role === 'admin') {
            finish({ ok: true });
          } else {
            finish({ ok: false, reason: 'نقش admin در سرور تأیید نشد' });
          }
        })
        .catch(function () {
          finish({ ok: false, reason: 'خطا در ارتباط احراز مدیر' });
        });
    });
  }

  function showDenied(reason) {
    var id = 'kafeQAPanel';
    var panel = document.getElementById(id);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = id;
      panel.setAttribute('dir', 'rtl');
      panel.style.cssText =
        'position:fixed;inset:0;z-index:120000;background:rgba(7,11,20,0.96);color:#F5F0E4;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Tahoma,sans-serif;';
      document.body.appendChild(panel);
    }
    panel.style.display = 'flex';
    panel.innerHTML =
      '<div style="max-width:360px;text-align:center;line-height:1.7">' +
      '<div style="font-size:1.2rem;color:#F0D878;font-weight:800;margin-bottom:12px">دسترسی محدود</div>' +
      '<p style="font-size:0.9rem;opacity:0.9">ابزار تست فقط برای مدیر مجاز است.</p>' +
      '<p style="font-size:0.8rem;color:#c9a84c;margin-top:10px">' +
      String(reason || '') +
      '</p>' +
      '<button type="button" id="kafeQADenyClose" style="margin-top:18px;padding:10px 18px;border-radius:10px;border:1px solid #555;background:#1a1a2e;color:#eee">بستن</button>' +
      '</div>';
    var btn = document.getElementById('kafeQADenyClose');
    if (btn)
      btn.onclick = function () {
        panel.style.display = 'none';
      };
  }

  function hasOnclickAttr(el) {
    return !!(el && el.getAttribute && (el.getAttribute('onclick') || '').trim());
  }

  function checkLoad() {
    var app = document.getElementById('app');
    var terms = document.getElementById('termsScreen');
    var reg = document.getElementById('registerScreen');
    add(
      app || terms || reg ? 'green' : 'red',
      'بارگذاری برنامه (وجود پوسته)',
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
    add(
      btns.length ? 'green' : 'red',
      'نوار پایین — وجود دکمه (سطح A)',
      btns.length + ' دکمه',
      ''
    );

    var labels = [];
    var withOnclick = 0;
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var lab = (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 20);
      labels.push(lab || '#' + i);
      if (hasOnclickAttr(b)) withOnclick++;
    }
    add(
      'yellow',
      'نوار پایین — نشانه رویداد (سطح B)',
      'onclick صریح: ' +
        withOnclick +
        '/' +
        btns.length +
        ' · بقیه معمولاً با addEventListener در پچ‌ها (در DevTools کامل دیده نمی‌شود)',
      labels.join(' | ')
    );

    // کلیک بی‌خطر فقط روی دکمه ابزارها اگر برچسبش ابزار باشد — فقط وجود handler با dispatch خنثی
    var safeClicked = false;
    for (var j = 0; j < btns.length; j++) {
      var btn = btns[j];
      if (btn.classList.contains('center-btn')) continue;
      var t = (btn.textContent || '').replace(/\s+/g, ' ');
      if (t.indexOf('ابزار') >= 0) {
        try {
          if (typeof window.scrollToPage === 'function') {
            window.scrollToPage('pageTools');
            safeClicked = true;
            add('green', 'ناوبری بی‌خطر (سطح B+)', 'scrollToPage(pageTools) فراخوانی شد', 'عملیات نوشتن داده ندارد');
          }
        } catch (e) {
          add('yellow', 'ناوبری بی‌خطر', 'خطا در scrollToPage', String(e.message || e).slice(0, 80));
        }
        break;
      }
    }
    if (!safeClicked) {
      add('yellow', 'ناوبری بی‌خطر', 'دکمه ابزارها یا scrollToPage در دسترس نبود', '');
    }

    add(
      'yellow',
      'موفقیت واقعی دکمه (سطح C)',
      'عمداً آزمایش نشد — خرید، سفارش، ثبت‌نام، OTP ممنوع',
      ''
    );
  }

  function checkAuthForms() {
    var reg = document.getElementById('registerScreen');
    var name = document.querySelector('#registerScreen input[type="text"]');
    var phone = document.querySelector('#registerScreen input[type="tel"]');
    var pin = document.querySelector('#registerScreen input[type="password"]');
    if (!reg) {
      add('yellow', 'فرم ثبت‌نام — وجود', 'صفحه ثبت‌نام الان در DOM فعال/مرئی نیست', 'بدون ساخت حساب');
      return;
    }
    add(
      'green',
      'فرم ثبت‌نام — وجود فیلد (A)',
      'text=' + !!name + ' tel=' + !!phone + ' password=' + !!pin,
      ''
    );
    add('yellow', 'فرم ثبت‌نام — سطح C', 'ثبت‌نام واقعی و OTP انجام نمی‌شود', '');
  }

  function checkNetworkLayered() {
    var navOn = true;
    try {
      navOn = navigator.onLine !== false;
    } catch (e) {}
    add(
      navOn ? 'green' : 'red',
      'شبکه — navigator.onLine',
      navOn ? 'مرورگر آنلاین گزارش کرد' : 'مرورگر آفلاین گزارش کرد',
      'این با رسیدن واقعی به سرور یکی نیست'
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
      var url = './data.js?_qa=' + Date.now();
      fetch(url, { method: 'GET', cache: 'no-store' })
        .then(function (res) {
          add(
            res.ok ? 'green' : 'yellow',
            'شبکه — پاسخ فایل همان‌مبدأ',
            'status=' + res.status + ' (اتصال به هاست صفحات)',
            ''
          );
          fin();
        })
        .catch(function () {
          add('red', 'شبکه — پاسخ فایل همان‌مبدأ', 'fetch ناموفق', 'نت یا مسدودسازی');
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
      add('green', 'Supabase — کلاینت', 'موجود (بدون افشای کلید)', '');
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
            has ? 'نشست فعال (شناسه کاربر نمایش داده نمی‌شود)' : 'بدون نشست',
            ''
          );
          return c.from('products').select('id').limit(1);
        })
        .then(function (r) {
          if (!r) return;
          if (r.error) {
            add('yellow', 'Supabase — خواندن عمومی products', String(r.error.message || r.error).slice(0, 100), '');
          } else {
            add('green', 'Supabase — خواندن عمومی products', 'select فقط‌خواندنی OK',
              'اتصال واقعی به سرویس تأیید شد');
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
        add(
          'red',
          'خطای JS #' + (i + 1),
          err.msg + (err.file ? ' @ ' + err.file + ':' + err.line : ''),
          ''
        );
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
      'گزارش QA کافه سرکتاب میعاد (فقط مدیر)',
      'شروع: ' + startedAt,
      'پایان: ' + new Date().toISOString(),
      'URL: ' + String(location.href).replace(/([?&])qa=[^&]*/g, '$1qa=1').split('#')[0],
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
    lines.push('🟡 ثبت‌نام واقعی / OTP / سفارش / پرداخت / فیش / تغییر نقش / حذف داده');
    return lines.join('\n');
  }

  function ensurePanel() {
    var id = 'kafeQAPanel';
    var panel = document.getElementById(id);
    if (panel && panel.getAttribute('data-qa-ready') === '1') return panel;
    if (!panel) {
      panel = document.createElement('div');
      panel.id = id;
      document.body.appendChild(panel);
    }
    panel.setAttribute('data-qa-ready', '1');
    panel.setAttribute('dir', 'rtl');
    panel.style.cssText =
      'position:fixed;inset:0;z-index:120000;background:rgba(7,11,20,0.94);color:#F5F0E4;overflow:auto;padding:16px;font-family:Tahoma,sans-serif;font-size:14px;display:block;';
    panel.innerHTML =
      '<div style="max-width:480px;margin:0 auto">' +
      '<h2 style="color:#F0D878;margin:0 0 8px;font-size:1.1rem">تست و عیب‌یابی داخلی</h2>' +
      '<p style="opacity:0.85;font-size:0.8rem;line-height:1.6;margin:0 0 12px">فقط مدیر · فقط‌خواندنی · بدون داده خصوصی کاربران</p>' +
      '<div id="kafeQAList"></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">' +
      '<button type="button" id="kafeQARun" style="padding:10px 14px;border-radius:10px;border:none;background:linear-gradient(180deg,#e8c76b,#c9a84c);color:#1A1208;font-weight:800">اجرای مجدد</button>' +
      '<button type="button" id="kafeQACopy" style="padding:10px 14px;border-radius:10px;border:1px solid rgba(201,168,76,0.5);background:#111827;color:#F0D878;font-weight:700">کپی گزارش</button>' +
      '<button type="button" id="kafeQAClose" style="padding:10px 14px;border-radius:10px;border:1px solid #444;background:#1a1a2e;color:#ccc">بستن</button>' +
      '</div>' +
      '<p id="kafeQACopyMsg" style="font-size:0.75rem;color:#8a8;margin-top:8px"></p></div>';
    document.getElementById('kafeQARun').onclick = function () {
      runAll();
    };
    document.getElementById('kafeQAClose').onclick = function () {
      panel.style.display = 'none';
    };
    document.getElementById('kafeQACopy').onclick = function () {
      var t = buildReportText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () {
          var m = document.getElementById('kafeQACopyMsg');
          if (m) m.textContent = 'گزارش کپی شد';
        });
      } else window.prompt('کپی:', t);
    };
    return panel;
  }

  function render() {
    var list = document.getElementById('kafeQAList');
    if (!list) return;
    list.innerHTML = results
      .map(function (r) {
        return (
          '<div style="border:1px solid rgba(201,168,76,0.25);border-radius:12px;padding:10px 12px;margin-bottom:8px;background:rgba(255,255,255,0.04)">' +
          '<div style="font-weight:800">' +
          statusIcon(r.status) +
          ' ' +
          r.title +
          '</div>' +
          (r.detail
            ? '<div style="font-size:0.8rem;opacity:0.9;margin-top:4px;line-height:1.5">' + r.detail + '</div>'
            : '') +
          (r.tip
            ? '<div style="font-size:0.75rem;color:#c9a84c;margin-top:4px">راهکار: ' + r.tip + '</div>'
            : '') +
          '</div>'
        );
      })
      .join('');
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
    checkNetworkLayered().then(function () {
      return checkSupabaseReadOnly();
    }).then(function () {
      checkJsErrors();
      render();
    });
  }

  function boot() {
    verifyAdminFromServer().then(function (v) {
      if (!v || !v.ok) {
        showDenied(v && v.reason ? v.reason : 'دسترسی رد شد');
        return;
      }
      // فقط پس از تأیید نقش سرور، فلگ محلی برای راحتی مدیر معنی دارد
      try {
        if (new URLSearchParams(location.search).get('qa') === '1') {
          localStorage.setItem('kafeQA', '1');
        }
      } catch (e) {}
      ensurePanel();
      setTimeout(runAll, 400);
    });
  }

  function waitClientThenBoot(attempt) {
    attempt = attempt || 0;
    if (getClient() || attempt > 40) {
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
