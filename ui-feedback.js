/* بازخورد یکپارچه کافه میعاد — تنها یک اعلان قابل مشاهده */
(function () {
  'use strict';
  var ID = 'notification';
  function styles() {
    if (document.getElementById('kafeUnifiedNoticeStyle')) return;
    var s = document.createElement('style');
    s.id = 'kafeUnifiedNoticeStyle';
    s.textContent =
      '#notification.kafe-notice{position:fixed!important;left:50%!important;right:auto!important;top:calc(env(safe-area-inset-top,0px) + 14px)!important;bottom:auto!important;transform:translateX(-50%)!important;z-index:2147483000!important;display:none;max-width:92vw!important;min-width:210px!important;width:max-content!important;padding:12px 16px!important;border-radius:13px!important;font-family:Vazirmatn,Tahoma,sans-serif!important;font-size:.88rem!important;font-weight:800!important;line-height:1.6!important;text-align:center!important;box-shadow:0 8px 28px rgba(0,0,0,.38)!important;pointer-events:none!important;opacity:0;transition:opacity .16s ease!important;}' +
      '#notification.kafe-notice.show{display:block!important;opacity:1!important;}' +
      '#notification.kafe-notice.success{background:linear-gradient(135deg,#14532d,#15803d)!important;color:#f0fdf4!important;border:1px solid #86efac!important;}' +
      '#notification.kafe-notice.warning{background:linear-gradient(135deg,#713f12,#a16207)!important;color:#fffbeb!important;border:1px solid #fde68a!important;}' +
      '#notification.kafe-notice.error{background:linear-gradient(135deg,#7f1d1d,#b91c1c)!important;color:#fff1f2!important;border:1px solid #fda4af!important;}';
    document.head.appendChild(s);
  }
  function kindOf(msg, type) {
    if (type === 'error' || /❌|خطا|ناموفق|دسترسی ندارید|ثبت نشد/.test(msg)) return 'error';
    if (type === 'warning' || type === 'wait' || type === 'info' ||
        /در حال|لطفاً|صبر کنید|در انتظار|اتصال قطع|اینترنت نیست|هشدار/.test(msg)) return 'warning';
    return 'success';
  }
  function getElement() {
    var n = document.getElementById(ID);
    if (!n) { n = document.createElement('div'); n.id = ID; (document.body || document.documentElement).appendChild(n); }
    return n;
  }
  window.showNotification = function showNotification(msg, type) {
    var text = String(msg == null ? '' : msg);
    if (!text) return;
    styles();
    var n = getElement();
    clearTimeout(n._timeout);
    n.textContent = text;
    n.className = 'kafe-notice show ' + kindOf(text, type);
    window.__kafeNotificationSeq = (Number(window.__kafeNotificationSeq) || 0) + 1;
    n._timeout = setTimeout(function () {
      n.classList.remove('show');
      n.style.display = 'none';
    }, type === 'wait' ? 5500 : 3400);
  };
  window.kafeFeedback = function (msg, type) { window.showNotification(msg, type); };
  window.kafeRunAction = async function (btn, asyncFn, opts) {
    opts = opts || {};
    if (!navigator.onLine && opts.requireOnline !== false) {
      window.kafeFeedback('اتصال اینترنت نیست. بعداً دوباره تلاش کنید.', 'warning');
      return null;
    }
    if (btn && btn.dataset && btn.dataset.kafeBusy === '1') {
      window.kafeFeedback('لطفاً صبر کنید…', 'wait');
      return null;
    }
    var prevText = btn ? btn.textContent : '';
    try {
      if (btn) { btn.dataset.kafeBusy = '1'; btn.classList.add('kafe-busy'); if (opts.loadingText) btn.textContent = opts.loadingText; }
      if (opts.waitMsg !== false) window.kafeFeedback(opts.waitMsg || 'در حال انجام…', 'wait');
      var result = await asyncFn();
      if (opts.successMsg) window.kafeFeedback(opts.successMsg, 'success');
      return result;
    } catch (e) {
      var m = (e && e.message) ? e.message : String(e || 'خطای ناشناخته');
      if (/Failed to fetch|NetworkError|network|offline|Load failed/i.test(m)) m = 'مشکل اتصال به سرور. اینترنت را بررسی کنید.';
      window.kafeFeedback(opts.errorMsg || m, 'error');
      return null;
    } finally {
      if (btn) { btn.dataset.kafeBusy = '0'; btn.classList.remove('kafe-busy'); if (opts.loadingText) btn.textContent = prevText; }
    }
  };
  window.addEventListener('offline', function () { window.kafeFeedback('اتصال قطع شد. بعضی کارها ممکن است انجام نشوند.', 'warning'); });
  window.addEventListener('online', function () { window.kafeFeedback('اتصال برقرار شد.', 'success'); });
})();
