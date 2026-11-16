/* product-price-discount-fix.js v2 — محصولات + اشتراک: قیمت اصلی / تخفیفی */
(function () {
  'use strict';
  if (window.__KAFE_PRICE_DISCOUNT_V2__) return;
  window.__KAFE_PRICE_DISCOUNT_V2__ = true;
  window.__KAFE_PRICE_DISCOUNT_V1__ = true;

  var META_KEY = 'kafeProductPriceMeta';

  function getMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function saveMeta(m) {
    try { localStorage.setItem(META_KEY, JSON.stringify(m || {})); } catch (e) {}
  }
  function metaFor(id) {
    var m = getMeta();
    return m[String(id)] || {};
  }
  function setMetaFor(id, patch) {
    var m = getMeta();
    var cur = m[String(id)] || {};
    m[String(id)] = Object.assign({}, cur, patch || {});
    saveMeta(m);
  }

  function getDiscountSettings() {
    try {
      return JSON.parse(localStorage.getItem('discountSettings') || '{}') || {};
    } catch (e) { return {}; }
  }
  function getGlobalPercent() {
    var d = getDiscountSettings();
    var p = Number(d.percent);
    if (!isFinite(p) || p < 0) p = 50;
    if (p > 95) p = 95;
    return d.active === false ? 0 : p;
  }

  function escapeHtml(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function calcFinal(base, pct) {
    base = Number(base) || 0;
    pct = Number(pct) || 0;
    if (pct < 0) pct = 0;
    if (pct > 95) pct = 95;
    if (pct <= 0) return base;
    return Math.round(base * (100 - pct) / 100);
  }

  function formatPriceBlock(price, productId) {
    var base = Number(price) || 0;
    var meta = metaFor(productId);
    var note = (meta.note || '').trim();
    var localPct = meta.discountPercent;
    var pct = (localPct != null && localPct !== '' && isFinite(Number(localPct)))
      ? Number(localPct)
      : getGlobalPercent();
    if (pct < 0) pct = 0;
    if (pct > 95) pct = 95;

    var final = calcFinal(base, pct);
    var baseTxt = base.toLocaleString('fa-IR') + ' تومان';
    var finalTxt = final.toLocaleString('fa-IR') + ' تومان';
    var noteHtml = note ? (' <span class="kafe-price-note">' + escapeHtml(note) + '</span>') : '';

    if (pct > 0 && final < base) {
      return '<span class="kafe-price-wrap">' +
        '<span class="kafe-price-old">' + baseTxt + '</span>' +
        '<span class="kafe-price-new">' + finalTxt + '</span>' +
        '<span class="kafe-price-pct">' + pct + '٪</span>' +
        noteHtml +
        '</span>';
    }
    return '<span class="kafe-price-wrap"><span class="kafe-price-new">' + baseTxt + '</span>' + noteHtml + '</span>';
  }

  function formatSubPlanPriceHtml(price) {
    var base = Number(price) || 0;
    var pct = getGlobalPercent();
    if (base <= 0) return '<span class="kafe-price-new">قیمت اعلام‌نشده</span>';
    var final = calcFinal(base, pct);
    var baseTxt = base.toLocaleString('fa-IR') + ' تومان';
    var finalTxt = final.toLocaleString('fa-IR') + ' تومان';
    if (pct > 0 && final < base) {
      return '<span class="kafe-price-wrap kafe-sub-plan-price">' +
        '<span class="kafe-price-old">' + baseTxt + '</span>' +
        '<span class="kafe-price-new">' + finalTxt + '</span>' +
        '<span class="kafe-price-pct">' + pct + '٪</span>' +
        '</span>';
    }
    return '<span class="kafe-price-new">' + baseTxt + '</span>';
  }

  try {
    var st = document.createElement('style');
    st.id = 'kafePriceDiscountCss';
    st.textContent = [
      '.kafe-price-wrap{display:flex;flex-direction:column;gap:2px;align-items:flex-start}',
      '.product-card .kafe-price-wrap,.kafe-sub-plan-price{align-items:center}',
      '.kafe-price-old{text-decoration:line-through;opacity:.55;font-size:.78em;color:inherit}',
      '.kafe-price-new{font-weight:800;color:#F0D878}',
      '.ig-product-price .kafe-price-new{font-size:1.05em}',
      '.kafe-price-pct{font-size:.72em;color:#e8c76b;background:rgba(201,168,76,.15);padding:1px 6px;border-radius:8px;margin-top:2px}',
      '.kafe-price-note{font-size:.78em;opacity:.9;font-weight:600;color:#C8C0B0}',
      '#subscriptionPlanButtons .kafe-sub-plan-price{margin-top:4px}',
      '#kafeDiscountPercentRow label,#kafeProductPriceExtra label{display:block;font-size:.8rem;margin:6px 0 4px;color:var(--txt-body,#F5F0E4)}',
      '#kafeDiscountPercentRow input,#kafeProductPriceExtra input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid #ccc;box-sizing:border-box}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  } catch (eCss) {}

  function enhanceAdminDiscountForm() {
    var sub = document.getElementById('discountSubInput');
    if (!sub || document.getElementById('discountPercentInput')) return;
    var row = document.createElement('div');
    row.id = 'kafeDiscountPercentRow';
    row.innerHTML = '<label>درصد تخفیف پیشنهادی (محصولات و اشتراک)</label>' +
      '<input type="number" id="discountPercentInput" min="0" max="95" step="1" placeholder="مثلاً 50">';
    sub.parentNode.insertBefore(row, sub.nextSibling);
    var d = getDiscountSettings();
    var el = document.getElementById('discountPercentInput');
    if (el) el.value = (d.percent != null ? d.percent : 50);
  }

  function patchSaveDiscount() {
    var prev = window.saveDiscountSettings;
    if (typeof prev !== 'function' || prev.__kafePct) return;
    window.saveDiscountSettings = function () {
      var r = prev.apply(this, arguments);
      try {
        var d = getDiscountSettings();
        var el = document.getElementById('discountPercentInput');
        if (el) {
          var p = Number(el.value);
          if (!isFinite(p)) p = 0;
          d.percent = p;
          localStorage.setItem('discountSettings', JSON.stringify(d));
        }
      } catch (e) {}
      try { refreshPriceDisplays(); } catch (e2) {}
      try { refreshSubscriptionPlanPrices(); } catch (e3) {}
      return r;
    };
    window.saveDiscountSettings.__kafePct = true;
  }

  function enhanceAdminProductForm() {
    var price = document.getElementById('newProductPrice');
    if (!price || document.getElementById('kafeProductPriceExtra')) return;
    var box = document.createElement('div');
    box.id = 'kafeProductPriceExtra';
    box.innerHTML =
      '<label>متن کنار قیمت (اختیاری)</label>' +
      '<input type="text" id="newProductPriceNote" placeholder="مثلاً: با ارسال رایگان">' +
      '<label>تخفیف٪ این محصول (خالی = تخفیف عمومی)</label>' +
      '<input type="number" id="newProductDiscountPercent" min="0" max="95" step="1" placeholder="خالی = عمومی">';
    price.parentNode.insertBefore(box, price.nextSibling);
  }

  function patchAddProduct() {
    var prev = window.addProduct;
    if (typeof prev !== 'function' || prev.__kafePct) return;
    window.addProduct = function () {
      var beforeIds = {};
      try {
        var list0 = (typeof getProductsSafe === 'function') ? getProductsSafe() : [];
        (list0 || []).forEach(function (p) { beforeIds[String(p.id)] = true; });
      } catch (e0) {}
      var r = prev.apply(this, arguments);
      setTimeout(function () {
        try {
          var noteEl = document.getElementById('newProductPriceNote');
          var pctEl = document.getElementById('newProductDiscountPercent');
          var list = (typeof getProductsSafe === 'function') ? getProductsSafe() : [];
          var id = null;
          for (var i = 0; i < (list || []).length; i++) {
            if (!beforeIds[String(list[i].id)]) id = list[i].id;
          }
          if (id == null && list && list.length) id = list[list.length - 1].id;
          if (id != null) {
            var patch = { note: noteEl ? (noteEl.value || '') : '' };
            if (pctEl && pctEl.value !== '') patch.discountPercent = Number(pctEl.value);
            else patch.discountPercent = null;
            setMetaFor(id, patch);
          }
        } catch (e) {}
        refreshPriceDisplays();
      }, 150);
      return r;
    };
    window.addProduct.__kafePct = true;
  }

  function applyPriceToNode(node, price, id) {
    if (!node) return;
    node.innerHTML = formatPriceBlock(price, id);
  }

  function refreshPriceDisplays() {
    try {
      var list = (typeof getProductsSafe === 'function') ? getProductsSafe()
        : (typeof getProducts === 'function' ? getProducts() : []);
      var byId = {};
      (list || []).forEach(function (p) { byId[String(p.id)] = p; });

      document.querySelectorAll('.product-card').forEach(function (card) {
        var oc = card.getAttribute('onclick') || '';
        var m = oc.match(/openProductDetail\('([^']+)'\)/);
        if (!m) return;
        var id = m[1];
        var p = byId[id];
        if (!p) return;
        var priceEl = card.querySelector('.product-price');
        if (priceEl) applyPriceToNode(priceEl, p.price, id);
      });

      if (window._currentProduct) {
        var pr = document.getElementById('igProductPrice');
        if (pr) applyPriceToNode(pr, window._currentProduct.price, window._currentProduct.id);
      }
    } catch (e) {}
  }

  function refreshSubscriptionPlanPrices() {
    try {
      var pb = document.getElementById('subscriptionPlanButtons');
      if (!pb) return;
      var plans = (window.getSubscriptionPlans && window.getSubscriptionPlans()) || [];
      var byDays = {};
      plans.forEach(function (p) { byDays[String(p.days)] = p; });

      pb.querySelectorAll('button.subscription-plan-btn, button[data-plan-days]').forEach(function (btn) {
        var days = btn.getAttribute('data-plan-days');
        var plan = byDays[String(days)];
        if (!plan) return;
        var title = plan.title || (plan.days + ' روزه');
        btn.innerHTML = escapeHtml(title) + '<br>' + formatSubPlanPriceHtml(plan.price);
      });
    } catch (e) {}
  }

  function patchSelectAndSubmitAmount() {
    try {
      var prevSel = window.selectSubscriptionPlan;
      if (typeof prevSel === 'function' && !prevSel.__kafePct) {
        window.selectSubscriptionPlan = function (days) {
          var r = prevSel.apply(this, arguments);
          try {
            var plan = window.getPlanByDays && window.getPlanByDays(days);
            if (plan) {
              var final = calcFinal(plan.price, getGlobalPercent());
              window._subscriptionSelectedPlanPrice = final;
            }
          } catch (e) {}
          return r;
        };
        window.selectSubscriptionPlan.__kafePct = true;
      }
    } catch (e2) {}
  }

  function patchRenderProducts() {
    var prev = window.renderProducts;
    if (typeof prev !== 'function' || prev.__kafePct) return;
    window.renderProducts = function () {
      var r = prev.apply(this, arguments);
      setTimeout(refreshPriceDisplays, 30);
      setTimeout(refreshPriceDisplays, 200);
      return r;
    };
    window.renderProducts.__kafePct = true;
  }

  function patchOpenProductDetail() {
    var prev = window.openProductDetail;
    if (typeof prev !== 'function' || prev.__kafePct) return;
    window.openProductDetail = function () {
      var r = prev.apply(this, arguments);
      setTimeout(function () {
        if (window._currentProduct) {
          var pr = document.getElementById('igProductPrice');
          if (pr) applyPriceToNode(pr, window._currentProduct.price, window._currentProduct.id);
        }
      }, 40);
      return r;
    };
    window.openProductDetail.__kafePct = true;
  }

  function patchOpenSubscriptionPurchase() {
    var tries = 0;
    function attempt() {
      var prev = window.openSubscriptionPurchase;
      if (typeof prev !== 'function') {
        if (tries++ < 40) setTimeout(attempt, 250);
        return;
      }
      if (prev.__kafePct) return;
      window.openSubscriptionPurchase = function () {
        var r = prev.apply(this, arguments);
        try {
          if (r && typeof r.then === 'function') {
            r.then(function () {
              setTimeout(refreshSubscriptionPlanPrices, 40);
              setTimeout(refreshSubscriptionPlanPrices, 200);
              setTimeout(patchSelectAndSubmitAmount, 50);
            }).catch(function () {
              setTimeout(refreshSubscriptionPlanPrices, 40);
            });
          } else {
            setTimeout(refreshSubscriptionPlanPrices, 40);
            setTimeout(refreshSubscriptionPlanPrices, 200);
            setTimeout(patchSelectAndSubmitAmount, 50);
          }
        } catch (e) {
          setTimeout(refreshSubscriptionPlanPrices, 40);
        }
        return r;
      };
      window.openSubscriptionPurchase.__kafePct = true;
    }
    attempt();
  }

  function boot() {
    enhanceAdminDiscountForm();
    enhanceAdminProductForm();
    patchSaveDiscount();
    patchAddProduct();
    patchRenderProducts();
    patchOpenProductDetail();
    patchOpenSubscriptionPurchase();
    patchSelectAndSubmitAmount();
    refreshPriceDisplays();
    refreshSubscriptionPlanPrices();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 400); });
  } else setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setTimeout(boot, 4000);
  setTimeout(refreshPriceDisplays, 2500);

  try {
    var obs = new MutationObserver(function () {
      if (document.getElementById('subscriptionPlanButtons')) refreshSubscriptionPlanPrices();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (eObs) {}
})();
