/** admin-ui-four-fixes.js V7 — فقط جزئیات ادمین، بدون خرید */
(function () {
  'use strict';
  if (window.__KAFE_ADMIN_UI_FOUR_FIXES_V7__) return;
  window.__KAFE_ADMIN_UI_FOUR_FIXES_V7__ = true;

  function elevateDetail() {
    var el = document.getElementById('kafeAdminPurchaseDetail');
    if (!el) return;
    el.style.zIndex = '100150';
    el.style.pointerEvents = 'auto';
    el.style.display = 'flex';
  }

  var prev = window.showAdminPurchaseDetail;
  if (typeof prev === 'function' && !prev.__kafeV7) {
    window.showAdminPurchaseDetail = function () {
      var ret = prev.apply(this, arguments);
      setTimeout(elevateDetail, 0);
      return ret;
    };
    window.showAdminPurchaseDetail.__kafeV7 = true;
  }

  window.kafeHtmlJsArg = function (value) {
    return (
      "'" +
      String(value == null ? '' : value)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'") +
      "'"
    );
  };
})();
