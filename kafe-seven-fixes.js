/** kafe-seven-fixes.js
 * ۷ مورد باقی‌مانده — بدون باز کردن موارد حل‌شده
 * 1 boot یک‌بار (در boot-flow V2)
 * 2 بازخورد یکدست
 * 3 حذف پیام با تأیید واقعی
 * 4-5-7 آیکون Supabase در manifest
 * 6 خرید اشتراک پایدار با ۴ طرح
 */
(function () {
  'use strict';
  if (window.__KAFE_SEVEN_FIXES_V1__) return;
  window.__KAFE_SEVEN_FIXES_V1__ = true;

  /* ========== 2) بازخورد یکدست ========== */
  function unifiedNotify(msg, type) {
    var text = String(msg || '');
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification(text, type === 'error' ? 'error' : type || '');
        return;
      }
    } catch (e) {}
    try {
      var n = document.getElementById('notification');
      if (n) {
        n.textContent = text;
        n.style.display = 'block';
        n.className = type === 'error' ? 'error' : '';
        clearTimeout(n._timeout);
        n._timeout = setTimeout(function () {
          n.style.display = 'none';
        }, 3200);
        return;
      }
    } catch (e2) {}
    try {
      alert(text);
    } catch (e3) {}
  }
  window.kafeNotify = unifiedNotify;

  // استایل یکدست notification
  (function () {
    var id = 'kafe-unified-notify-css';
    if (document.getElementById(id)) return;
    var st = document.createElement('style');
    st.id = id;
    st.textContent = [
      '#notification{',
      '  position:fixed!important;left:50%!important;transform:translateX(-50%)!important;',
      '  bottom:calc(var(--bottom-nav-height,68px) + 16px)!important;',
      '  z-index:2147483000!important;max-width:92vw!important;',
      '  padding:12px 16px!important;border-radius:12px!important;',
      '  font-size:0.92rem!important;font-weight:800!important;text-align:center!important;direction:rtl!important;',
      '  background:#0b1120!important;color:#F0D878!important;',
      '  border:2px solid #c9a84c!important;box-shadow:0 10px 28px rgba(0,0,0,.45)!important;',
      '}',
      '#notification.error{',
      '  color:#fff!important;background:#5a1520!important;border-color:#c44!important;',
      '}',
      '#kafeHardToast{display:none!important;}' // جلوگیری از دوگانگی زرد/سبز موازی
    ].join('\n');
    document.head.appendChild(st);
  })();

  /* ========== 3) حذف پیام با تأیید واقعی ========== */
  async function hardDeleteMessageVerified(msgId, convId) {
    unifiedNotify('در حال حذف پیام…');
    try {
      if (!msgId) {
        unifiedNotify('شناسه پیام نامعتبر است', 'error');
        return;
      }
      var ok = false;
      try {
        ok = window.confirm('این پیام حذف شود؟');
      } catch (e) {
        ok = true;
      }
      if (!ok) {
        unifiedNotify('حذف لغو شد');
        return;
      }
      var c = window.supabaseClient || null;
      if (!c) {
        unifiedNotify('اتصال سرور برقرار نیست', 'error');
        return;
      }
      // حذف
      var r = await c.from('messages').delete().eq('id', msgId);
      if (r && r.error) throw r.error;

      // تأیید واقعی: آیا هنوز هست؟
      var check = await c.from('messages').select('id').eq('id', msgId).maybeSingle();
      if (check && check.data && check.data.id) {
        unifiedNotify(
          'حذف انجام نشد (احتمالاً محدودیت دسترسی سرور). نقش admin در پروفایل را بررسی کنید.',
          'error'
        );
        return;
      }
      unifiedNotify('✅ پیام حذف شد');
      if (convId && typeof window.v18OpenAdminConversation === 'function') {
        try {
          await window.v18OpenAdminConversation(convId);
        } catch (e2) {}
      }
    } catch (e) {
      console.error('hardDeleteMessageVerified', e);
      unifiedNotify('حذف ناموفق: ' + ((e && e.message) || e), 'error');
    }
  }

  window.v18DeleteAdminMessage = function (msgId, convId) {
    return hardDeleteMessageVerified(msgId, convId);
  };

  function parseDeleteArgs(btn) {
    var mid = btn.getAttribute('data-msg-id');
    var cid = btn.getAttribute('data-conv-id');
    if (mid) return { mid: mid, cid: cid };
    var oc = btn.getAttribute('onclick') || '';
    var m = oc.match(/v18DeleteAdminMessage\s*\(([^)]*)\)/);
    if (!m) return null;
    var parts = m[1].split(',');
    mid = (parts[0] || '').replace(/[&quot;"'\s]/g, '');
    cid = (parts[1] || '').replace(/[&quot;"'\s]/g, '');
    return { mid: mid, cid: cid };
  }

  if (!window.__kafeDelSeven) {
    window.__kafeDelSeven = true;
    document.addEventListener(
      'click',
      function (ev) {
        var t = ev.target;
        if (!t || !t.closest) return;
        var btn = t.closest('button');
        if (!btn) return;
        var label = (btn.textContent || '').replace(/\s+/g, ' ').trim();
        if (label.indexOf('حذف پیام') === -1) return;
        if (!btn.closest('#adminPanel') && !btn.closest('#v18AdminMessageList')) return;
        var a = parseDeleteArgs(btn);
        if (!a || !a.mid) {
          unifiedNotify('شناسه پیام پیدا نشد', 'error');
          return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        hardDeleteMessageVerified(a.mid, a.cid);
      },
      true
    );
  }

  /* ========== 6) خرید اشتراک پایدار ========== */
  function heights() {
    var headerH = 152,
      navH = 68;
    try {
      var hdr =
        document.querySelector('#appHeader') ||
        document.querySelector('header.app-header') ||
        document.querySelector('header');
      if (hdr) {
        var hr = hdr.getBoundingClientRect();
        if (hr.height > 40 && hr.height < 280) headerH = Math.round(hr.height);
      }
      var nav = document.getElementById('bottomNav');
      if (nav) {
        var nr = nav.getBoundingClientRect();
        if (nr.height > 40 && nr.height < 140) navH = Math.round(nr.height);
      }
    } catch (e) {}
    return { headerH: headerH, navH: navH };
  }

  function stylePurchaseSolid() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    var h = heights();
    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('inset', 'auto', 'important');
    box.style.setProperty('top', h.headerH + 'px', 'important');
    box.style.setProperty('bottom', h.navH + 'px', 'important');
    box.style.setProperty('left', '0', 'important');
    box.style.setProperty('right', '0', 'important');
    box.style.setProperty('z-index', '9200', 'important');
    box.style.setProperty('display', 'flex', 'important');
    box.style.setProperty('background', '#0b1120', 'important');
    box.style.setProperty('opacity', '1', 'important');
    box.style.setProperty('visibility', 'visible', 'important');
    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('max-width', 'none', 'important');
      sheet.style.setProperty('height', '100%', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      sheet.style.setProperty('background', '#0b1120', 'important');
      sheet.style.setProperty('opacity', '1', 'important');
      sheet.style.setProperty('overflow-y', 'auto', 'important');
      sheet.style.setProperty('border-radius', '0', 'important');
    }
  }

  function wrapPurchase() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function' || prev.__kafeSevenPurchase) return;
    var wrapped = function () {
      var ret = prev.apply(this, arguments);
      var apply = function () {
        stylePurchaseSolid();
        // چند بار برای غلبه بر ui-unify شفاف
        setTimeout(stylePurchaseSolid, 50);
        setTimeout(stylePurchaseSolid, 200);
        setTimeout(stylePurchaseSolid, 500);
      };
      if (ret && typeof ret.then === 'function') ret.then(apply).catch(apply);
      else apply();
      return ret;
    };
    wrapped.__kafeSevenPurchase = true;
    window.openSubscriptionPurchase = wrapped;
  }

  // دکمه خرید نوار پایین → فرم کامل
  function bindBuy() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    var buttons = nav.querySelectorAll('button.nav-item-bottom');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.classList.contains('center-btn')) continue;
      var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
      var oc = b.getAttribute('onclick') || '';
      if (!(oc.indexOf('openSubOrdersPanel') >= 0 || label.indexOf('خرید') >= 0)) continue;
      if (b.__kafeSevenBuy) continue;
      b.__kafeSevenBuy = true;
      b.setAttribute('onclick', 'void(0)');
      b.addEventListener(
        'click',
        function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
          if (typeof window.openSubscriptionPurchase === 'function') {
            unifiedNotify('فرم خرید اشتراک');
            window.openSubscriptionPurchase();
          } else {
            unifiedNotify('فرم خرید در دسترس نیست', 'error');
          }
        },
        true
      );
    }
  }

  function run() {
    wrapPurchase();
    bindBuy();
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
