/* Kafe Miad — server-confirmed registration.
   Duplicate phone or any Supabase write failure must not create a local-only login.
*/
(function () {
  'use strict';

  var isRegistering = false;
  var REQUEST_TIMEOUT_MS = 20000;

  function registrationFeedback(message, type) {
    type = type || 'info';
    var button = document.querySelector('#registerScreen button.register-btn');
    var box = document.getElementById('kmRegistrationFeedback');
    if (!box && button && button.parentNode) {
      box = document.createElement('div');
      box.id = 'kmRegistrationFeedback';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      box.style.cssText = 'display:none;margin-top:12px;padding:11px 12px;border:1px solid rgba(201,168,76,.45);border-radius:12px;background:rgba(7,11,20,.97);color:#F5F0E4;font:700 13px/1.8 Vazirmatn,sans-serif;text-align:center;white-space:pre-wrap;overflow-wrap:anywhere;';
      button.parentNode.insertBefore(box, button.nextSibling);
    }
    if (box) {
      box.textContent = String(message || '');
      box.style.display = 'block';
      box.style.borderColor = type === 'error' ? '#ff6b6b' : (type === 'success' ? '#58d68d' : '#C9A84C');
      box.style.color = type === 'error' ? '#ffdede' : (type === 'success' ? '#caffdf' : '#F5F0E4');
    }

    var toast = document.getElementById('notification');
    if (toast) {
      toast.style.setProperty('position', 'fixed', 'important');
      toast.style.setProperty('z-index', '2147483647', 'important');
      toast.style.setProperty('top', 'calc(12px + env(safe-area-inset-top, 0px))', 'important');
      toast.style.setProperty('left', '12px', 'important');
      toast.style.setProperty('right', '12px', 'important');
      toast.style.setProperty('max-width', 'none', 'important');
      toast.style.setProperty('padding', '12px 14px', 'important');
      toast.style.setProperty('border-radius', '14px', 'important');
      toast.style.setProperty('background', type === 'error' ? '#7f1d1d' : (type === 'success' ? '#14532d' : '#172033'), 'important');
      toast.style.setProperty('color', '#ffffff', 'important');
      toast.style.setProperty('font-weight', '800', 'important');
      toast.style.setProperty('line-height', '1.8', 'important');
      toast.style.setProperty('box-shadow', '0 8px 28px rgba(0,0,0,.45)', 'important');
    }
    try {
      if (typeof window.showNotification === 'function') window.showNotification(message, type);
      else if (toast) { toast.textContent = String(message || ''); toast.style.display = 'block'; }
    } catch (e) {
      if (toast) { toast.textContent = String(message || ''); toast.style.display = 'block'; }
    }
  }

  function withTimeout(promise, message) {
    var timer;
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        timer = setTimeout(function () {
          reject(new Error(message || 'ارتباط با سرور برقرار نشد'));
        }, REQUEST_TIMEOUT_MS);
      })
    ]).finally(function () {
      clearTimeout(timer);
    });
  }

  window.registerUser = async function () {
    if (isRegistering) {
      registrationFeedback('درخواست قبلی هنوز در حال انجام است؛ لطفاً چند لحظه صبر کنید.', 'info');
      return;
    }
    isRegistering = true;
    var registerButton = document.querySelector(
      '#registerScreen button.register-btn'
    );
    var originalButtonText = registerButton
      ? registerButton.textContent
      : '';
    if (registerButton) {
      registerButton.disabled = true;
      registerButton.textContent = 'در حال بررسی...';
    }
    registrationFeedback('در حال بررسی اتصال و ارسال درخواست به سرور…', 'info');

    try {
      var nameEl = document.getElementById('regName');
      var phoneEl = document.getElementById('regPhone');
      var name = nameEl ? (nameEl.value || '').trim() : '';
      var phone = phoneEl ? (phoneEl.value || '').replace(/\s/g, '').trim() : '';

      if (!name || !phone) {
        registrationFeedback('لطفاً نام و شماره تماس را وارد کنید.', 'error');
        return;
      }
      if (!/^09[0-9]{9}$/.test(phone)) {
        registrationFeedback('شماره تماس نامعتبر است؛ شماره را با ۰۹ شروع کنید و ۱۱ رقم وارد کنید.', 'error');
        return;
      }

      var supabaseClient = window.supabaseClient || window.v12Supabase || null;
      if (!supabaseClient) {
        registrationFeedback('ثبت‌نام انجام نشد: اتصال امن به سرور آماده نیست. اینترنت را بررسی کنید و دوباره تلاش کنید.', 'error');
        return;
      }

      // ۱. اطمینان از وجود سشن
      var sr = await withTimeout(
        supabaseClient.auth.getSession(),
        'ارتباط با سرور برقرار نشد'
      );
      var session = sr && sr.data && sr.data.session;

      if (!session || !session.user) {
        if (!supabaseClient.auth.signInAnonymously) {
          throw new Error('ورود کاربر در این پروژه فعال نیست.');
        }
        var ar = await withTimeout(
          supabaseClient.auth.signInAnonymously(),
          'ارتباط با سرور برقرار نشد'
        );
        if (ar.error || !ar.data || !ar.data.session) {
          throw (ar.error || new Error('ایجاد نشست کاربر ناموفق بود.'));
        }
        session = ar.data.session;
      }

      var user = session.user;
      var registeredAt = new Date().toISOString();
      var finalUserData;
      var isReturning = false;

      // ۲. اول سعی کن پروفایل خود همین سشن را بخوانی
      var own = await withTimeout(
        supabaseClient
          .from('profiles')
          .select('id,name,phone,registered_at,role')
          .eq('id', user.id)
          .maybeSingle(),
        'ارتباط با سرور برقرار نشد'
      );

      if (own.error) {
        // A failed profile read is not the same as "no profile".
        throw own.error;
      }

      if (own.data && own.data.phone) {
        // همین سشن قبلاً پروفایل دارد؛ تغییر نام هم باید از سرور تأیید شود.
        finalUserData = {
          name: own.data.name || name,
          phone: own.data.phone,
          registeredAt: own.data.registered_at || registeredAt,
          user_id: own.data.id,
          role: own.data.role || 'user'
        };
        if (name && name !== own.data.name) {
          var nameUpdate = await withTimeout(
            supabaseClient
              .from('profiles')
              .update({ name: name })
              .eq('id', user.id)
              .select('id,name,phone,registered_at,role')
              .maybeSingle(),
            'ارتباط با سرور برقرار نشد'
          );
          if (nameUpdate.error || !nameUpdate.data || nameUpdate.data.id !== user.id) {
            throw (nameUpdate.error || new Error('تغییر نام از سرور تأیید نشد.'));
          }
          finalUserData.name = nameUpdate.data.name || name;
        }
        isReturning = true;
      } else {
        // سعی کن پروفایل جدید بسازی
        var profilePayload = {
          id: user.id,
          name: name,
          phone: phone,
          registered_at: registeredAt
        };

        var pr = await withTimeout(
          supabaseClient
            .from('profiles')
            .upsert(profilePayload, { onConflict: 'id' })
            .select()
            .single(),
          'ارتباط با سرور برقرار نشد'
        );

        if (pr.error || !pr.data || pr.data.id !== user.id || pr.data.phone !== phone) {
          // Online-only: a phone number already in use is not proof of account ownership.
          // Never create a local-only session when the server rejects registration.
          throw (pr.error || new Error('ثبت حساب توسط سرور تأیید نشد.'));
        } else {
          finalUserData = {
            name: pr.data.name || name,
            phone: pr.data.phone,
            registeredAt: pr.data.registered_at || registeredAt,
            user_id: pr.data.id,
            role: pr.data.role || 'user'
          };
        }
      }

      // ۳. ورود فقط پس از تأیید دوباره نشست و پروفایل از خود سرور
      if (typeof window.kafeConfirmServerProfile !== 'function' ||
          !(await withTimeout(
            window.kafeConfirmServerProfile(
              finalUserData.user_id,
              finalUserData.phone
            ),
            'تأیید حساب از سرور بیش از ۲۰ ثانیه طول کشید؛ دوباره تلاش کنید.'
          ))) {
        throw new Error('ثبت حساب در دیتابیس تأیید نشد؛ ورود انجام نشد.');
      }

      if (typeof updateUserDisplay === 'function') {
        try {
          await withTimeout(updateUserDisplay(finalUserData), 'به‌روزرسانی نمای کاربر زمان‌بر شد');
        } catch (uiError) {
          // The profile write was already confirmed by Supabase. Do not misreport
          // a UI refresh issue as a failed server registration.
          console.warn('Registration confirmed; user display refresh failed:', uiError);
        }
      }

      registrationFeedback(
        isReturning
          ? '✅ خوش آمدید دوباره ' + finalUserData.name
          : '✅ ثبت‌نام توسط سرور تأیید شد و حساب شما ثبت گردید.',
        'success'
      );
    } catch (e) {
      console.error('user entry', e);
      registrationFeedback('❌ ثبت‌نام انجام نشد: ' + (e.message || 'ارتباط با سرور برقرار نشد') + '\nاطلاعات شما به‌صورت محلی تأیید نمی‌شود؛ پس از رفع خطا دوباره تلاش کنید.', 'error');
    } finally {
      isRegistering = false;
      if (registerButton) {
        registerButton.disabled = false;
        registerButton.textContent = originalButtonText;
      }
    }
  };

  console.log('✅ registration-recovery online-only policy loaded');
})();
