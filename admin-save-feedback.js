/* بازخورد یکپارچه عملیات مدیر — بدون اعلان موازی یا دستکاری موقت showNotification */
(function () {
  'use strict';
  var WRAP_NAMES = [
    'saveAdminSettings','saveAndApplyAllMediaImages','saveModalMetaAdmin','saveDiscountSettings',
    'saveDiscount','saveSubscriptionPlansFromAdmin','saveMediaSettings','saveAllSettings',
    'saveProductsSafe','saveProductsToServer','addProduct','v18SaveProduct','addSubscription',
    'v18SendUserMessage','v18SendAdminReply','v18CloseConversation','submitSubscriptionRequest',
    'decideCloudOrder','decideCloudSubscription'
  ];
  function notify(msg, type) {
    try {
      if (typeof window.kafeFeedback === 'function') window.kafeFeedback(msg, type);
      else if (typeof window.showNotification === 'function') window.showNotification(msg, type);
    } catch (e) {}
  }
  function domOutcome() {
    var st = document.getElementById('v18MessageStatus');
    if (!st || !st.textContent) return null;
    var t = st.textContent;
    if (/❌|ناموفق|خطا|وارد کنید|باید وارد/.test(t)) return { type: 'error', msg: t };
    if (/✅|ثبت شد|بسته شد/.test(t)) return { type: 'success', msg: t };
    return null;
  }
  function wrapSave(name) {
    var orig = window[name];
    if (typeof orig !== 'function' || orig.__kafeSaveWrapped) return;
    var wrapped = async function () {
      notify('در حال انجام…', 'wait');
      var startSeq = Number(window.__kafeNotificationSeq) || 0;
      try {
        var result = await Promise.resolve(orig.apply(this, arguments));
        var dom = domOutcome();
        var hasOwnResult = (Number(window.__kafeNotificationSeq) || 0) !== startSeq;
        if (dom && dom.type === 'error' && !hasOwnResult) notify(dom.msg, 'error');
        else if (!hasOwnResult) notify(dom && dom.type === 'success' ? dom.msg : 'انجام شد', 'success');
        return result;
      } catch (e) {
        notify('انجام نشد: ' + ((e && e.message) || e || 'خطا'), 'error');
        throw e;
      }
    };
    wrapped.__kafeSaveWrapped = true;
    window[name] = wrapped;
  }
  function tryWrapAll() { WRAP_NAMES.forEach(wrapSave); }
  tryWrapAll();
  setTimeout(tryWrapAll, 600);
  setTimeout(tryWrapAll, 1800);
  setTimeout(tryWrapAll, 3500);
})();
