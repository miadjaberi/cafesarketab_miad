/** kafe-seven-fixes.js
 * هفت مورد باقی‌مانده — بدون باز کردن موارد حل‌شده
 * 1) یک‌بار شدن مسیر ورود
 * 2) یک سیستم بازخورد واحد
 * 3) حذف واقعی پیام
 * 4/5/7) آیکون نصب از پک Supabase (SW)
 * 6) فرم خرید ۴ طرح پایدار
 */
(function () {
  'use strict';
  if (window.__KAFE_SEVEN_FIXES_V1__) return;
  window.__KAFE_SEVEN_FIXES_V1__ = true;

  /* ========== 2) بازخورد واحد ========== */
  function ensureNotifStyle() {
    if (document.getElementById('kafe-unified-notif-css')) return;
    var st = document.createElement('style');
    st.id = 'kafe-unified-notif-css';
    st.textContent = [
      '#notification{',
      '  position:fixed!important;left:50%!important;transform:translateX(-50%)!important;',
      '  bottom:calc(var(--bottom-nav-height,68px) + 16px)!important;z-index:2147483000!important;',
      '  max-width:92vw!important;padding:12px 18px!important;border-radius:14px!important;',
      '  font-weight:800!important;font-size:0.92rem!important;text-align:center!important;direction:rtl!important;',
      '  background:linear-gradient(135deg,#fff6d8,#f0d878)!important;color:#1A1208!important;',
      '  border:1.5px solid rgba(201,168,76,.7)!important;box-shadow:0 10px 28px rgba(0,0,0,.35)!important;',
      '}',
      '#notification.error{',
      '  background:linear-gradient(135deg,#7f1d1d,#b91c1c)!important;color:#fff!important;',
      '  border-color:rgba(185,28,28,.8)!important;',
      '}',
      '#kafeHardToast{display:none!important;}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function unifiedNotify(msg, type) {
    ensureNotifStyle();
    var text = String(msg || '');
    try {
      var n = document.getElementById('notification');
      if (!n) {
        n = document.createElement('div');
        n.id = 'notification';
        document.body.appendChild(n);
      }
      n.textContent = text;
      n.className = type === 'error' ? 'error' : '';
      n.style.display = 'block';
      clearTimeout(n._timeout);
      n._timeout = setTimeout(function () {
        n.style.display = 'none';
      }, 3200);
      return;
    } catch (e) {}
    try {
      alert(text);
    } catch (e2) {}
  }

  // یک کانال رسمی
  var prevShow = window.showNotification;
  window.showNotification = function (msg, type) {
    unifiedNotify(msg, type);
  };
  // اگر نسخهٔ داخلی main بعداً دوباره تعریف شد، باز هم به unified وصل می‌ماند با interval سبک
  setTimeout(function () {
    window.showNotification = function (msg, type) {
      unifiedNotify(msg, type);
    };
  }, 2000);

  /* ========== 1) مسیر ورود یک‌بار ========== */
  (function fixBootOnce() {
    if (window.__KAFE_BOOT_ONCE_GUARD__) return;
    window.__KAFE_BOOT_ONCE_GUARD__ = true;
    var termsShown = false;

    function showTermsOnce() {
      if (termsShown) return;
      termsShown = true;
      var terms = document.getElementById('termsScreen');
      var splash = document.getElementById('splashScreen');
      var reg = document.getElementById('registerScreen');
      var app = document.getElementById('app');
      if (splash) {
        splash.style.display = 'none';
        try {
          splash.classList.add('hidden');
        } catch (e) {}
      }
      if (reg) {
        reg.style.display = 'none';
        try {
          reg.classList.add('hidden');
          reg.classList.remove('active');
        } catch (e2) {}
      }
      if (app) app.style.display = 'none';
      if (terms) {
        try {
          terms.classList.remove('hidden');
        } catch (e3) {}
        terms.style.display = 'flex';
      }
    }

    // جلوگیری از چندبار showTermsOnly در boot-flow
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      // اگر boot-flow قبلاً terms را نشان داده، فقط قفل کن
      var terms = document.getElementById('termsScreen');
      if (terms && terms.style.display === 'flex') termsShown = true;
      if (tries > 40) clearInterval(iv);
    }, 100);

    // اولین نمایش امن
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(showTermsOnce, 0);
      });
    } else {
      setTimeout(showTermsOnce, 0);
    }
  })();

  /* ========== 3) حذف واقعی پیام ========== */
  async function realDeleteMessage(msgId, convId) {
    unifiedNotify('در حال حذف پیام…');
    try {
      msgId = String(msgId || '').trim();
      if (!msgId || msgId === 'undefined' || msgId === 'null') {
        unifiedNotify('شناسه پیام نامعتبر است', 'error');
        return;
      }
      if (!window.confirm('این پیام حذف شود؟')) {
        unifiedNotify('حذف لغو شد');
        return;
      }
      var c = window.supabaseClient || window.v12Supabase;
      if (!c) {
        unifiedNotify('اتصال سرور برقرار نیست', 'error');
        return;
      }

      // حذف با برگرداندن ردیف حذف‌شده
      var r = await c.from('messages').delete().eq('id', msgId).select('id');
      if (r.error) throw r.error;

      var deleted = r.data && r.data.length;
      if (!deleted) {
        // اگر RLS حذف را بی‌صدا رد کرد، soft-delete
        var u = await c
          .from('messages')
          .update({
            content: '[این پیام توسط مدیریت حذف شد]',
            body: '[این پیام توسط مدیریت حذف شد]',
            text: '[این پیام توسط مدیریت حذف شد]'
          })
          .eq('id', msgId)
          .select('id');
        if (u.error) throw u.error;
        if (!u.data || !u.data.length) {
          unifiedNotify(
            'حذف انجام نشد (مجوز سرور یا شناسه). از پنل Supabase سیاست messages را بررسی کنید.',
            'error'
          );
          return;
        }
        unifiedNotify('✅ پیام حذف شد (علامت‌گذاری)');
      } else {
        unifiedNotify('✅ پیام حذف شد');
      }

      // حذف از DOM فوری
      try {
        var list = document.getElementById('v18AdminMessageList');
        if (list) {
          list.querySelectorAll('button').forEach(function (btn) {
            var oc = btn.getAttribute('onclick') || '';
            if (oc.indexOf(msgId) >= 0) {
              var bubble = btn.closest('.v18-bubble') || btn.parentElement;
              if (bubble && bubble.parentElement) bubble.parentElement.removeChild(bubble);
            }
          });
        }
      } catch (eDom) {}

      if (convId && typeof window.v18OpenAdminConversation === 'function') {
        try {
          await window.v18OpenAdminConversation(convId);
        } catch (e2) {}
      }
    } catch (e) {
      console.error('[seven] delete', e);
      unifiedNotify('حذف ناموفق: ' + ((e && e.message) || e), 'error');
    }
  }

  window.v18DeleteAdminMessage = function (msgId, convId) {
    return realDeleteMessage(msgId, convId);
  };

  if (!window.__kafeSevenDelCapture) {
    window.__kafeSevenDelCapture = true;
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

        var mid = btn.getAttribute('data-msg-id');
        var cid = btn.getAttribute('data-conv-id');
        if (!mid) {
          var oc = btn.getAttribute('onclick') || '';
          var m = oc.match(/v18DeleteAdminMessage\s*\(\s*['"]?([^,'"]+)['"]?\s*,\s*['"]?([^,'"]*)['"]?\s*\)/);
          if (m) {
            mid = m[1];
            cid = m[2];
          }
        }
        if (!mid) {
          unifiedNotify('شناسه پیام پیدا نشد', 'error');
          return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
        realDeleteMessage(mid, cid);
      },
      true
    );
  }

  /* ========== 6) خرید اشتراک — فرم ۴ طرح، پایدار ========== */
  (function fixBuy() {
    var opening = false;

    function frameBox() {
      var box = document.getElementById('subscriptionModalBox');
      if (!box) return;
      var headerH = 152,
        navH = 68;
      try {
        var hdr = document.querySelector('#appHeader') || document.querySelector('header');
        var nav = document.getElementById('bottomNav');
        if (hdr) {
          var hh = hdr.getBoundingClientRect().height;
          if (hh > 40 && hh < 280) headerH = Math.round(hh);
        }
        if (nav) {
          var nh = nav.getBoundingClientRect().height;
          if (nh > 40 && nh < 140) navH = Math.round(nh);
        }
      } catch (e) {}
      box.style.position = 'fixed';
      box.style.top = headerH + 'px';
      box.style.bottom = navH + 'px';
      box.style.left = '0';
      box.style.right = '0';
      box.style.inset = 'auto';
      box.style.width = '100%';
      box.style.zIndex = '9200';
      box.style.display = 'flex';
      box.style.flexDirection = 'column';
      box.style.alignItems = 'stretch';
      box.style.justifyContent = 'flex-start';
      box.style.padding = '0';
      box.style.background = '#0b1120';
      box.style.opacity = '1';
      box.style.visibility = 'visible';
      var sheet = box.firstElementChild;
      if (sheet) {
        sheet.style.width = '100%';
        sheet.style.maxWidth = 'none';
        sheet.style.height = '100%';
        sheet.style.maxHeight = 'none';
        sheet.style.margin = '0';
        sheet.style.borderRadius = '0';
        sheet.style.background = '#0b1120';
        sheet.style.overflowY = 'auto';
        sheet.style.opacity = '1';
      }
    }

    function openBuy() {
      if (opening) return;
      opening = true;
      try {
        var p = document.getElementById('subOrdersPanel');
        if (p) p.style.display = 'none';
      } catch (e) {}
      if (typeof window.openSubscriptionPurchase !== 'function') {
        unifiedNotify('فرم خرید در دسترس نیست', 'error');
        opening = false;
        return;
      }
      unifiedNotify('فرم خرید اشتراک');
      try {
        var ret = window.openSubscriptionPurchase();
        var done = function () {
          frameBox();
          setTimeout(frameBox, 50);
          setTimeout(frameBox, 200);
          setTimeout(function () {
            opening = false;
          }, 400);
        };
        if (ret && typeof ret.then === 'function') ret.then(done).catch(done);
        else done();
      } catch (e) {
        opening = false;
        unifiedNotify('خطا در باز کردن فرم خرید', 'error');
      }
    }

    function bind() {
      var nav = document.getElementById('bottomNav');
      if (!nav) return;
      var buttons = nav.querySelectorAll('button.nav-item-bottom');
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i];
        if (b.classList.contains('center-btn')) continue;
        var label = (b.textContent || '').replace(/\s+/g, ' ').trim();
        var oc = b.getAttribute('onclick') || '';
        if (oc.indexOf('openSubOrdersPanel') < 0 && label.indexOf('خرید') < 0) continue;
        if (b.__kafeSevenBuy) continue;
        b.__kafeSevenBuy = true;
        b.setAttribute('onclick', 'void(0)');
        b.addEventListener(
          'click',
          function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
            openBuy();
          },
          true
        );
      }

      // بستن فقط با دکمه‌های دیگر ناو
      if (!nav.__kafeSevenClose) {
        nav.__kafeSevenClose = true;
        nav.addEventListener(
          'click',
          function (ev) {
            if (opening) return;
            var t = ev.target && ev.target.closest ? ev.target.closest('button.nav-item-bottom') : null;
            if (!t || t.classList.contains('center-btn')) return;
            var label = (t.textContent || '').replace(/\s+/g, ' ').trim();
            if (label.indexOf('خرید') >= 0) return;
            var box = document.getElementById('subscriptionModalBox');
            if (box) box.remove();
          },
          true
        );
      }
    }

    // wrap برای هر بازشدن فرم (از هر جا)
    function wrapOpener() {
      var prev = window.openSubscriptionPurchase;
      if (typeof prev !== 'function' || prev.__kafeSevenBuyWrap) return;
      var w = function () {
        var ret = prev.apply(this, arguments);
        var apply = function () {
          frameBox();
        };
        if (ret && typeof ret.then === 'function') ret.then(apply).catch(apply);
        else apply();
        setTimeout(apply, 80);
        setTimeout(apply, 250);
        return ret;
      };
      w.__kafeSevenBuyWrap = true;
      window.openSubscriptionPurchase = w;
    }

    function run() {
      wrapOpener();
      bind();
    }
    setTimeout(run, 0);
    setTimeout(run, 500);
    setTimeout(run, 1500);
    window.addEventListener('load', function () {
      setTimeout(run, 300);
    });
  })();

  /* ========== 4/5/7) راهنمای آیکون — SW مسئول همگام‌سازی است ========== */
  // فقط version را به SW بفرست
  try {
    fetch(
      'https://evxxvnlwtbaqpjbjaxdk.supabase.co/storage/v1/object/public/public-assets/app-media/pwa/version.txt?t=' +
        Date.now(),
      { cache: 'no-store' }
    )
      .then(function (r) {
        return r.ok ? r.text() : '';
      })
      .then(function (v) {
        v = String(v || '').trim();
        if (!/^\d+$/.test(v)) return;
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.ready.then(function (reg) {
          if (reg.active) reg.active.postMessage({ type: 'PWA_ICON_UPDATED', v: v });
        });
      })
      .catch(function () {});
  } catch (e) {}

  ensureNotifStyle();
})();
