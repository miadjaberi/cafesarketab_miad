/* Kafe Miad — isolated phone/PIN entry handler.
   Loaded after main.js so a runtime error in an unrelated main.js initializer
   cannot leave the entry buttons without their handlers. */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://evxxvnlwtbaqpjbjaxdk.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_yqampnRU4wIzRn-3ENi81g_ojYSM4le';

  function notify(message, type) {
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification(message, type || 'info');
        return;
      }
    } catch (e) {}
    var box = document.getElementById('phonePinAuthNotice');
    if (!box) {
      box = document.createElement('div');
      box.id = 'phonePinAuthNotice';
      box.setAttribute('role', 'status');
      box.style.cssText = 'position:fixed;z-index:2147483647;top:12px;left:12px;right:12px;padding:14px;border:1px solid #c9a84c;border-radius:12px;background:#101b2d;color:#ffe082;text-align:center;font:600 14px/1.8 sans-serif;direction:rtl;box-shadow:0 4px 20px #0008';
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.style.display = 'block';
  }

  function client() {
    if (window.supabaseClient && window.supabaseClient.auth) return window.supabaseClient;
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      return window.supabaseClient;
    }
    return null;
  }

  window.phonePinAuthMode = window.phonePinAuthMode === 'login' ? 'login' : 'register';

  window.togglePhonePinMode = function () {
    var mode = window.phonePinAuthMode === 'register' ? 'login' : 'register';
    window.phonePinAuthMode = mode;
    var nameEl = document.getElementById('regName');
    var desc = document.getElementById('authModeDescription');
    var submit = document.getElementById('authSubmitButton');
    var toggle = document.getElementById('authModeToggle');
    var pinEl = document.getElementById('regPin');
    if (nameEl) {
      nameEl.style.display = mode === 'login' ? 'none' : '';
      nameEl.required = mode === 'register';
      nameEl.setAttribute('aria-hidden', mode === 'login' ? 'true' : 'false');
    }
    if (desc) desc.textContent = mode === 'login'
      ? 'برای ورود، شماره تلفن و PIN قبلی خود را وارد کنید.'
      : 'برای ثبت‌نام، نام، شماره تماس و PIN دلخواه ۸ تا ۱۲ رقمی را وارد کنید.';
    if (submit) submit.innerHTML = mode === 'login'
      ? '<i class="fas fa-sign-in-alt"></i> ورود'
      : '<i class="fas fa-user-plus"></i> ثبت‌نام';
    if (toggle) toggle.textContent = mode === 'login'
      ? 'حساب ندارید؟ ثبت‌نام کنید'
      : 'قبلاً حساب دارید؟ ورود با شماره و PIN';
    if (pinEl) pinEl.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  };

  window.registerUser = async function () {
    var mode = window.phonePinAuthMode === 'login' ? 'login' : 'register';
    var nameEl = document.getElementById('regName');
    var phoneEl = document.getElementById('regPhone');
    var pinEl = document.getElementById('regPin');
    var submit = document.getElementById('authSubmitButton');
    var name = nameEl ? String(nameEl.value || '').trim() : '';
    var phone = phoneEl ? String(phoneEl.value || '').replace(/\s/g, '').trim() : '';
    var pin = pinEl ? String(pinEl.value || '').trim() : '';

    if (mode === 'register' && !name) return notify('لطفاً نام و نام خانوادگی را وارد کنید', 'error');
    if (!phone || !pin) return notify('لطفاً شماره تلفن و PIN را وارد کنید', 'error');
    if (!/^09[0-9]{9}$/.test(phone)) return notify('شماره تلفن باید ۱۱ رقم و با 09 شروع شود', 'error');
    if (!/^\d{8,12}$/.test(pin)) return notify('PIN باید فقط شامل ۸ تا ۱۲ رقم باشد', 'error');

    var sb = client();
    if (!sb) return notify('کتابخانه اتصال به سرور بارگذاری نشده است؛ صفحه را تازه‌سازی کنید.', 'error');
    if (submit) submit.disabled = true;
    try {
      var response = await fetch(SUPABASE_URL + '/functions/v1/phone-pin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({ action: mode, name: mode === 'register' ? name : '', phone: phone, pin: pin })
      });
      var result = null;
      try { result = await response.json(); } catch (e) {}
      if (!response.ok) {
        var serverMessage = result && (result.error || result.message);
        if (response.status === 409 && mode === 'register') throw new Error('این شماره قبلاً ثبت شده است؛ از گزینه «ورود با شماره و PIN» استفاده کنید.');
        if ((response.status === 401 || response.status === 403) && mode === 'login') throw new Error('PIN اشتباه است یا ورود به این حساب مجاز نیست. شماره و PIN را بررسی کنید.');
        if (response.status === 404 && mode === 'login') throw new Error('برای این شماره حسابی پیدا نشد؛ ابتدا ثبت‌نام کنید.');
        throw new Error(serverMessage || ('درخواست ناموفق بود (HTTP ' + response.status + ')'));
      }
      if (!result || !result.session || !result.session.access_token || !result.session.refresh_token || !result.profile || !result.user || !result.user.id) {
        throw new Error('پاسخ سرور کامل نیست؛ نشست ورود دریافت نشد.');
      }
      if (mode === 'register' && result.created !== true) throw new Error('این شماره قبلاً ثبت شده است؛ از گزینه «ورود با شماره و PIN» استفاده کنید.');
      if (mode === 'login' && result.created === true) throw new Error('سرور پاسخ ورود معتبر نداد. ثبت‌نام جدید از مسیر ورود پذیرفته نمی‌شود.');

      var sessionResult = await sb.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token
      });
      if (sessionResult.error || !sessionResult.data || !sessionResult.data.session) {
        throw sessionResult.error || new Error('ذخیره نشست ورود ناموفق بود.');
      }
      var session = sessionResult.data.session;
      if (!session.user || session.user.id !== result.user.id || result.profile.id !== result.user.id) {
        await sb.auth.signOut();
        throw new Error('شناسه حساب با نشست ورود مطابقت ندارد.');
      }
      try {
        localStorage.setItem('cafeUser', JSON.stringify({
          name: result.profile.name || name,
          phone: result.profile.phone || phone,
          registeredAt: result.profile.registered_at || new Date().toISOString(),
          user_id: result.profile.id
        }));
      } catch (e) {}
      var registerScreen = document.getElementById('registerScreen');
      var app = document.getElementById('app');
      if (registerScreen) registerScreen.style.display = 'none';
      if (app) app.style.display = 'block';
      try {
        if (typeof window.updateUserDisplay === 'function') await window.updateUserDisplay(result.profile);
      } catch (e) { console.warn('updateUserDisplay after login', e); }
      notify(mode === 'register' ? 'ثبت‌نام با موفقیت انجام شد.' : 'ورود با موفقیت انجام شد.');
    } catch (e) {
      console.error('phone-pin-auth entry', e);
      notify('ورود/ثبت‌نام انجام نشد: ' + (e && e.message ? e.message : 'خطای نامشخص'), 'error');
    } finally {
      if (submit) submit.disabled = false;
    }
  };

  // Fail loudly rather than leaving a dead-looking button.
  var btn = document.getElementById('authSubmitButton');
  if (btn) {
    btn.type = 'button';
    btn.onclick = function () {
      alert('دکمه کلیک شد!');
      if (typeof window.registerUser !== 'function') {
        notify('تابع ورود بارگذاری نشد. صفحه را تازه‌سازی کنید.', 'error');
        return;
      }
      window.registerUser();
    };
  }
  var toggle = document.getElementById('authModeToggle');
  if (toggle) {
    toggle.type = 'button';
    toggle.onclick = function () { window.togglePhonePinMode(); };
  }
})();
