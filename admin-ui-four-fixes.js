/** admin-ui-four-fixes.js V4
 * بدون cssText='' روی subscriptionModalBox (علت پریدن فرم)
 */
(function () {
  'use strict';
  window.__KAFE_ADMIN_UI_FOUR_FIXES_V4__ = true;

  function notify(msg, type) {
    if (typeof window.kafeNotify === 'function') {
      window.kafeNotify(msg, type);
      return;
    }
    try {
      if (typeof showNotification === 'function') showNotification(String(msg), type || '');
    } catch (e) {}
  }

  function headerNavHeights() {
    var headerH = 152,
      navH = 68;
    try {
      var hdr =
        document.querySelector('#appHeader') ||
        document.querySelector('header.app-header') ||
        document.querySelector('header');
      if (hdr) headerH = Math.round(hdr.getBoundingClientRect().height) || headerH;
      var nav = document.getElementById('bottomNav');
      if (nav) navH = Math.round(nav.getBoundingClientRect().height) || navH;
    } catch (e) {}
    return { headerH: headerH, navH: navH };
  }

  function injectCSS() {
    var id = 'kafe-admin-ui-four-fixes-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '#kafeAdminPurchaseDetail{z-index:100150!important;pointer-events:auto!important;}',
      '#subscriptionModalBox{',
      '  position:fixed!important;left:0!important;right:0!important;',
      '  inset:auto!important;width:100%!important;z-index:120!important;',
      '  display:flex!important;flex-direction:column!important;',
      '  background:#0b1120!important;opacity:1!important;visibility:visible!important;',
      '  border-radius:0!important;backdrop-filter:none!important;',
      '}',
      '#subscriptionModalBox > div{',
      '  width:100%!important;max-width:none!important;height:100%!important;',
      '  max-height:none!important;margin:0!important;border-radius:0!important;',
      '  background:#0b1120!important;opacity:1!important;overflow-y:auto!important;',
      '}'
    ].join('\n');
  }

  function forceSubAsPage() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    // مهم: دیگر cssText='' نمی‌کنیم
    var h = headerNavHeights();
    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('top', h.headerH + 'px', 'important');
    box.style.setProperty('bottom', h.navH + 'px', 'important');
    box.style.setProperty('left', '0', 'important');
    box.style.setProperty('right', '0', 'important');
    box.style.setProperty('inset', 'auto', 'important');
    box.style.setProperty('display', 'flex', 'important');
    box.style.setProperty('opacity', '1', 'important');
    box.style.setProperty('visibility', 'visible', 'important');
    box.style.setProperty('background', '#0b1120', 'important');
    box.style.setProperty('z-index', '9200', 'important');
    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      sheet.style.setProperty('background', '#0b1120', 'important');
      sheet.style.setProperty('opacity', '1', 'important');
    }
  }

  function elevateDetail() {
    var el = document.getElementById('kafeAdminPurchaseDetail');
    if (!el) return;
    el.style.setProperty('z-index', '100150', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('display', 'flex', 'important');
  }

  function patchDetail() {
    var prev = window.showAdminPurchaseDetail;
    if (typeof prev !== 'function' || prev.__kafeV4) return;
    window.showAdminPurchaseDetail = function () {
      var ret = prev.apply(this, arguments);
      setTimeout(elevateDetail, 0);
      setTimeout(elevateDetail, 80);
      return ret;
    };
    window.showAdminPurchaseDetail.__kafeV4 = true;
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
    injectCSS();
    forceSubAsPage();
    elevateDetail();
    patchDetail();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 500);
    });
  } else {
    run();
    setTimeout(run, 500);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 300);
  });
})();
