/* بازخورد دکمه‌های مهم: در حال انجام، بعد موفق یا خطا.
   دکمه OTP تلگرام و مسیر ورود مدیر wrap نمی‌شوند. */
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
    'saveProductsSafe',
    'saveProductsToServer',
    'addProduct',
    'v18SaveProduct',
    'addSubscription',
    'v18SendUserMessage',
    'v18SendAdminReply',
    'v18CloseConversation',
    'submitSubscriptionRequest',
    'decideCloudOrder',
    'decideCloudSubscription'
  ];

  function notify(msg, type) {
    try {
      if (typeof window.kafeFeedback === 'function') window.kafeFeedback(msg, type);
      else if (typeof window.showNotification === 'function') window.showNotification(msg, type === 'error' ? 'error' : undefined);
    } catch (e) {}
  }

  function domOutcome() {
    var st = document.getElementById('v18MessageStatus');
    if (!st || !st.textContent) return null;
    var t = st.textContent;
    if (/❌|ناموفق|خطا|وارد کنید|باید وارد/.test(t)) return { type: 'error', msg: t };
    if (/✅|ثبت شد|بسته شد/.test(t)) return { type: 'ok', msg: t };
    return null;
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
      notify('در حال انجام…', 'wait');
      try {
        var result = await Promise.resolve(orig.apply(self, args));
        var dom = domOutcome();
        if (dom && dom.type === 'error') notify(dom.msg, 'error');
        else if (!notified) {
          if (dom && dom.type === 'ok') notify(dom.msg, 'ok');
          else notify('انجام شد', 'ok');
        }
        return result;
      } catch (e) {
        notify('انجام نشد: ' + ((e && e.message) || e || 'خطا'), 'error');
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
  setTimeout(tryWrapAll, 600);
  setTimeout(tryWrapAll, 1800);
  setTimeout(tryWrapAll, 3500);
})();
