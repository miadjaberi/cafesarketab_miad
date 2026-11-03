/** admin-ui-four-fixes.js V6 — خرید را دست نزن (purchase-hold مسئول است) */
(function () {
  'use strict';
  window.__KAFE_ADMIN_UI_FOUR_FIXES_V6__ = true;

  function elevateDetail() {
    var el = document.getElementById('kafeAdminPurchaseDetail');
    if (!el) return;
    el.style.setProperty('z-index', '100150', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('display', 'flex', 'important');
  }

  function patchDetail() {
    var prev = window.showAdminPurchaseDetail;
    if (typeof prev !== 'function' || prev.__kafeV6) return;
    window.showAdminPurchaseDetail = function () {
      var ret = prev.apply(this, arguments);
      setTimeout(elevateDetail, 0);
      setTimeout(elevateDetail, 80);
      return ret;
    };
    window.showAdminPurchaseDetail.__kafeV6 = true;
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

  function run() {
    elevateDetail();
    patchDetail();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
    });
  } else {
    run();
  }
  window.addEventListener('load', function () {
    setTimeout(run, 200);
  });
})();
