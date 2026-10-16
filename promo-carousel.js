/* Royal promotional carousel enhancement. Adds UI around existing shop banner only. */
(function () {
  'use strict';
  function initMiadPromoCarousel() {
    var banner = document.getElementById('discountBanner');
    if (!banner || banner.dataset.miadCarouselReady === '1') return;
    banner.dataset.miadCarouselReady = '1';

    var shop = document.getElementById('pageShop');
    if (!shop) return;
    var wrap = document.createElement('section');
    wrap.className = 'miad-promo-carousel';
    wrap.setAttribute('aria-label', 'کارت‌های ویژه کافه میعاد');
    wrap.setAttribute('aria-roledescription', 'اسلایدر');
    banner.parentNode.insertBefore(wrap, banner);
    wrap.appendChild(banner);

    var slides = [
      { id: 'discount', title: '', sub: '', icon: '', action: function () {
          if (typeof window.showNotification === 'function' && typeof window.getDiscountText === 'function') window.showNotification('🔥 ' + window.getDiscountText());
        } },
      { id: 'products', title: 'محصولات منتخب کافه میعاد', sub: 'برای دیدن محصولات موجود، به بخش فروشگاه بروید', icon: '📚', action: function () {
          var grid = document.getElementById('productsGrid');
          if (grid && typeof grid.scrollIntoView === 'function') grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } },
      { id: 'discover', title: 'دنیای کافه سرکتاب میعاد', sub: 'ابزارها و بخش‌های موجود اپ را از منوی اصلی کشف کنید', icon: '✨', action: function () {
          var header = document.querySelector('header');
          if (header && typeof header.scrollIntoView === 'function') header.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (typeof window.showNotification === 'function') window.showNotification('✨ از منوی اصلی، بخش موردنظرتان را انتخاب کنید.');
        } }
    ];

    var extra = [];
    slides.slice(1).forEach(function (slide, index) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'featured-banner miad-promo-extra';
      card.setAttribute('aria-label', slide.title);
      card.innerHTML = '<span class="featured-banner-content"><span class="featured-banner-icon" aria-hidden="true"></span><span class="featured-banner-text"><span class="miad-promo-title"></span><small class="miad-promo-sub"></small></span></span><span class="featured-banner-arrow" aria-hidden="true">←</span>';
      card.querySelector('.featured-banner-icon').textContent = slide.icon;
      card.querySelector('.miad-promo-title').textContent = slide.title;
      card.querySelector('.miad-promo-sub').textContent = slide.sub;
      card.addEventListener('click', slide.action);
      card.hidden = true;
      wrap.appendChild(card);
      extra.push(card);
    });

    var controls = document.createElement('div');
    controls.className = 'miad-promo-controls';
    controls.innerHTML = '<button type="button" class="miad-promo-arrow" aria-label="کارت قبلی">‹</button><div class="miad-promo-dots" role="group" aria-label="انتخاب کارت"></div><button type="button" class="miad-promo-arrow" aria-label="کارت بعدی">›</button>';
    wrap.appendChild(controls);
    var dots = controls.querySelector('.miad-promo-dots');
    var cards = [banner].concat(extra);
    var current = 0;
    var dotButtons = cards.map(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button'; dot.className = 'miad-promo-dot';
      dot.setAttribute('aria-label', 'نمایش کارت ' + (i + 1));
      dot.addEventListener('click', function () { show(i); });
      dots.appendChild(dot);
      return dot;
    });
    function show(index) {
      current = (index + cards.length) % cards.length;
      cards.forEach(function (card, i) {
        card.hidden = i !== current;
        card.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      });
      dotButtons.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
        dot.setAttribute('aria-pressed', i === current ? 'true' : 'false');
      });
    }
    var arrows = controls.querySelectorAll('.miad-promo-arrow');
    arrows[0].addEventListener('click', function () { show(current - 1); });
    arrows[1].addEventListener('click', function () { show(current + 1); });
    var startX = null;
    wrap.addEventListener('touchstart', function (event) {
      if (event.touches && event.touches.length === 1) startX = event.touches[0].clientX;
    }, { passive: true });
    wrap.addEventListener('touchend', function (event) {
      if (startX === null || !event.changedTouches || !event.changedTouches.length) return;
      var delta = event.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(delta) > 45) show(current + (delta < 0 ? 1 : -1));
    }, { passive: true });

    banner.addEventListener('click', function () {
      if (current !== 0) return;
      slides[0].action();
    });
    banner.addEventListener('keydown', function (event) {
      if ((event.key === 'Enter' || event.key === ' ') && current === 0) { event.preventDefault(); slides[0].action(); }
    });
    show(0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMiadPromoCarousel, { once: true });
  else initMiadPromoCarousel();
})();
