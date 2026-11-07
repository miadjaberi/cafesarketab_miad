/**
 * qa-harness.js — تست و عیب‌یابی داخلی کافه سرکتاب میعاد (فقط‌خواندنی)
 * فعال‌سازی: ?qa=1 یا localStorage kafeQA=1
 * بدون OTP، بدون ساخت حساب، بدون سفارش، بدون نوشتن Supabase.
 */
(function () {
  'use strict';
  if (window.__KAFE_QA_HARNESS__) return;
  window.__KAFE_QA_HARNESS__ = true;

  function qaEnabled() {
    try {
      if (/[?&]qa=1(?:&|$)/.test(location.search)) return true;
      if (localStorage.getItem('kafeQA') === '1') return true;
    } catch (e) {}
    return false;
  }
  if (!qaEnabled()) return;

  var results = [];
  var jsErrors = [];
  var startedAt = new Date().toISOString();

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

  function hasClickHandler(el) {
    if (!el) return false;
    if (el.getAttribute && el.getAttribute('onclick')) return true;
    try {
      if (typeof getEventListeners === 'function') {
        var ls = getEventListeners(el);
        if (ls && ls.click && ls.click.length) return true;
      }
    } catch (e) {}
    return !!(el.onclick);
  }

  function checkLoad() {
    var app = document.getElementById('app');
    var terms = document.getElementById('termsScreen');
    var reg = document.getElementById('registerScreen');
    var bodyOk = !!document.body;
    if (!bodyOk) {
      add('red', 'بارگذاری برنامه', 'document.body نیست', 'HTML را بررسی کنید');
      return;
    }
    var visible =
      (app && (app.style.display === 'block' || app.classList.contains('active'))) ||
      (terms && terms.style.display !== 'none') ||
      (reg && (reg.style.display === 'flex' || reg.classList.contains('active')));
    add(
      visible || app || terms || reg ? 'green' : 'yellow',
      'بارگذاری برنامه',
      'app=' + !!app + ' terms=' + !!terms + ' register=' + !!reg,
      visible ? '' : 'ممکن است هنوز اسپلش/شرایط باشد — چند ثانیه بعد دوباره اجرا کنید'
    );
  }

  function checkBottomNav() {
    var nav = document.getElementById('bottomNav');
    if (!nav) {
      add('red', 'نوار پایین', 'عنصر #bottomNav پیدا نشد', 'index.html و ناوبری را چک کنید');
      return;
    }
    var btns = nav.querySelectorAll('button.nav-item-bottom');
    if (!btns.length) {
      add('red', 'نوار پایین — وجود دکمه', 'هیچ button.nav-item-bottom نیست', '');
      return;
    }
    add('green', 'نوار پایین — وجود (سطح A)', btns.length + ' دکمه پیدا شد', '');
    var withHandler = 0;
    var labels = [];
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var lab = (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24);
      labels.push(lab || ('#' + i));
      if (hasClickHandler(b) || (b.getAttribute('onclick') || '').length || b.__kafeBuyV10) withHandler++;
    }
    // بسیاری از دکمه‌ها با listener در پچ‌ها وصل می‌شوند نه onclick — زرد اگر صفر
    if (withHandler > 0) {
      add('green', 'نوار پایین — رویداد (سطح B تقریبی)', withHandler + '/' + btns.length + ' نشانه رویداد', labels.join(' | '));
    } else {
      add(
        'yellow',
        'نوار پایین — رویداد (سطح B)',
        'onclick مستقیم دیده نشد؛ ممکن است listener پچ باشد',
        'روی گوشی دستی یک دکمه را لمس کنید'
      );
    }
    add(
      'yellow',
      'نوار پایین — موفقیت واقعی (سطح C)',
      'عمداً آزمایش نشد (خرید/سفارش واقعی ممنوع)',
      'طبق خط قرمز QA'
    );
  }

  function checkAuthForms() {
    var reg = document.getElementById('registerScreen');
    var name = document.getElementById('regName') || document.querySelector('#registerScreen input[type="text"]');
    var phone = document.getElementById('regPhone') || document.querySelector('#registerScreen input[type="tel"]');
    var pin = document.getElementById('regPin') || document.querySelector('#registerScreen input[type="password"]');
    var btn =
      document.querySelector('#registerScreen button[onclick*="registerUser"]') ||
      document.querySelector('#registerScreen button.btn');
    if (!reg && !name && !phone) {
      add('yellow', 'فرم ثبت‌نام', 'الان روی صفحه ثبت‌نام نیستید یا فرم مخفی است', 'با داده پاک‌شده مسیر ثبت‌نام را باز کنید');
      return;
    }
    add('green', 'فرم ثبت‌نام — وجود فیلد (A)', 'name=' + !!name + ' phone=' + !!phone + ' pin=' + !!pin + ' btn=' + !!btn, '');
    add(
      'yellow',
      'فرم ثبت‌نام — موفقیت واقعی (C)',
      'ساخت حساب آزمایشی انجام نمی‌شود',
      'خط قرمز QA'
    );
  }

  function checkNetwork() {
    var on = true;
    try {
      on = navigator.onLine !== false;
    } catch (e) {}
    add(on ? 'green' : 'red', 'شبکه (navigator.onLine)', on ? 'آنلاین گزارش شد' : 'آفلاین',
      on ? '' : 'حالت هواپیما یا قطع نت');
  }

  function checkSupabase() {
    return new Promise(function (resolve) {
      var c = window.supabaseClient || window.v12Supabase || null;
      if (!c) {
        add('red', 'Supabase — وجود کلاینت', 'window.supabaseClient نیست', 'main.js و لود CDN را چک کنید');
        resolve();
        return;
      }
      add('green', 'Supabase — وجود کلاینت', 'کلاینت در حافظه موجود است (کلید در گزارش نیست)', '');
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        resolve();
      }
      setTimeout(function () {
        if (!done) {
          add('yellow', 'Supabase — نشست', 'پاسخ getSession در ۳ث نیامد', 'نت ضعیف یا مسدود');
          finish();
        }
      }, 3000);
      try {
        c.auth
          .getSession()
          .then(function (sr) {
            var ses = sr && sr.data && sr.data.session;
            add(
              'green',
              'Supabase — getSession',
              ses && ses.user ? 'نشست کاربر موجود (بدون نمایش شناسه)' : 'بدون نشست — مهمان/خارج',
              ''
            );
            // فقط‌خواندنی عمومی
            return c.from('products').select('id').limit(1);
          })
          .then(function (r) {
            if (!r) return;
            if (r.error) {
              add('yellow', 'Supabase — خواندن products', String(r.error.message || r.error).slice(0, 120), 'RLS یا جدول');
            } else {
              add('green', 'Supabase — خواندن products', 'select فقط‌خواندنی موفق', '');
            }
            finish();
          })
          .catch(function (e) {
            add('red', 'Supabase — خطا', String((e && e.message) || e).slice(0, 120), '');
            finish();
          });
      } catch (e2) {
        add('red', 'Supabase — استثنا', String(e2.message || e2).slice(0, 120), '');
        finish();
      }
    });
  }

  function checkJsErrors() {
    if (!jsErrors.length) {
      add('green', 'خطاهای JavaScript (تا این لحظه)', 'خطای گرفته‌شده‌ای ثبت نشد', 'بعد از کار با اپ دوباره «اجرای مجدد»');
    } else {
      jsErrors.slice(0, 8).forEach(function (err, i) {
        add(
          'red',
          'خطای JS #' + (i + 1),
          err.msg + (err.file ? ' @ ' + err.file + ':' + err.line : ''),
          'فایل و خط را در کد بررسی کنید'
        );
      });
    }
  }

  function checkPatches() {
    var keys = [
      ['boot-flow', 'boot-flow-fix'],
      ['buy-nav', 'buy-nav-fix'],
      ['final-nav', 'final-nav-fix'],
      ['msg-session', 'admin-messages-session']
    ];
    var found = 0;
    keys.forEach(function (pair) {
      if (document.querySelector('script[data-kafe-patch="' + pair[0] + '"]')) found++;
    });
    add(
      found >= 2 ? 'green' : 'yellow',
      'پچ‌های تزریق‌شده',
      found + ' از نشانه‌های پچ در DOM',
      found < 2 ? 'ui-layer-fix ممکن است دیر لود شده باشد' : ''
    );
  }

  function statusIcon(s) {
    if (s === 'green') return '🟢';
    if (s === 'red') return '🔴';
    return '🟡';
  }

  function buildReportText() {
    var lines = [
      'گزارش QA کافه سرکتاب میعاد',
      'شروع: ' + startedAt,
      'پایان: ' + new Date().toISOString(),
      'URL: ' + String(location.href).split('#')[0],
      ''
    ];
    results.forEach(function (r) {
      lines.push(statusIcon(r.status) + ' ' + r.title);
      if (r.detail) lines.push('   ' + r.detail);
      if (r.tip) lines.push('   راهکار: ' + r.tip);
      lines.push('');
    });
    return lines.join('\n');
  }

  function ensurePanel() {
    var id = 'kafeQAPanel';
    var panel = document.getElementById(id);
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = id;
    panel.setAttribute('dir', 'rtl');
    panel.style.cssText =
      'position:fixed;inset:0;z-index:120000;background:rgba(7,11,20,0.94);color:#F5F0E4;overflow:auto;padding:16px;font-family:Tahoma,sans-serif;font-size:14px;';
    panel.innerHTML =
      '<div style="max-width:480px;margin:0 auto;">' +
      '<h2 style="color:#F0D878;margin:0 0 8px;font-size:1.1rem;">تست و عیب‌یابی داخلی</h2>' +
      '<p style="opacity:0.85;font-size:0.8rem;line-height:1.6;margin:0 0 12px;">فقط‌خواندنی · بدون سفارش/OTP/ساخت حساب</p>' +
      '<div id="kafeQAList"></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">' +
      '<button type="button" id="kafeQARun" style="padding:10px 14px;border-radius:10px;border:none;background:linear-gradient(180deg,#e8c76b,#c9a84c);color:#1A1208;font-weight:800;">اجرای مجدد</button>' +
      '<button type="button" id="kafeQACopy" style="padding:10px 14px;border-radius:10px;border:1px solid rgba(201,168,76,0.5);background:#111827;color:#F0D878;font-weight:700;">کپی گزارش</button>' +
      '<button type="button" id="kafeQAClose" style="padding:10px 14px;border-radius:10px;border:1px solid #444;background:#1a1a2e;color:#ccc;">بستن</button>' +
      '</div>' +
      '<p id="kafeQACopyMsg" style="font-size:0.75rem;color:#8a8;margin-top:8px;"></p>' +
      '</div>';
    document.body.appendChild(panel);
    document.getElementById('kafeQARun').onclick = function () {
      runAll();
    };
    document.getElementById('kafeQAClose').onclick = function () {
      panel.style.display = 'none';
    };
    document.getElementById('kafeQACopy').onclick = function () {
      var t = buildReportText();
      function ok() {
        var m = document.getElementById('kafeQACopyMsg');
        if (m) m.textContent = 'گزارش کپی شد — برای مهندس بفرستید';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(ok).catch(function () {
          window.prompt('کپی کنید:', t);
        });
      } else {
        window.prompt('کپی کنید:', t);
      }
    };
    return panel;
  }

  function render() {
    var list = document.getElementById('kafeQAList');
    if (!list) return;
    list.innerHTML = results
      .map(function (r) {
        return (
          '<div style="border:1px solid rgba(201,168,76,0.25);border-radius:12px;padding:10px 12px;margin-bottom:8px;background:rgba(255,255,255,0.04);">' +
          '<div style="font-weight:800;">' +
          statusIcon(r.status) +
          ' ' +
          r.title +
          '</div>' +
          (r.detail
            ? '<div style="font-size:0.8rem;opacity:0.9;margin-top:4px;line-height:1.5;">' + r.detail + '</div>'
            : '') +
          (r.tip
            ? '<div style="font-size:0.75rem;color:#c9a84c;margin-top:4px;">راهکار: ' + r.tip + '</div>'
            : '') +
          '</div>'
        );
      })
      .join('');
  }

  function runAll() {
    results = [];
    ensurePanel();
    document.getElementById('kafeQAPanel').style.display = 'block';
    checkLoad();
    checkPatches();
    checkBottomNav();
    checkAuthForms();
    checkNetwork();
    checkJsErrors();
    render();
    checkSupabase().then(function () {
      checkJsErrors();
      render();
    });
  }

  function boot() {
    ensurePanel();
    setTimeout(runAll, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 400);
    });
  } else {
    setTimeout(boot, 400);
  }
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (results.length < 3) runAll();
    }, 2000);
  });
})();
