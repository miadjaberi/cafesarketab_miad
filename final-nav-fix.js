/** final-nav-fix.js V1
 * هایلایت نوار پایین مطابق صفحه فعال
 * فروشگاه=0 | خرید=pageBuy | منو=مرکز | ابزارها | تنظیمات
 */
(function () {
  'use strict';
  if (window.__KAFE_FINAL_NAV_FIX_V1__) return;
  window.__KAFE_FINAL_NAV_FIX_V1__ = true;

  function navButtons() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return [];
    return Array.prototype.slice.call(nav.querySelectorAll('button.nav-item-bottom'));
  }

  function clearActive() {
    navButtons().forEach(function (b) {
      b.classList.remove('active');
    });
  }

  function setActiveByIndex(i) {
    var btns = navButtons();
    clearActive();
    if (btns[i]) btns[i].classList.add('active');
  }

  function setActiveBuy() {
    navButtons().forEach(function (b) {
      var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
      var isBuy = label.indexOf('خرید') >= 0 && !b.classList.contains('center-btn');
      b.classList.toggle('active', isBuy);
    });
  }

  function setActiveSettings() {
    navButtons().forEach(function (b) {
      var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
      var isSet =
        label.indexOf('تنظیم') >= 0 || label.indexOf('آماده') >= 0;
      b.classList.toggle('active', isSet);
    });
  }

  function pageIndex() {
    var container = document.getElementById('pagesContainer');
    if (!container || !container.children.length) return 0;
    var w = container.clientWidth || 1;
    var left = container.scrollLeft || 0;
    // RTL: ممکن است scrollLeft منفی باشد
    var idx = Math.round(Math.abs(left) / w);
    if (idx < 0) idx = 0;
    if (idx > container.children.length - 1) idx = container.children.length - 1;
    return idx;
  }

  function pageIdAt(idx) {
    var container = document.getElementById('pagesContainer');
    if (!container || !container.children[idx]) return '';
    return container.children[idx].id || '';
  }

  function syncFromScroll() {
    var idx = pageIndex();
    var id = pageIdAt(idx);
    if (id === 'pageBuy') {
      setActiveBuy();
      return;
    }
    if (id === 'pageShop' || idx === 0) {
      setActiveByIndex(0);
      return;
    }
    if (id === 'pageTools') {
      // دکمه ابزارها معمولاً index 3 در نوار ۵تایی
      setActiveByIndex(3);
      return;
    }
    if (id === 'pageModals') {
      setActiveByIndex(2);
      return;
    }
  }

  function bind() {
    var container = document.getElementById('pagesContainer');
    if (container && !container.__kafeNavSync) {
      container.__kafeNavSync = true;
      container.addEventListener(
        'scroll',
        function () {
          window.requestAnimationFrame(syncFromScroll);
        },
        { passive: true }
      );
    }

    var nav = document.getElementById('bottomNav');
    if (nav && !nav.__kafeFinalNav) {
      nav.__kafeFinalNav = true;
      nav.addEventListener(
        'click',
        function (ev) {
          var t =
            ev.target && ev.target.closest
              ? ev.target.closest('button.nav-item-bottom')
              : null;
          if (!t) return;
          var label = (t.textContent || '').replace(/\s+/g, ' ').trim();
          if (label.indexOf('خرید') >= 0 && !t.classList.contains('center-btn')) {
            setTimeout(setActiveBuy, 50);
            return;
          }
          if (label.indexOf('تنظیم') >= 0 || label.indexOf('آماده') >= 0) {
            setTimeout(setActiveSettings, 50);
            return;
          }
          if (t.classList.contains('center-btn') || label.indexOf('منو') >= 0) {
            setTimeout(function () {
              setActiveByIndex(2);
            }, 50);
            return;
          }
          if (label.indexOf('فروشگاه') >= 0) {
            setTimeout(function () {
              setActiveByIndex(0);
            }, 50);
            return;
          }
          if (label.indexOf('ابزار') >= 0) {
            setTimeout(function () {
              setActiveByIndex(3);
            }, 50);
          }
        },
        true
      );
    }

    // wrap scrollToPage
    var prev = window.scrollToPage;
    if (typeof prev === 'function' && !prev.__kafeNavWrap) {
      window.scrollToPage = function (index) {
        var ret = prev.apply(this, arguments);
        setTimeout(syncFromScroll, 80);
        setTimeout(syncFromScroll, 320);
        return ret;
      };
      window.scrollToPage.__kafeNavWrap = true;
    }
  }

  function run() {
    bind();
    syncFromScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 100);
      setTimeout(run, 800);
    });
  } else {
    setTimeout(run, 100);
    setTimeout(run, 800);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 200);
  });
})();
