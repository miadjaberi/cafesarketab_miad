/** buy-nav-fix.js V5
 * دکمه خرید → فرم کامل
 * دیگر پس‌زمینه تیره (#0b1120) اعمال نمی‌کند — شفاف مثل فروشگاه
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V5__) return;
  window.__KAFE_BUY_NAV_FIX_V5__ = true;

  function findBuyButton() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return null;
    var buttons = nav.querySelectorAll('button.nav-item-bottom');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.classList.contains('center-btn')) continue;
      var oc = b.getAttribute('onclick') || '';
      var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
      if (oc.indexOf('openSubOrdersPanel') >= 0 || label.indexOf('خرید') >= 0) return b;
    }
    return null;
  }

  function bindBuyButton() {
    var buyBtn = findBuyButton();
    if (!buyBtn || buyBtn.__kafeBuyBoundV5) return;
    buyBtn.__kafeBuyBoundV5 = true;
    buyBtn.style.pointerEvents = 'auto';
    buyBtn.style.cursor = 'pointer';
    buyBtn.setAttribute('onclick', 'void(0)');
    buyBtn.addEventListener(
      'click',
      function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
        if (typeof window.openSubscriptionPurchase === 'function') {
          window.openSubscriptionPurchase();
        }
      },
      true
    );
  }

  function bindOtherNavClose() {
    var nav = document.getElementById('bottomNav');
    if (!nav || nav.__kafeBuyCloseV5) return;
    nav.__kafeBuyCloseV5 = true;
    nav.addEventListener(
      'click',
      function (ev) {
        var t =
          ev.target && ev.target.closest
            ? ev.target.closest('button.nav-item-bottom')
            : null;
        if (!t) return;
        var label = (t.textContent || '').replace(/\s+/g, ' ').trim();
        var isBuy = label.indexOf('خرید') >= 0 && !t.classList.contains('center-btn');
        if (isBuy) return;
        window.__kafeSubAllowClose = true;
        window.__kafeSubLock = false;
        var m = document.getElementById('subscriptionModalBox');
        if (m) m.remove();
      },
      true
    );
  }

  function run() {
    bindBuyButton();
    bindOtherNavClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 800);
    });
  } else {
    run();
    setTimeout(run, 800);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 400);
  });
})();
