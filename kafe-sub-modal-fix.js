/**
 * kafe-sub-modal-fix.js
 * اصلاح نمایش خرید اشتراک + خوانایی تنظیمات + جمع‌وجور کردن راهنما
 *
 * نحوه استفاده:
 * 1) این فایل را در ریشه ریپو کنار main.js قرار دهید.
 * 2) در index.html بعد از main.js این خط را اضافه کنید:
 *    <script src="./kafe-sub-modal-fix.js?v=1"></script>
 * 3) commit + push کنید.
 */
(function () {
  'use strict';
  if (window.__KAFE_SUB_MODAL_FIX_V1__) return;
  window.__KAFE_SUB_MODAL_FIX_V1__ = true;

  function injectCSS() {
    var id = 'kafe-sub-modal-fix-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '#subscriptionModalBox{',
      '  position:fixed!important;',
      '  top:var(--header-height,152px)!important;',
      '  bottom:calc(var(--bottom-nav-height,68px) + env(safe-area-inset-bottom,0px))!important;',
      '  left:0!important;right:0!important;',
      '  inset:auto!important;',
      '  z-index:5200!important;',
      '  background:rgba(0,0,0,.45)!important;',
      '  display:flex!important;',
      '  align-items:center!important;',
      '  justify-content:center!important;',
      '  padding:12px 14px!important;',
      '  box-sizing:border-box!important;',
      '  backdrop-filter:blur(6px)!important;',
      '  -webkit-backdrop-filter:blur(6px)!important;',
      '}',
      '#subscriptionModalBox .sub-modal-sheet{',
      '  width:100%!important;',
      '  max-width:420px!important;',
      '  max-height:100%!important;',
      '  overflow:auto!important;',
      '  border-radius:18px!important;',
      '  padding:16px 14px 18px!important;',
      '  box-sizing:border-box!important;',
      '  color:#F0E6D3!important;',
      '  background:rgba(12,16,28,.88)!important;',
      '  border:1.5px solid rgba(201,168,76,.55)!important;',
      '  backdrop-filter:blur(16px) saturate(1.15)!important;',
      '  -webkit-backdrop-filter:blur(16px) saturate(1.15)!important;',
      '  box-shadow:0 12px 40px rgba(0,0,0,.45),0 0 0 1px rgba(240,216,120,.12) inset!important;',
      '  animation:kafeSubModalIn .22s ease!important;',
      '}',
      '@keyframes kafeSubModalIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}',
      '#subscriptionModalBox .sub-modal-head{',
      '  display:flex!important;justify-content:space-between!important;align-items:center!important;',
      '  margin-bottom:10px!important;padding-bottom:8px!important;',
      '  border-bottom:1px dashed rgba(201,168,76,.4)!important;',
      '}',
      '#subscriptionModalBox .sub-modal-head strong{',
      '  color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;font-size:1.02rem!important;',
      '}',
      '#subscriptionModalBox .sub-modal-close{',
      '  border:1px solid rgba(201,168,76,.55)!important;background:rgba(255,255,255,.06)!important;',
      '  color:#F0D878!important;border-radius:10px!important;padding:6px 11px!important;cursor:pointer!important;',
      '  font-size:.95rem!important;font-family:inherit!important;',
      '}',
      '#subOrdersPanel{',
      '  position:fixed!important;',
      '  top:var(--header-height,152px)!important;',
      '  bottom:calc(var(--bottom-nav-height,68px) + env(safe-area-inset-bottom,0px))!important;',
      '  left:0!important;right:0!important;',
      '  z-index:5100!important;',
      '  background:rgba(0,0,0,.42)!important;',
      '  display:none;',
      '  align-items:center!important;',
      '  justify-content:center!important;',
      '  padding:12px 14px!important;',
      '  box-sizing:border-box!important;',
      '  backdrop-filter:blur(6px)!important;',
      '  -webkit-backdrop-filter:blur(6px)!important;',
      '}',
      '#subOrdersPanel[style*="flex"],#subOrdersPanel.active{',
      '  display:flex!important;',
      '}',
      '#subOrdersPanel .sub-orders-sheet{',
      '  position:relative!important;top:auto!important;bottom:auto!important;left:auto!important;right:auto!important;',
      '  width:100%!important;max-width:420px!important;max-height:100%!important;overflow:auto!important;',
      '  margin:0!important;',
      '  border-radius:18px!important;',
      '  background:rgba(12,16,28,.88)!important;',
      '  border:1.5px solid rgba(201,168,76,.55)!important;',
      '  backdrop-filter:blur(16px) saturate(1.15)!important;',
      '  -webkit-backdrop-filter:blur(16px) saturate(1.15)!important;',
      '  box-shadow:0 12px 40px rgba(0,0,0,.45)!important;',
      '  animation:kafeSubModalIn .22s ease!important;',
      '}',
      '#subOrdersPanel .sub-orders-status > button.btn[onclick*="openSubscriptionPurchase"],',
      '#subOrdersPanel button.kafe-hide-extra-buy{',
      '  display:none!important;',
      '}',
      '#settingsPanel .settings-field label,',
      '#settingsPanel .settings-field input,',
      '#settingsPanel #userDisplayName,',
      '#settingsPanel #userDisplayPhone,',
      '#settingsPanel #userIdDisplay{',
      '  color:#F5E9C9!important;',
      '  -webkit-text-fill-color:#F5E9C9!important;',
      '  opacity:1!important;',
      '}',
      '#settingsPanel .settings-field input{',
      '  background:rgba(255,255,255,.08)!important;',
      '  border:1px solid rgba(201,168,76,.4)!important;',
      '  font-weight:700!important;',
      '}',
      '#settingsPanel .settings-hint,',
      '#settingsPanel p.settings-hint{',
      '  color:#E8D5A3!important;',
      '  -webkit-text-fill-color:#E8D5A3!important;',
      '  opacity:1!important;',
      '  font-size:.82rem!important;',
      '  line-height:1.7!important;',
      '}',
      '#settingsPanel .settings-contact-fixed,',
      '#settingsPanel .settings-contact-fixed p,',
      '#settingsPanel .settings-contact-fixed strong{',
      '  color:#F0E6D3!important;',
      '  -webkit-text-fill-color:#F0E6D3!important;',
      '  opacity:1!important;',
      '}',
      '#pageModals .modals-home-hero{',
      '  padding:8px 10px!important;',
      '  margin:0 0 8px!important;',
      '  border-radius:12px!important;',
      '}',
      '#pageModals .modals-home-hero h2{',
      '  font-size:.9rem!important;',
      '  margin:0 0 2px!important;',
      '}',
      '#pageModals .modals-home-hero p{',
      '  font-size:.68rem!important;',
      '  line-height:1.4!important;',
      '}'
    ].join('\n');
  }

  window.openSubscriptionPurchase = async function openSubscriptionPurchase() {
    try {
      if (typeof window.loadSubscriptionPlans === 'function') await window.loadSubscriptionPlans();
    } catch (eLP) {}

    var old = document.getElementById('subscriptionModalBox');
    if (old) old.remove();

    window._subscriptionSelectedPlanDays = null;
    window._subscriptionReceiptFile = null;

    var field =
      'width:100%;box-sizing:border-box;padding:11px 12px;border:1.5px solid rgba(201,168,76,0.45);border-radius:12px;background:rgba(8,12,24,0.92);color:#F5E6C8;font-size:0.92rem;font-family:inherit;outline:none;';
    var label =
      'display:block;margin-bottom:5px;color:#E8D5A3;font-weight:700;font-size:0.8rem;';
    var planBtn =
      'padding:12px 8px;border:1px solid rgba(201,168,76,0.45);border-radius:14px;font-weight:800;font-size:0.85rem;font-family:inherit;cursor:pointer;color:#F5E6C8;background:linear-gradient(145deg,#1a1530,#0d1a2e);box-shadow:0 4px 14px rgba(0,0,0,0.3);';

    var box = document.createElement('div');
    box.id = 'subscriptionModalBox';
    box.innerHTML =
      '<div class="sub-modal-sheet" role="dialog" aria-modal="true" aria-label="خرید اشتراک">' +
      '<div class="sub-modal-head">' +
      '<strong>⭐ خرید اشتراک VIP</strong>' +
      '<button type="button" class="sub-modal-close" onclick="document.getElementById(\'subscriptionModalBox\').remove()">✕</button>' +
      '</div>' +
      '<div style="margin-bottom:10px;line-height:1.75;color:#C9C2B6;font-size:0.82rem;">اشتراک پس از بررسی فیش و تأیید مدیریت فعال می‌شود.</div>' +
      '<div style="margin-bottom:12px;padding:8px 10px;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.35);border-radius:12px;font-size:.74rem;color:#E8D5A3;line-height:1.75;">۱) مشخصات ← ۲) طرح ← ۳) فیش ← ۴) ارسال</div>' +
      '<div style="margin-bottom:12px;padding:10px;border-radius:14px;border:1px solid rgba(201,168,76,0.4);background:rgba(8,12,24,0.75);text-align:center;">' +
      '<div style="font-size:0.78rem;color:#E8D5A3;font-weight:800;margin-bottom:5px;">💳 اطلاعات واریز</div>' +
      '<div style="font-size:0.68rem;color:#C9C2B6;">شماره کارت</div>' +
      '<div id="subPaymentCard" style="font-size:1rem;font-weight:800;letter-spacing:1px;direction:ltr;font-family:monospace;color:#F5E6C8;margin:3px 0;">—</div>' +
      '<div id="subPaymentOwner" style="font-size:0.78rem;color:#C9C2B6;"></div>' +
      '<div id="subPaymentSheba" style="font-size:0.7rem;direction:ltr;color:#A39888;margin-bottom:6px;"></div>' +
      '<button type="button" class="btn" onclick="copyPaymentCard()" style="width:100%;padding:9px;font-size:0.82rem;">📋 کپی شماره کارت</button>' +
      '</div>' +
      '<div style="margin-bottom:12px;">' +
      '<label style="' + label + '">۱️⃣ نام و نام خانوادگی *</label>' +
      '<input id="subscriptionName" type="text" placeholder="مثال: علی رضایی" style="' + field + '" autocomplete="name">' +
      '</div>' +
      '<div style="margin-bottom:12px;">' +
      '<label style="' + label + '">۲️⃣ شماره تماس *</label>' +
      '<input id="subscriptionPhone" type="tel" inputmode="numeric" placeholder="09xxxxxxxxx" style="' + field + '" autocomplete="tel">' +
      '</div>' +
      '<div style="font-size:.82rem;color:#E8D5A3;font-weight:800;margin:2px 0 8px;">۳️⃣ انتخاب طرح اشتراک *</div>' +
      '<div id="subscriptionPlanButtons" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"></div>' +
      '<div id="subscriptionPlanStatus" style="margin-top:6px;font-size:.76rem;color:#A9A093;">هنوز طرحی انتخاب نشده است.</div>' +
      '<div style="margin-top:12px;padding:10px;background:rgba(255,255,255,.04);border:1.5px solid rgba(201,168,76,.45);border-radius:14px;">' +
      '<label style="' + label + '">۴️⃣ فیش واریزی * (حداکثر ۳ مگابایت)</label>' +
      '<input id="subscriptionReceiptFile" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onchange="previewSubscriptionReceipt(event)" style="width:100%;padding:7px;color:#F5E6C8;background:rgba(8,12,24,0.9);border:1px solid rgba(201,168,76,0.35);border-radius:8px;">' +
      '<img id="subscriptionReceiptPreview" alt="" style="display:none;max-width:100%;max-height:140px;margin-top:6px;border-radius:10px;">' +
      '<div id="subscriptionReceiptStatus" style="margin-top:6px;font-size:.74rem;color:#A9A093;">هنوز فیشی انتخاب نشده است.</div>' +
      '</div>' +
      '<button id="subscriptionSubmitBtn" type="button" style="width:100%;margin-top:14px;padding:12px;font-weight:900;font-size:.95rem;font-family:inherit;border:1px solid rgba(201,168,76,0.5);border-radius:14px;cursor:pointer;background:linear-gradient(135deg,#8F6F28,#C9A84C,#E6C878);color:#0d0f1a;opacity:.55;" onclick="submitSubscriptionRequest()" disabled>📤 ارسال درخواست اشتراک</button>' +
      '<div id="subscriptionSubmitStatus" style="margin-top:8px;text-align:center;font-size:.76rem;color:#A9A093;line-height:1.65;">برای ارسال، نام، شماره، طرح و فیش را کامل کنید.</div>' +
      '<p style="font-size:.68rem;color:#8A8478;line-height:1.65;margin:10px 0 2px;">پس از ارسال، درخواست روی سرور ثبت می‌شود و فقط بعد از تأیید مدیریت فعال می‌گردد.</p>' +
      '</div>';

    document.body.appendChild(box);

    if (typeof fillPaymentInfoUI === 'function') fillPaymentInfoUI();
    if (typeof refreshPaymentContactFromCloud === 'function') {
      refreshPaymentContactFromCloud()
        .then(function () {
          if (typeof fillPaymentInfoUI === 'function') fillPaymentInfoUI();
        })
        .catch(function () {});
    }

    try {
      var u = JSON.parse(localStorage.getItem('cafeUser') || '{}');
      if (u.name) {
        var n = document.getElementById('subscriptionName');
        if (n) n.value = u.name;
      }
      if (u.phone) {
        var p = document.getElementById('subscriptionPhone');
        if (p) p.value = u.phone;
      }
    } catch (e) {}

    var sn = document.getElementById('subscriptionName');
    var sp = document.getElementById('subscriptionPhone');
    function onField() {
      try {
        updateSubscriptionFormState();
      } catch (e) {}
    }
    if (sn) {
      sn.addEventListener('input', onField);
      sn.addEventListener('change', onField);
    }
    if (sp) {
      sp.addEventListener('input', onField);
      sp.addEventListener('change', onField);
    }

    try {
      var pb = document.getElementById('subscriptionPlanButtons');
      var plans = (window.getSubscriptionPlans && window.getSubscriptionPlans()) || [];
      if (pb) {
        pb.innerHTML = plans
          .map(function (p) {
            var price = Number(p.price) || 0;
            var priceTxt = price > 0 ? price.toLocaleString('fa-IR') + ' تومان' : 'قیمت اعلام‌نشده';
            return (
              '<button type="button" data-plan-days="' +
              p.days +
              '" class="subscription-plan-btn" style="' +
              planBtn +
              '" onclick="selectSubscriptionPlan(' +
              p.days +
              ')">' +
              (p.title || p.days + ' روزه') +
              '<br><span style="font-size:.72rem;font-weight:700;opacity:.95">' +
              priceTxt +
              '</span></button>'
            );
          })
          .join('');
      }
    } catch (eFill) {
      console.warn(eFill);
    }

    try {
      updateSubscriptionFormState();
    } catch (e) {}

    box.addEventListener('click', function (ev) {
      if (ev.target === box) box.remove();
    });
  };

  function hideExtraBuyButton() {
    var p = document.getElementById('subOrdersPanel');
    if (!p) return;
    var btns = p.querySelectorAll('button[onclick*="openSubscriptionPurchase"]');
    btns.forEach(function (b) {
      b.classList.add('kafe-hide-extra-buy');
      b.style.display = 'none';
    });
  }

  function run() {
    injectCSS();
    hideExtraBuyButton();
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
    setTimeout(run, 200);
    setTimeout(hideExtraBuyButton, 800);
  });
})();
