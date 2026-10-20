/* Kafe Miad — server-confirmed registration.
   Duplicate phone or any Supabase write failure must not create a local-only login.
*/
(function () {
  'use strict';

  var isRegistering = false;
  var REQUEST_TIMEOUT_MS = 15000;

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
      if (typeof showNotification === 'function') {
        showNotification('لطفاً چند لحظه صبر کنید...', 'info');
      }
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
      registerButton.textContent = 'در حال ارسال...';
    }

    try {
      var nameEl = document.getElementById('regName');
      var phoneEl = document.getElementById('regPhone');
      var name = nameEl ? (nameEl.value || '').trim() : '';
      var phone = phoneEl ? (phoneEl.value || '').replace(/\s/g, '').trim() : '';

      if (!name || !phone) {
        if (typeof showNotification === 'function') showNotification('لطفاً نام و شماره تماس را وارد کنید', 'error');
        return;
      }
      if (!/^09[0-9]{9}$/.test(phone)) {
        if (typeof showNotification === 'function') showNotification('شماره تماس نامعتبر است', 'error');
        return;
      }

      var supabaseClient = window.supabaseClient || window.v12Supabase || null;
      if (!supabaseClient) {
        if (typeof showNotification === 'function') showNotification('❌ اتصال آنلاین در دسترس نیست', 'error');
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

      // ۳. ذخیره و ورود
      try {
        localStorage.setItem('cafeUser', JSON.stringify(finalUserData));
      } catch (e) {}

      var rs = document.getElementById('registerScreen');
      var app = document.getElementById('app');
      if (rs) rs.style.display = 'none';
      if (app) {
        app.style.display = 'block';
        app.classList.remove('hidden');
      }

      if (typeof updateUserDisplay === 'function') {
        await withTimeout(
          updateUserDisplay(finalUserData),
          'ارتباط با سرور برقرار نشد'
        );
      }

      if (typeof showNotification === 'function') {
        showNotification(
          isReturning
            ? '✅ خوش آمدید دوباره ' + finalUserData.name
            : '✅ ورود کاربر انجام شد و حساب روی سرور ثبت شد.'
        );
      }
    } catch (e) {
      console.error('user entry', e);
      if (typeof showNotification === 'function') {
        showNotification('❌ ثبت‌نام انجام نشد: ' + (e.message || 'ارتباط با سرور برقرار نشد'), 'error');
      } else {
        alert('ثبت‌نام انجام نشد: ' + (e.message || 'ارتباط با سرور برقرار نشد'));
      }
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
