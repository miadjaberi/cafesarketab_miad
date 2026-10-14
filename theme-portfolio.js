/* Kafe Miad portfolio-template adaptation.
   Keeps commerce, modal, settings and Supabase logic in main.js.
   This file only adapts presentation and routes the new visual controls to existing handlers. */
(function(){
  'use strict';
  if (window.__miadPortfolioUiLoaded) return;
  window.__miadPortfolioUiLoaded = true;
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) {}

  function esc(value){
    if (typeof window.kafeEscapeHtml === 'function') return window.kafeEscapeHtml(value);
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c];
    });
  }
  function products(){
    // Prefer the actual rendered product cards: this works even if the store logic is scoped inside main.js.
    try {
      var rendered = Array.prototype.slice.call(document.querySelectorAll('#productsGrid .product-card')).map(function(card){
        var titleNode = card.querySelector('.product-name');
        var priceNode = card.querySelector('.product-price');
        var imageNode = card.querySelector('.product-img');
        var iconNode = card.querySelector('.product-icon');
        var badgeNode = card.querySelector('.product-badge');
        var click = card.getAttribute('onclick') || '';
        var idMatch = click.match(/openProductDetail\s*\(\s*['"]([^'"]+)['"]/);
        var rawPrice = priceNode ? priceNode.textContent.trim() : '';
        var digits = rawPrice.replace(/[^0-9۰-۹٠-٩]/g,'').replace(/[۰-۹]/g,function(c){return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c));}).replace(/[٠-٩]/g,function(c){return String('٠١٢٣٤٥٦٧٨٩'.indexOf(c));});
        return {
          id: idMatch ? idMatch[1] : '',
          title: titleNode ? titleNode.textContent.trim() : 'محصول',
          price: digits ? Number(digits) : 0,
          _displayPrice: rawPrice,
          imageUrl: imageNode ? imageNode.getAttribute('src') : '',
          image: iconNode ? iconNode.textContent.trim() : '📦',
          badge: badgeNode ? badgeNode.textContent.trim() : '',
          desc: ''
        };
      }).filter(function(p){ return p.id || p.title; });
      if (rendered.length) return rendered;
    } catch(e) {}
    try {
      if (typeof window.getProductsSafe === 'function') return window.getProductsSafe() || [];
      if (typeof window.getProducts === 'function') return window.getProducts() || [];
    } catch(e) {}
    try {
      var raw = localStorage.getItem('cafeProducts');
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch(e) { return []; }
  }
  function productTitle(p){ return p && (p.title || p.name) || 'محصول'; }
  function productImage(p){ return p && (p.imageUrl || p.image_url) || ''; }
  function productPrice(p){
    if (p && p._displayPrice) return p._displayPrice;
    var n = Number(p && p.price);
    return Number.isFinite(n) && n > 0 ? n.toLocaleString('fa-IR') + ' تومان' : 'جزئیات قیمت';
  }
  function productId(p){ return p && (p.id != null ? p.id : p.local_id); }

  function makeAdCard(p, compact){
    var card = document.createElement('button');
    card.type = 'button';
    card.className = compact ? 'header-ad-item' : 'miad-ad-card';
    var thumb = document.createElement('span');
    thumb.className = compact ? 'header-ad-thumb' : 'miad-ad-thumb';
    var src = productImage(p);
    if (src) {
      var img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.src = src;
      img.onerror = function(){ thumb.textContent = (p && p.image) || '📦'; };
      thumb.appendChild(img);
    } else {
      thumb.textContent = (p && p.image) || '📦';
    }
    var copy = document.createElement('span');
    copy.className = compact ? 'header-ad-copy' : 'miad-ad-copy';
    var title = document.createElement('b');
    title.textContent = productTitle(p);
    var subtitle = document.createElement('small');
    subtitle.textContent = compact ? productPrice(p) : ((p && (p.badge || p.desc || p.description)) || 'برای مشاهده جزئیات انتخاب کنید');
    copy.appendChild(title);
    copy.appendChild(subtitle);
    if (!compact) {
      var price = document.createElement('span');
      price.className = 'miad-ad-price';
      price.textContent = productPrice(p);
      copy.appendChild(price);
    }
    card.appendChild(thumb);
    card.appendChild(copy);
    card.dataset.productId = String(productId(p) == null ? '' : productId(p));
    card.setAttribute('aria-label', 'مشاهده محصول ' + productTitle(p));
    return card;
  }
  function populateTrack(track, compact, list){
    if (!track) return;
    track.replaceChildren();
    if (!list.length) return;
    var useList = list.slice(0, 12);
    useList.forEach(function(p){ track.appendChild(makeAdCard(p, compact)); });
    if (useList.length > 1) useList.forEach(function(p){ track.appendChild(makeAdCard(p, compact)); });
    else {
      var lone = makeAdCard(useList[0], compact);
      lone.setAttribute('aria-hidden','true');
      track.appendChild(lone);
    }
  }
  function renderAds(){
    var list = products().filter(function(p){ return p && (p.is_active !== false) && (p.isActive !== false); }).slice(0,12);
    populateTrack(document.getElementById('miadAdTrack'), false, list);
    populateTrack(document.getElementById('miadHeaderAdTrack'), true, list);
    var empty = document.getElementById('miadAdEmpty');
    if (empty) empty.hidden = list.length > 0;
    var windowEl = document.getElementById('miadAdWindow');
    if (windowEl) windowEl.hidden = list.length === 0;
    var rail = document.getElementById('miadHeaderAdRail');
    if (rail) rail.hidden = list.length === 0;
  }

  function installShowcase(){
    document.body.classList.add('miad-template-ui');
    var shop = document.getElementById('pageShop');
    if (!shop) return;
    var header = shop.querySelector('.page-header');
    var banner = document.getElementById('discountBanner');
    if (!header || !banner) return;
    header.innerHTML =
      '<div class="miad-showcase reveal in">' +
        '<span class="miad-eyebrow">کافه سرکتاب میعاد</span>' +
        '<h1>محصولات دیجیتال <em>به‌روز و زیبا</em></h1>' +
        '<p class="miad-lead">محصولات، سرکتاب‌ها و ابزارهای کافه میعاد؛ در یک فضای منظم و ساده، با همان امکانات و اطلاعات واقعی برنامه.</p>' +
        '<div class="miad-switcher" role="group" aria-label="دسترسی سریع">' +
          '<button type="button" class="chip active" data-miad-go="0">🛍️ محصولات و فروشگاه</button>' +
          '<button type="button" class="chip" data-miad-go="1">📜 سرکتاب و مودال‌ها</button>' +
          '<button type="button" class="chip" data-miad-go="2">🧰 ابزارهای آنلاین</button>' +
          '<button type="button" class="chip" data-miad-go="settings">⚙️ تنظیمات</button>' +
        '</div>' +
      '</div>';
    var adSection = document.createElement('section');
    adSection.className = 'miad-ad-section';
    adSection.innerHTML =
      '<div class="miad-ad-heading"><div><h2>پیشنهادها و کارت‌های تبلیغاتی</h2><p>نمایش از روی محصولات ثبت‌شده در فروشگاه</p></div></div>' +
      '<div class="miad-ad-window" id="miadAdWindow"><div class="miad-ad-track" id="miadAdTrack"></div></div>' +
      '<p id="miadAdEmpty" class="miad-ad-empty" hidden>پس از ثبت محصول در فروشگاه، کارت‌های تبلیغاتی اینجا نمایش داده می‌شوند.</p>';
    banner.parentNode.insertBefore(adSection, banner);

    var brand = document.querySelector('#headerBrandLogo .brand-background');
    if (brand && !document.getElementById('miadHeaderAdRail')) {
      var rail = document.createElement('div');
      rail.className = 'header-ad-rail';
      rail.id = 'miadHeaderAdRail';
      rail.setAttribute('aria-hidden','true');
      rail.innerHTML = '<div class="header-ad-track" id="miadHeaderAdTrack"></div>';
      brand.appendChild(rail);
    }
    renderAds();
  }

  function goTo(index){
    if (typeof window.scrollToPage === 'function') window.scrollToPage(index);
    var chips = document.querySelectorAll('[data-miad-go]');
    chips.forEach(function(chip){
      chip.classList.toggle('active', String(chip.dataset.miadGo) === String(index));
    });
  }
  document.addEventListener('click', function(event){
    var nav = event.target.closest('[data-miad-go]');
    if (nav) {
      var target = nav.dataset.miadGo;
      if (target === 'settings') {
        if (typeof window.toggleUserSettings === 'function') window.toggleUserSettings();
        return;
      }
      goTo(Number(target));
      return;
    }
    var card = event.target.closest('[data-product-id]');
    if (card) {
      var id = card.dataset.productId;
      if (id && typeof window.openProductDetail === 'function') window.openProductDetail(id);
    }
  });

  function startHeaderCycle(){
    var brand = document.querySelector('#headerBrandLogo .brand-background');
    var rail = document.getElementById('miadHeaderAdRail');
    if (!brand || !rail) return;
    var inAds = false;
    function cycle(){
      var hasCards = !!document.querySelector('#miadHeaderAdTrack .header-ad-item');
      if (!hasCards) { brand.classList.remove('ad-mode'); inAds = false; setTimeout(cycle, 7000); return; }
      inAds = !inAds;
      brand.classList.toggle('ad-mode', inAds);
      rail.setAttribute('aria-hidden', inAds ? 'false' : 'true');
      setTimeout(cycle, inAds ? 9500 : 7000);
    }
    setTimeout(cycle, 7000);
  }

  function boot(){
    installShowcase();
    startHeaderCycle();
    // Refresh cards after existing product syncs; this does not replace the store data source.
    window.addEventListener('focus', renderAds);
    document.addEventListener('visibilitychange', function(){ if (!document.hidden) renderAds(); });
    window.addEventListener('miad:products-updated', renderAds);
    var grid = document.getElementById('productsGrid');
    if (grid && window.MutationObserver) {
      var obs = new MutationObserver(function(){ renderAds(); });
      obs.observe(grid, {childList:true,subtree:true});
    }
    // Respect reduced-motion preference while keeping the template's transitions intact.
    if (reduceMotion) document.body.classList.add('miad-reduced-motion');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
