/** admin-ui-four-fixes.js V5
 * خرید اشتراک: شفاف داخل قالب — نه پس‌زمینه تیره جامد
 */
(function () {
  'use strict';
  window.__KAFE_ADMIN_UI_FOUR_FIXES_V5__ = true;

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
      '  background:transparent!important;',
      '  backdrop-filter:none!important;',
      '}',
      '#subscriptionModalBox > div{',
      '  background:rgba(8,12,24,0.18)!important;',
      '  backdrop-filter:blur(10px)!important;',
      '  -webkit-backdrop-filter:blur(10px)!important;',
      '  border:none!important;border-radius:0!important;',
      '  box-shadow:none!important;',
      '}'
    ].join('\n');
  }

  function forceSubAsPage() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    var h = headerNavHeights();
    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('top', h.headerH + 8 + 'px', 'important');
    box.style.setProperty('bottom', h.navH + 8 + 'px', 'important');
    box.style.setProperty('left', '0', 'important');
    box.style.setProperty('right', '0', 'important');
    box.style.setProperty('inset', 'auto', 'important');
    box.style.setProperty('display', 'flex', 'important');
    box.style.setProperty('background', 'transparent', 'important');
    box.style.setProperty('opacity', '1', 'important');
    box.style.setProperty('visibility', 'visible', 'important');
    box.style.setProperty('z-index', '50', 'important');
    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      sheet.style.setProperty('background', 'rgba(8,12,24,0.18)', 'important');
      sheet.style.setProperty('backdrop-filter', 'blur(10px)', 'important');
      sheet.style.setProperty('opacity', '1', 'important');
      sheet.style.setProperty('border-radius', '0', 'important');
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
    if (typeof prev !== 'function' || prev.__kafeV5) return;
    window.showAdminPurchaseDetail = function () {
      var ret = prev.apply(this, arguments);
      setTimeout(elevateDetail, 0);
      setTimeout(elevateDetail, 80);
      return ret;
    };
    window.showAdminPurchaseDetail.__kafeV5 = true;
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
