/** buy-nav-fix.js V10
 * یک مسیر قطعی: فرم خرید فقط داخل pageBuy.
 * مودال fixed روی body دیده نمی‌شود و فوری به host منتقل می‌شود.
 */
(function () {
  'use strict';
  if (window.__KAFE_BUY_NAV_FIX_V10__) return;
  window.__KAFE_BUY_NAV_FIX_V10__ = true;

  var BUY_PAGE_ID = 'pageBuy';
  var mounting = false;

  function injectCSS() {
    var id = 'kafe-buy-page-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      /* لایه fixed روی body = مخفی تا منتقل شود (جلوگیری از قفل کلیک) */
      'body > #subscriptionModalBox{',
      '  opacity:0!important;visibility:hidden!important;pointer-events:none!important;',
      '  z-index:-1!important;',
      '}',
      '#' + BUY_PAGE_ID + '{',
      '  box-sizing:border-box!important;',
      '  padding:12px 12px 80px!important;',
      '}',
      '#' + BUY_PAGE_ID + ' #subscriptionModalBox{',
      '  position:relative!important;',
      '  inset:auto!important;',
      '  top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;',
      '  width:100%!important;height:auto!important;min-height:60vh!important;',
      '  max-width:none!important;',
      '  display:flex!important;flex-direction:column!important;',
      '  background:transparent!important;',
      '  z-index:1!important;padding:0!important;margin:0!important;',
      '  opacity:1!important;visibility:visible!important;',
      '  pointer-events:auto!important;',
      '  border:none!important;box-shadow:none!important;',
      '}',
      '#' + BUY_PAGE_ID + ' #subscriptionModalBox > div{',
      '  width:100%!important;max-width:none!important;',
      '  height:auto!important;max-height:none!important;',
      '  margin:0!important;',
      '  background:rgba(255,255,255,0.05)!important;',
      '  backdrop-filter:blur(12px)!important;',
      '  -webkit-backdrop-filter:blur(12px)!important;',
      '  border:1px solid rgba(255,215,0,0.15)!important;',
      '  border-radius:16px!important;',
      '  box-shadow:none!important;',
      '  padding:16px 14px 24px!important;',
      '  color:#F5F0E4!important;',
      '  overflow:visible!important;',
      '}',
      '#' + BUY_PAGE_ID + ' #subscriptionModalBox .subscription-plan-btn span{',
      '  color:#1A1208!important;-webkit-text-fill-color:#1A1208!important;',
      '  font-weight:900!important;',
      '  background:rgba(255,248,220,0.95)!important;',
      '  border-radius:8px!important;padding:3px 8px!important;',
      '  display:inline-block!important;margin-top:6px!important;',
      '}'
    ].join('\n');
  }

  function ensureBuyPage() {
    var container = document.getElementById('pagesContainer');
    if (!container) return null;
    var page = document.getElementById(BUY_PAGE_ID);
    if (page) return page;
    page = document.createElement('div');
    page.className = 'page-swipe';
    page.id = BUY_PAGE_ID;
    page.innerHTML =
      '<div class="page-header" style="text-align:center;margin-bottom:12px;">' +
      '<h2 style="color:#F0D878;font-size:1.1rem;font-weight:800;margin:0;">⭐ خرید اشتراک</h2>' +
      '<p style="color:#C8C0B0;font-size:0.8rem;margin:6px 0 0;">انتخاب طرح و ارسال فیش</p>' +
      '</div>' +
      '<div id="kafeBuyFormHost"></div>';
    var shop = document.getElementById('pageShop');
    if (shop && shop.parentNode === container) {
      if (shop.nextSibling) container.insertBefore(page, shop.nextSibling);
      else container.appendChild(page);
    } else {
      container.appendChild(page);
    }
    return page;
  }

  function stripFixedStyles(box) {
    if (!box) return;
    box.style.position = 'relative';
    box.style.inset = 'auto';
    box.style.top = 'auto';
    box.style.right = 'auto';
    box.style.bottom = 'auto';
    box.style.left = 'auto';
    box.style.width = '100%';
    box.style.height = 'auto';
    box.style.minHeight = '60vh';
    box.style.background = 'transparent';
    box.style.display = 'flex';
    box.style.flexDirection = 'column';
    box.style.zIndex = '1';
    box.style.padding = '0';
    box.style.margin = '0';
    box.style.opacity = '1';
    box.style.visibility = 'visible';
    box.style.pointerEvents = 'auto';
    box.style.border = 'none';
    box.style.boxShadow = 'none';
  }

  function mountFormIntoPage() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return false;
    var page = ensureBuyPage();
    if (!page) return false;
    var host = document.getElementById('kafeBuyFormHost') || page;
    if (box.parentNode !== host) {
      host.appendChild(box);
    }
    stripFixedStyles(box);
    return true;
  }

  window.mountBuyFormIntoPage = mountFormIntoPage;

  function scrollToBuy() {
    if (typeof window.scrollToPage === 'function') {
      try {
        window.scrollToPage('pageBuy');
      } catch (e) {}
    }
  }

  function openBuy() {
    if (mounting) return;
    mounting = true;
    injectCSS();
    ensureBuyPage();
    scrollToBuy();

    function finish() {
      mountFormIntoPage();
      scrollToBuy();
      mounting = false;
    }

    var opener = window.__kafeOpenSubscriptionCore || window.openSubscriptionPurchase;
    if (typeof opener === 'function') {
      try {
        var ret = opener();
        if (ret && typeof ret.then === 'function') {
          ret.then(finish).catch(finish);
        } else {
          finish();
        }
      } catch (e) {
        finish();
      }
    } else {
      finish();
    }
    //兜兜: اگر DOM با تأخیر ساخته شد
    setTimeout(function () {
      mountFormIntoPage();
      mounting = false;
    }, 100);
  }

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

  function bindBuy() {
    var buyBtn = findBuyButton();
    if (!buyBtn || buyBtn.__kafeBuyV10) return;
    buyBtn.__kafeBuyV10 = true;
    buyBtn.setAttribute('onclick', 'void(0)');
    buyBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      openBuy();
    });
  }

  function wrapOpen() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function') return;
    if (prev.__kafeBuyPageWrapV10) return;
    if (!window.__kafeOpenSubscriptionCore) {
      window.__kafeOpenSubscriptionCore = prev.__kafeBuyPageWrapV9
        ? window.__kafeOpenSubscriptionCore || prev
        : prev;
      // اگر قبلاً V9 پیچیده بود، سعی می‌کنیم به تابع اصلی برسیم
      if (prev.__kafeBuyPageWrapV9 && typeof window.__kafeOpenSubscriptionCore === 'function') {
        /* keep */
      } else {
        window.__kafeOpenSubscriptionCore = prev;
      }
    }
    var core = window.__kafeOpenSubscriptionCore;
    var wrapped = function () {
      injectCSS();
      ensureBuyPage();
      scrollToBuy();
      var ret = core.apply(this, arguments);
      function after() {
        mountFormIntoPage();
        scrollToBuy();
      }
      if (ret && typeof ret.then === 'function') {
        ret.then(after).catch(after);
      } else {
        after();
      }
      setTimeout(after, 50);
      setTimeout(after, 150);
      return ret;
    };
    wrapped.__kafeBuyPageWrapV10 = true;
    window.openSubscriptionPurchase = wrapped;
  }

  /** هر بار که باکس روی body ظاهر شد → فوری به pageBuy */
  function watchBodyOverlay() {
    if (window.__kafeBuyBodyWatch) return;
    window.__kafeBuyBodyWatch = true;
    try {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var nodes = muts[i].addedNodes || [];
          for (var j = 0; j < nodes.length; j++) {
            var n = nodes[j];
            if (n && n.id === 'subscriptionModalBox') {
              mountFormIntoPage();
              scrollToBuy();
            }
          }
        }
        var box = document.getElementById('subscriptionModalBox');
        if (box && box.parentNode === document.body) {
          mountFormIntoPage();
        }
      });
      mo.observe(document.body, { childList: true });
    } catch (e) {}
  }

  function run() {
    injectCSS();
    ensureBuyPage();
    bindBuy();
    wrapOpen();
    watchBodyOverlay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 80);
    });
  } else {
    setTimeout(run, 80);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 200);
    setTimeout(wrapOpen, 600);
  });
})();
