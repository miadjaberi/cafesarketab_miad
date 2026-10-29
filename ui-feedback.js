/* لایه بازخورد — نسخه سبک
   پیام موفق/خطا هرگز قورت داده نمی‌شود.
   اعلان اصلی (#notification) بالای پنل مدیریت دیده می‌شود. */
(function () {
  'use strict';

  var TOAST_ID = 'kafeFeedbackToast';
  var lastToastAt = 0;
  var lastKey = '';

  function ensureToastStyles() {
    if (document.getElementById('kafeFeedbackToastStyle')) return;
    var s = document.createElement('style');
    s.id = 'kafeFeedbackToastStyle';
    s.textContent = [
      '#' + TOAST_ID + '{position:fixed;left:50%;bottom:88px;transform:translateX(-50%) translateY(12px);',
      'z-index:100020;max-width:92vw;min-width:200px;padding:12px 16px;border-radius:12px;',
      'font-family:Vazirmatn,Tahoma,sans-serif;font-size:0.88rem;font-weight:700;line-height:1.55;text-align:center;',
      'opacity:0;pointer-events:none;transition:opacity .18s,transform .18s;box-shadow:0 8px 28px rgba(0,0,0,.35);}',
      '#' + TOAST_ID + '.show{opacity:1;transform:translateX(-50%) translateY(0);}',
      '#' + TOAST_ID + '.ok{background:linear-gradient(135deg,#1a3d2e,#2d6a4f);color:#e8fff3;border:1px solid rgba(100,200,150,.45);}',
      '#' + TOAST_ID + '.error{background:linear-gradient(135deg,#5c1a1a,#8b2e2e);color:#ffe8e8;border:1px solid rgba(255,120,120,.4);}',
      '#' + TOAST_ID + '.info{background:linear-gradient(135deg,#1a2740,#2c3e6b);color:#e8f0ff;border:1px solid rgba(120,160,255,.35);}',
      '#' + TOAST_ID + '.wait{background:linear-gradient(135deg,#3d3010,#6b5210);color:#fff8e0;border:1px solid rgba(240,200,100,.4);}',
      'button.kafe-busy,.btn.kafe-busy{opacity:.72!important;}',
      '#notification{z-index:100010!important;color:#1A1208!important;background:linear-gradient(135deg,#fff6d8,#f0d878)!important;}',
      '#notification.error{color:#fff!important;background:linear-gradient(135deg,#7f1d1d,#b91c1c)!important;}'
    ].join('');
    document.head.appendChild(s);
  }

  function toast(msg, type) {
    var text = String(msg || '');
    if (!text) return;
    var now = Date.now();
    var key = (type || 'info') + '|' + text;
    if (key === lastKey && now - lastToastAt < 600) return;
    lastKey = key;
    lastToastAt = now;
    ensureToastStyles();
    var el = document.getElementById(TOAST_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = TOAST_ID;
      (document.body || document.documentElement).appendChild(el);
    }
    el.className = 'show ' + (type || 'info');
    el.textContent = text;
    clearTimeout(el._t);
    var life = type === 'wait' ? 6000 : 3200;
    el._t = setTimeout(function () {
      el.classList.remove('show');
    }, life);
  }

  window.kafeFeedback = function (msg, type) {
    toast(msg, type || 'info');
  };

  function mirrorShowNotification() {
    var orig = window.showNotification;
    if (typeof orig !== 'function' || orig.__kafeMirrored) return;
    var wrapped = function (msg, type) {
      try { orig.apply(this, arguments); } catch (e) {}
      var t = String(msg || '');
      var kind = type === 'error' || /❌|خطا|ناموفق|نیست/.test(t)
        ? 'error'
        : (/⏳|در حال|صبر|لطفاً/.test(t) ? 'wait' : 'ok');
      toast(t, kind);
    };
    wrapped.__kafeMirrored = true;
    window.showNotification = wrapped;
  }

  mirrorShowNotification();
  setTimeout(mirrorShowNotification, 0);
  setTimeout(mirrorShowNotification, 400);
  setTimeout(mirrorShowNotification, 1500);

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
        if (opts.loadingText) btn.textContent = opts.loadingText;
      }
      if (opts.waitMsg !== false) window.kafeFeedback(opts.waitMsg || 'در حال انجام…', 'wait');
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
        if (opts.loadingText) btn.textContent = prevText;
      }
    }
  };

  window.addEventListener('offline', function () {
    window.kafeFeedback('اتصال قطع شد. بعضی کارها ممکن است انجام نشوند.', 'error');
  });
  window.addEventListener('online', function () {
    window.kafeFeedback('اتصال برقرار شد.', 'ok');
  });
})();
