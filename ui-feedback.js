/* لایه بازخورد سراسری دکمه‌ها
   حالت‌ها: در حال انجام | موفق | خطا | آفلاین
   بدون تغییر منطق سرور — فقط UI
*/
(function () {
  'use strict';

  var BUSY_MS = 900;
  var TOAST_ID = 'kafeFeedbackToast';

  function ensureToastStyles() {
    if (document.getElementById('kafeFeedbackToastStyle')) return;
    var s = document.createElement('style');
    s.id = 'kafeFeedbackToastStyle';
    s.textContent = [
      '#' + TOAST_ID + '{position:fixed;left:50%;bottom:88px;transform:translateX(-50%) translateY(12px);',
      'z-index:100000;max-width:92vw;min-width:200px;padding:12px 16px;border-radius:12px;',
      'font-family:inherit;font-size:0.88rem;font-weight:700;line-height:1.55;text-align:center;',
      'opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;box-shadow:0 8px 28px rgba(0,0,0,.35);}',
      '#' + TOAST_ID + '.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto;}',
      '#' + TOAST_ID + '.ok{background:linear-gradient(135deg,#1a3d2e,#2d6a4f);color:#e8fff3;border:1px solid rgba(100,200,150,.45);}',
      '#' + TOAST_ID + '.error{background:linear-gradient(135deg,#5c1a1a,#8b2e2e);color:#ffe8e8;border:1px solid rgba(255,120,120,.4);}',
      '#' + TOAST_ID + '.info{background:linear-gradient(135deg,#1a2740,#2c3e6b);color:#e8f0ff;border:1px solid rgba(120,160,255,.35);}',
      '#' + TOAST_ID + '.wait{background:linear-gradient(135deg,#3d3010,#6b5210);color:#fff8e0;border:1px solid rgba(240,200,100,.4);}',
      'button.kafe-busy, .btn.kafe-busy{opacity:.72 !important;pointer-events:none !important;}'
    ].join('');
    document.head.appendChild(s);
  }

  function toast(msg, type) {
    ensureToastStyles();
    var el = document.getElementById(TOAST_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = TOAST_ID;
      document.body.appendChild(el);
    }
    el.className = 'show ' + (type || 'info');
    el.textContent = String(msg || '');
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove('show');
    }, type === 'wait' ? 1600 : 3200);
  }

  window.kafeFeedback = function (msg, type) {
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification(msg, type === 'ok' ? undefined : type === 'error' ? 'error' : undefined);
      }
    } catch (e) {}
    toast(msg, type || 'info');
  };

  window.kafeRunAction = async function (btn, asyncFn, opts) {
    opts = opts || {};
    if (!navigator.onLine && opts.requireOnline !== false) {
      window.kafeFeedback('اتصال اینترنت نیست. بعداً دوباره تلاش کنید.', 'error');
      return null;
    }
    if (btn && btn.dataset && btn.dataset.kafeBusy === '1') {
      window.kafeFeedback('لطفاً صبر کنید…', 'wait');
      return null;
    }
    var prevText = btn ? btn.textContent : '';
    try {
      if (btn) {
        btn.dataset.kafeBusy = '1';
        btn.classList.add('kafe-busy');
        btn.disabled = true;
        if (opts.loadingText) btn.textContent = opts.loadingText;
      }
      if (opts.waitMsg !== false) {
        window.kafeFeedback(opts.waitMsg || 'در حال انجام…', 'wait');
      }
      var result = await asyncFn();
      if (opts.successMsg) window.kafeFeedback(opts.successMsg, 'ok');
      return result;
    } catch (e) {
      var m = (e && e.message) ? e.message : String(e || 'خطای ناشناخته');
      if (/Failed to fetch|NetworkError|network|offline|Load failed/i.test(m)) {
        m = 'مشکل اتصال به سرور. اینترنت را بررسی کنید.';
      }
      window.kafeFeedback(opts.errorMsg || m, 'error');
      return null;
    } finally {
      if (btn) {
        btn.dataset.kafeBusy = '0';
        btn.classList.remove('kafe-busy');
        btn.disabled = false;
        if (opts.loadingText) btn.textContent = prevText;
      }
    }
  };

  function isActionButton(btn) {
    if (!btn || btn.disabled) return false;
    if (btn.closest && btn.closest('[data-kafe-no-feedback]')) return false;
    var tag = (btn.tagName || '').toLowerCase();
    if (tag !== 'button' && !btn.classList.contains('btn') && btn.getAttribute('role') !== 'button') return false;
    if (btn.type === 'button' || btn.type === 'submit' || tag === 'button' || btn.classList.contains('btn')) return true;
    return false;
  }

  function looksNetworkSensitive(btn) {
    var t = ((btn.textContent || '') + ' ' + (btn.getAttribute('onclick') || '')).toLowerCase();
    return /ثبت|ذخیره|ارسال|خرید|تأیید|تایید|ورود|پرداخت|آپلود|حذف|فعال|پاسخ|login|save|submit|send|pay|delete|upload/.test(t);
  }

  document.addEventListener(
    'click',
    function (ev) {
      var btn = ev.target && ev.target.closest && ev.target.closest('button, .btn, [role="button"]');
      if (!isActionButton(btn)) return;

      if (!navigator.onLine && looksNetworkSensitive(btn)) {
        window.kafeFeedback('اتصال اینترنت نیست. این عملیات نیاز به شبکه دارد.', 'error');
      }

      if (btn.dataset.kafeBusy === '1') {
        ev.preventDefault();
        ev.stopPropagation();
        window.kafeFeedback('لطفاً صبر کنید… درخواست قبلی هنوز تمام نشده.', 'wait');
        return;
      }

      if (looksNetworkSensitive(btn)) {
        btn.dataset.kafeBusy = '1';
        btn.classList.add('kafe-busy');
        setTimeout(function () {
          try {
            btn.dataset.kafeBusy = '0';
            btn.classList.remove('kafe-busy');
          } catch (e) {}
        }, BUSY_MS);
      }
    },
    true
  );

  window.addEventListener('offline', function () {
    window.kafeFeedback('اتصال قطع شد. بعضی کارها ممکن است انجام نشوند.', 'error');
  });
  window.addEventListener('online', function () {
    window.kafeFeedback('اتصال برقرار شد.', 'ok');
  });

  var _origShow = window.showNotification;
  if (typeof _origShow === 'function') {
    window.showNotification = function (msg, type) {
      try {
        _origShow.apply(this, arguments);
      } catch (e) {}
      var t = type === 'error' ? 'error' : type === 'success' || type === 'ok' ? 'ok' : 'info';
      toast(msg, t);
    };
  } else {
    window.showNotification = function (msg, type) {
      toast(msg, type === 'error' ? 'error' : 'info');
    };
  }
})();
