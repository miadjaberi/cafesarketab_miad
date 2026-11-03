/** admin-ui-four-fixes.js
 * 1) جزئیات خرید/اشتراک بالای پنل ادمین (z-index)
 * 2) پنجره خرید اشتراک داخل فریم اپ (مرکز، مثل مودال‌ها)
 * 3) مودال «برای من» در لیست مدیریت مودال‌ها
 * 4) حذف پیام با بازخورد و آرگومان امن
 */
(function () {
  'use strict';
  if (window.__KAFE_ADMIN_UI_FOUR_FIXES_V1__) return;
  window.__KAFE_ADMIN_UI_FOUR_FIXES_V1__ = true;

  function notify(msg, type) {
    try {
      if (typeof showNotification === 'function') showNotification(msg, type || 'info');
      else if (typeof window.showNotification === 'function') window.showNotification(msg, type || 'info');
    } catch (e) {}
  }

  function injectCSS() {
    var id = 'kafe-admin-ui-four-fixes-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      /* جزئیات ادمین همیشه بالای پنل مدیریت */
      '#kafeAdminPurchaseDetail{',
      '  z-index:100150!important;',
      '  pointer-events:auto!important;',
      '}',
      '#kafeAdminPurchaseDetail > div{',
      '  pointer-events:auto!important;',
      '}',

      /* خرید اشتراک: مرکز فریم اپ، نه شیت پایینِ تمام‌صفحه */
      '#subscriptionModalBox{',
      '  position:fixed!important;',
      '  top:var(--header-height,152px)!important;',
      '  bottom:calc(var(--bottom-nav-height,68px) + env(safe-area-inset-bottom,0px))!important;',
      '  left:0!important;right:0!important;',
      '  inset:auto!important;',
      '  z-index:5200!important;',
      '  display:flex!important;',
      '  align-items:center!important;',
      '  justify-content:center!important;',
      '  padding:12px 14px!important;',
      '  box-sizing:border-box!important;',
      '  background:rgba(0,0,0,.72)!important;',
      '  backdrop-filter:none!important;',
      '  -webkit-backdrop-filter:none!important;',
      '}',
      '#subscriptionModalBox > div{',
      '  width:100%!important;',
      '  max-width:420px!important;',
      '  max-height:100%!important;',
      '  margin:0 auto!important;',
      '  border-radius:24px!important;',
      '  border:2px solid #c9a84c!important;',
      '  background:#0b1120!important;',
      '  box-shadow:0 10px 30px rgba(0,0,0,.8)!important;',
      '  overflow:auto!important;',
      '  -webkit-overflow-scrolling:touch!important;',
      '}',

      /* کارت برای من در ادمین */
      '.kafe-admin-for-me-item{',
      '  border:1px dashed rgba(201,168,76,.55)!important;',
      '  background:rgba(201,168,76,.08)!important;',
      '}',
      '.kafe-admin-for-me-item .kafe-for-me-badge{',
      '  display:inline-block;margin-right:6px;padding:2px 8px;border-radius:999px;',
      '  background:rgba(45,212,191,.15);color:#2dd4bf;font-size:.72rem;font-weight:700;',
      '}'
    ].join('\n');
  }

  /* ---- 1) جزئیات: z-index و بازخورد ---- */
  function elevateDetail() {
    var el = document.getElementById('kafeAdminPurchaseDetail');
    if (!el) return;
    el.style.setProperty('z-index', '100150', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('display', 'flex', 'important');
  }

  function patchShowDetail() {
    var prev = window.showAdminPurchaseDetail;
    if (typeof prev !== 'function' || prev.__kafeZFix) return;
    window.showAdminPurchaseDetail = function (kind, row) {
      try {
        if (!row) {
          notify('جزئیات پیدا نشد', 'error');
          return;
        }
        notify('در حال باز کردن جزئیات…', 'info');
      } catch (e0) {}
      var ret = prev.apply(this, arguments);
      setTimeout(elevateDetail, 0);
      setTimeout(elevateDetail, 50);
      setTimeout(elevateDetail, 200);
      return ret;
    };
    window.showAdminPurchaseDetail.__kafeZFix = true;
  }

  /* ---- 2) خرید اشتراک داخل فریم ---- */
  function restyleSubBox() {
    var box = document.getElementById('subscriptionModalBox');
    if (!box) return;
    box.style.setProperty('position', 'fixed', 'important');
    box.style.setProperty('top', 'var(--header-height,152px)', 'important');
    box.style.setProperty('bottom', 'calc(var(--bottom-nav-height,68px) + env(safe-area-inset-bottom,0px))', 'important');
    box.style.setProperty('left', '0', 'important');
    box.style.setProperty('right', '0', 'important');
    box.style.setProperty('align-items', 'center', 'important');
    box.style.setProperty('justify-content', 'center', 'important');
    box.style.setProperty('padding', '12px 14px', 'important');
    box.style.setProperty('z-index', '5200', 'important');
    var sheet = box.firstElementChild;
    if (sheet) {
      sheet.style.setProperty('border-radius', '24px', 'important');
      sheet.style.setProperty('max-width', '420px', 'important');
      sheet.style.setProperty('width', '100%', 'important');
      sheet.style.setProperty('border', '2px solid #c9a84c', 'important');
      sheet.style.setProperty('background', '#0b1120', 'important');
    }
  }

  function patchSubPurchase() {
    var prev = window.openSubscriptionPurchase;
    if (typeof prev !== 'function' || prev.__kafeFrameFix) return;
    window.openSubscriptionPurchase = async function () {
      var ret = await prev.apply(this, arguments);
      setTimeout(restyleSubBox, 0);
      setTimeout(restyleSubBox, 80);
      setTimeout(restyleSubBox, 250);
      return ret;
    };
    window.openSubscriptionPurchase.__kafeFrameFix = true;
  }

  /* ---- 3) برای من در لیست ادمین ---- */
  function injectForMeAdminCard() {
    var container = document.getElementById('adminModalsList');
    if (!container) return;
    if (container.querySelector('.kafe-admin-for-me-item')) return;
    var card = document.createElement('div');
    card.className = 'admin-item modal-admin-item kafe-admin-for-me-item';
    card.innerHTML =
      '<span class="modal-admin-name">👤 <b>برای من</b> ' +
      '<span class="kafe-for-me-badge">در حال توسعه</span></span>' +
      '<div class="admin-item-actions" style="margin-top:8px">' +
      '<button type="button" class="btn" style="padding:8px 12px;font-size:.8rem" ' +
      'onclick="try{if(typeof openModalGlass===\'function\')openModalGlass(\'developingModal\');' +
      'else if(typeof showNotification===\'function\')showNotification(\'به‌زودی فعال می‌شود\',\'info\');}catch(e){}">' +
      'پیش‌نمایش</button></div>';
    if (container.firstChild) container.insertBefore(card, container.firstChild);
    else container.appendChild(card);
  }

  function patchRenderAdminModals() {
    var prev = window.renderAdminModals;
    if (typeof prev !== 'function' || prev.__kafeForMe) return;
    window.renderAdminModals = function () {
      var ret = prev.apply(this, arguments);
      try { injectForMeAdminCard(); } catch (e) {}
      return ret;
    };
    window.renderAdminModals.__kafeForMe = true;
  }

  /* ---- 4) حذف پیام: آرگومان امن + بازخورد ---- */
  function safeJsArg(value) {
    return "'" + String(value == null ? '' : value)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'") + "'";
  }

  function patchKafeHtmlJsArg() {
    // نسخه قبلی " را به " تبدیل می‌کرد و در بعضی WebViewها onclick می‌شکست
    window.kafeHtmlJsArg = function (value) {
      return safeJsArg(value);
    };
  }

  function patchDeleteMessage() {
    var prev = window.v18DeleteAdminMessage;
    if (typeof prev !== 'function' || prev.__kafeFb) {
      // اگر هنوز تعریف نشده، نسخه پایدار می‌سازیم
      if (typeof prev !== 'function') {
        window.v18DeleteAdminMessage = async function (msgId, convId) {
          return runDeleteMessage(msgId, convId);
        };
        window.v18DeleteAdminMessage.__kafeFb = true;
      }
      return;
    }
    window.v18DeleteAdminMessage = async function (msgId, convId) {
      return runDeleteMessage(msgId, convId, prev);
    };
    window.v18DeleteAdminMessage.__kafeFb = true;
  }

  async function runDeleteMessage(msgId, convId, prev) {
    try {
      if (!msgId) {
        notify('شناسه پیام نامعتبر', 'error');
        return;
      }
      if (!window.confirm('این پیام حذف شود؟')) return;
      notify('در حال حذف پیام…', 'info');

      if (typeof prev === 'function') {
        // اجرای نسخه اصلی بدون confirm دوباره: موقتاً confirm را no-op نمی‌کنیم؛
        // به‌جای آن مسیر مستقیم supabase را می‌رویم تا بازخورد کنترل‌شده باشد.
      }

      var c = window.supabaseClient || window.v12Supabase || null;
      if (!c) {
        notify('اتصال سرور نیست', 'error');
        return;
      }

      // دسترسی: اگر isAdmin موجود بود چک کن
      try {
        if (typeof isAdmin === 'function') {
          var ok = await isAdmin();
          if (!ok) {
            notify('دسترسی مدیریت لازم است', 'error');
            return;
          }
        }
      } catch (eA) {}

      var r = await c.from('messages').delete().eq('id', msgId);
      if (r && r.error) throw r.error;

      notify('✅ پیام حذف شد', 'success');
      if (convId && typeof window.v18OpenAdminConversation === 'function') {
        await window.v18OpenAdminConversation(convId);
      }
    } catch (e) {
      console.error('kafeDeleteMessage', e);
      notify('حذف پیام ناموفق: ' + ((e && e.message) || e), 'error');
    }
  }

  // delegated click fallback if inline onclick broken
  document.addEventListener(
    'click',
    function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var btn = t.closest('button');
      if (!btn) return;
      var label = (btn.textContent || '').trim();
      if (label !== 'حذف پیام') return;
      // اگر onclick سالم بود، همان اجرا می‌شود؛ این فقط وقتی است که data-attrs داشته باشیم
      var mid = btn.getAttribute('data-msg-id');
      var cid = btn.getAttribute('data-conv-id');
      if (!mid) return;
      ev.preventDefault();
      ev.stopPropagation();
      window.v18DeleteAdminMessage(mid, cid);
    },
    true
  );

  function enhanceDeleteButtons() {
    var list = document.getElementById('v18AdminMessageList');
    if (!list) return;
    list.querySelectorAll('button').forEach(function (btn) {
      if ((btn.textContent || '').trim() !== 'حذف پیام') return;
      if (btn.getAttribute('data-kafe-del-enhanced')) return;
      btn.setAttribute('data-kafe-del-enhanced', '1');
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';
      // استخراج آرگومان‌ها از onclick در صورت امکان
      var oc = btn.getAttribute('onclick') || '';
      var m = oc.match(/v18DeleteAdminMessage\(([^,]+),\s*([^)]+)\)/);
      if (m) {
        try {
          var mid = m[1].replace(/^"|"$/g, '"').replace(/^'|'$/g, '');
          mid = mid.replace(/^"|"$/g, '');
          var cid = m[2].replace(/^"|"$/g, '"').replace(/^'|'$/g, '');
          cid = cid.replace(/^"|"$/g, '');
          btn.setAttribute('data-msg-id', mid);
          btn.setAttribute('data-conv-id', cid);
          btn.onclick = function (e) {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
            window.v18DeleteAdminMessage(mid, cid);
            return false;
          };
        } catch (e2) {}
      }
    });
  }

  function run() {
    injectCSS();
    patchKafeHtmlJsArg();
    patchShowDetail();
    patchSubPurchase();
    patchRenderAdminModals();
    patchDeleteMessage();
    injectForMeAdminCard();
    restyleSubBox();
    elevateDetail();
    enhanceDeleteButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 400);
      setTimeout(run, 1200);
    });
  } else {
    run();
    setTimeout(run, 400);
    setTimeout(run, 1200);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 300);
  });
  document.addEventListener(
    'click',
    function () {
      setTimeout(function () {
        elevateDetail();
        restyleSubBox();
        injectForMeAdminCard();
        enhanceDeleteButtons();
        patchShowDetail();
        patchSubPurchase();
        patchRenderAdminModals();
        patchDeleteMessage();
      }, 30);
    },
    true
  );
})();
