/** buy-nav-fix.js V12
 * فقط پشتیبان صفحه خرید — بدون bind کلیک و بدون wrap
 * مالک دکمه خرید: final-nav-fix V6
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V12__) return;
  window.__KAFE_BUY_NAV_FIX_V12__ = true;

  try {
    if (typeof window.openSubscriptionPurchase === 'function' && !window.__kafeOpenSubscriptionCore) {
      if (!window.openSubscriptionPurchase.__kafeBuyPageWrapV11 && !window.openSubscriptionPurchase.__kafeBuyPageWrapV12) {
        window.__kafeOpenSubscriptionCore = window.openSubscriptionPurchase;
      }
    }
  } catch (e) {}

  function ensureBuyPage() {
    var container = document.getElementById('pagesContainer');
    if (!container) return;
    if (document.getElementById('pageBuy')) return;
    var page = document.createElement('div');
    page.className = 'page-swipe';
    page.id = 'pageBuy';
    page.innerHTML = '<div class="page-header" style="text-align:center;margin-bottom:12px;"><h2 style="color:#F0D878;font-size:1.1rem;font-weight:800;margin:0;">⭐ خرید اشتراک</h2></div><div id="kafeBuyFormHost"></div>';
    var shop = document.getElementById('pageShop');
    if (shop && shop.parentNode === container) container.insertBefore(page, shop.nextSibling);
    else container.appendChild(page);
  }

  function boot() {
    ensureBuyPage();
    try {
      if (typeof window.openSubscriptionPurchase === 'function' && !window.__kafeOpenSubscriptionCore) {
        if (!window.openSubscriptionPurchase.__kafeBuyPageWrapV11) {
          window.__kafeOpenSubscriptionCore = window.openSubscriptionPurchase;
        }
      }
    } catch (e2) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () {
    setTimeout(boot, 0);
    setTimeout(boot, 500);
  });
  else {
    setTimeout(boot, 0);
    setTimeout(boot, 500);
  }
})();
