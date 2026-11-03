/** buy-nav-fix.js V6 SAFE
 * فقط دکمه خرید → openSubscriptionPurchase
 * بدون observer، بدون remove patch، بدون interval
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V6__) return;
  window.__KAFE_BUY_NAV_FIX_V6__ = true;

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

  function bind() {
    var buyBtn = findBuyButton();
    if (!buyBtn || buyBtn.__kafeBuySafe) return;
    buyBtn.__kafeBuySafe = true;
    buyBtn.setAttribute('onclick', 'void(0)');
    buyBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (typeof window.openSubscriptionPurchase === 'function') {
        try {
          window.openSubscriptionPurchase();
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(bind, 100);
    });
  } else {
    setTimeout(bind, 100);
  }
  window.addEventListener('load', function () {
    setTimeout(bind, 300);
  });
})();
