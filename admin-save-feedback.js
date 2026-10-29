/* P2: بازخورد ذخیره در کنترل پنل مدیریت
   روی توابع ذخیره موجود wrap می‌کند — منطق ذخیره عوض نمی‌شود
*/
(function () {
  'use strict';

  var WRAP_NAMES = [
    'saveAdminSettings',
    'saveAndApplyAllMediaImages',
    'saveModalMetaAdmin',
    'saveDiscountSettings',
    'saveDiscount',
    'saveSubscriptionPlansFromAdmin',
    'saveMediaSettings',
    'saveAllSettings',
    'saveProductsSafe'
  ];

  function notify(msg, type) {
    try {
      if (typeof window.kafeFeedback === 'function') window.kafeFeedback(msg, type);
      else if (typeof window.showNotification === 'function') window.showNotification(msg, type === 'error' ? 'error' : undefined);
    } catch (e) {}
  }

  function wrapSave(name) {
    var orig = window[name];
    if (typeof orig !== 'function' || orig.__kafeSaveWrapped) return;
    var wrapped = async function () {
      var args = arguments;
      var self = this;
      var notified = false;
      var prevShow = window.showNotification;
      if (typeof prevShow === 'function') {
        window.showNotification = function (msg, type) {
          notified = true;
          return prevShow.apply(this, arguments);
        };
      }
      notify('⏳ در حال ذخیره…', 'wait');
      try {
        var result = await Promise.resolve(orig.apply(self, args));
        if (!notified) notify('✅ تغییرات ذخیره شد', 'ok');
        return result;
      } catch (e) {
        notify('❌ ذخیره نشد: ' + ((e && e.message) || e || 'خطا'), 'error');
        throw e;
      } finally {
        if (typeof prevShow === 'function') window.showNotification = prevShow;
      }
    };
    wrapped.__kafeSaveWrapped = true;
    window[name] = wrapped;
  }

  function tryWrapAll() {
    WRAP_NAMES.forEach(wrapSave);
  }

  tryWrapAll();
  setTimeout(tryWrapAll, 800);
  setTimeout(tryWrapAll, 2500);

  /* کلیک روی دکمه‌هایی که متن ذخیره/اعمال دارند */
  document.addEventListener(
    'click',
    function (ev) {
      var btn = ev.target && ev.target.closest && ev.target.closest('button, .btn');
      if (!btn) return;
      var t = (btn.textContent || '') + ' ' + (btn.getAttribute('onclick') || '');
      if (!/ذخیره|اعمال تغییرات|save|Save|اعمال|ثبت تنظیم/.test(t)) return;
      if (btn.dataset.kafeBusy === '1') return;
      btn.dataset.kafeBusy = '1';
      btn.classList.add('kafe-busy');
      notify('⏳ در حال ذخیره…', 'wait');
      setTimeout(function () {
        try {
          btn.dataset.kafeBusy = '0';
          btn.classList.remove('kafe-busy');
        } catch (e) {}
      }, 1200);
    },
    true
  );
})();
