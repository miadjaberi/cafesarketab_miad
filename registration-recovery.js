/* Kafe Miad — server-confirmed phone + PIN registration/login.
   No anonymous sign-in and no local-only authentication. */
(function () {
  'use strict';
  var busy = false;
  var TIMEOUT_MS = 20000;

  function feedback(message, type) {
    var box = document.getElementById('kmRegistrationFeedback');
    var button = document.querySelector('#registerScreen button.register-btn');
    if (!box && button && button.parentNode) {
      box = document.createElement('div');
      box.id = 'kmRegistrationFeedback';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      box.style.cssText = 'margin-top:12px;padding:11px 12px;border:1px solid #C9A84C;border-radius:12px;background:rgba(7,11,20,.97);color:#F5F0E4;font:700 13px/1.8 Vazirmatn,sans-serif;text-align:center;white-space:pre-wrap;overflow-wrap:anywhere;';
      button.parentNode.insertBefore(box, button.nextSibling);
    }
    if (box) {
      box.textContent = message;
      box.style.display = 'block';
      box.style.borderColor = type === 'error' ? '#ff6b6b' : type === 'success' ? '#58d68d' : '#C9A84C';
    }
    try {
      if (typeof window.showNotification === 'function') window.showNotification(message, type || 'info');
    } catch (_) {}
  }

  function timed(promise) {
    var timer;
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        timer = setTimeout(function () { reject(new Error('پاسخ سرور دیر رسید؛ اینترنت را بررسی و دوباره تلاش کنید.')); }, TIMEOUT_MS);
      })
    ]).finally(function () { clearTimeout(timer); });
  }

  function ensurePinField() {
    var phone = document.getElementById('regPhone');
    if (!phone || document.getElementById('regPin')) return;
    var group = phone.closest('.input-group') || phone.parentElement;
    if (!group || !group.parentNode) return;
    var wrap = document.createElement('div');
    wrap.className = group.className || 'input-group';
    wrap.style.marginTop = '12px';
    var label = document.createElement('label');
    label.htmlFor = 'regPin';
    label.textContent = 'رمز ورود (۸ تا ۱۲ رقم)';
    var pin = document.createElement('input');
    pin.id = 'regPin';
    pin.type = 'password';
    pin.inputMode = 'numeric';
    pin.autocomplete = 'new-password';
    pin.maxLength = 12;
    pin.placeholder = 'یک رمز شخصی بسازید و نگه دارید';
    pin.setAttribute('aria-label', label.textContent);
    pin.style.cssText = phone.style.cssText || '';
    wrap.appendChild(label);
    wrap.appendChild(pin);
    group.parentNode.insertBefore(wrap, group.nextSibling);
  }

  window.registerUser = async function () {
    if (busy) return feedback('درخواست قبلی هنوز در حال انجام است.', 'info');
    busy = true;
    var button = document.querySelector('#registerScreen button.register-btn');
    var oldText = button ? button.textContent : '';
    if (button) { button.disabled = true; button.textContent = 'در حال بررسی امن…'; }
    try {
      ensurePinField();
      var nameEl = document.getElementById('regName');
      var phoneEl = document.getElementById('regPhone');
      var pinEl = document.getElementById('regPin');
      var name = nameEl ? nameEl.value.trim() : '';
      var phone = phoneEl ? phoneEl.value.replace(/\s/g, '').trim() : '';
      var pin = pinEl ? pinEl.value.trim() : '';

      if (!name || !phone || !pin) throw new Error('نام، شماره تماس و رمز ورود را وارد کنید.');
      if (!/^09[0-9]{9}$/.test(phone)) throw new Error('شماره تماس باید ۱۱ رقم و با ۰۹ شروع شود.');
      if (!/^\d{8,12}$/.test(pin)) throw new Error('رمز باید فقط شامل ۸ تا ۱۲ رقم باشد.');

      var client = window.supabaseClient || window.v12Supabase;
      if (!client || !client.functions || typeof client.functions.invoke !== 'function') {
        throw new Error('اتصال امن برنامه به سرور آماده نیست.');
      }

      feedback('درخواست به سرور ارسال شد؛ لطفاً صفحه را نبندید.', 'info');
      var result = await timed(client.functions.invoke('phone-pin-auth', {
        body: { action: 'register_or_login', name: name, phone: phone, pin: pin }
      }));
      if (result.error) {
        var detail = result.data && result.data.error;
        throw new Error(detail || result.error.message || 'سرور درخواست را نپذیرفت.');
      }
      var data = result.data || {};
      if (!data.session || !data.user || !data.profile) {
        throw new Error(data.error || 'سرور حساب و نشست معتبر برنگرداند.');
      }
      var auth = await timed(client.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }));
      if (auth.error) throw auth.error;
      var confirmed = typeof window.kafeConfirmServerProfile === 'function' &&
        await timed(window.kafeConfirmServerProfile(data.profile.id, data.profile.phone));
      if (!confirmed) throw new Error('نشست و پروفایل از سرور تأیید نشد؛ ورود انجام نشد.');

      if (typeof window.updateUserDisplay === 'function') {
        try { await window.updateUserDisplay(data.profile); } catch (e) { console.warn('User display update failed', e); }
      }
      feedback(data.created ? '✅ ثبت‌نام با تأیید سرور انجام شد.' : '✅ ورود با تأیید سرور انجام شد.', 'success');
    } catch (e) {
      console.error('Phone/PIN registration:', e);
      feedback('❌ ' + (e && e.message ? e.message : 'ثبت‌نام یا ورود انجام نشد.') +
        '\nورود محلی انجام نشد؛ اطلاعات را بررسی و دوباره تلاش کنید.', 'error');
    } finally {
      busy = false;
      if (button) { button.disabled = false; button.textContent = oldText; }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensurePinField, { once: true });
  } else ensurePinField();
  console.info('Kafe Miad phone/PIN registration client loaded; authentication requires server confirmation.');
})();