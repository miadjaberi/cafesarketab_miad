/* Kafe Miad — registration recovery + fixed server-backed registerUser
   Fixes: duplicate key value violates unique constraint "profiles_phone_unique"
   Note: RLS blocks select-by-phone for other users, so on 23505 we accept locally.
*/
(function () {
  'use strict';

  var isRegistering = false;

  window.registerUser = async function () {
    if (isRegistering) {
      if (typeof showNotification === 'function') {
        showNotification('لطفاً چند لحظه صبر کنید...', 'info');
      }
      return;
    }
    isRegistering = true;

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
      var sr = await supabaseClient.auth.getSession();
      var session = sr && sr.data && sr.data.session;

      if (!session || !session.user) {
        if (!supabaseClient.auth.signInAnonymously) {
          throw new Error('ورود کاربر در این پروژه فعال نیست.');
        }
        var ar = await supabaseClient.auth.signInAnonymously();
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
      var own = await supabaseClient
        .from('profiles')
        .select('id,name,phone,registered_at,role')
        .eq('id', user.id)
        .maybeSingle();

      if (own.data && own.data.phone) {
        // همین سشن قبلاً پروفایل دارد
        finalUserData = {
          name: name || own.data.name,
          phone: own.data.phone,
          registeredAt: own.data.registered_at || registeredAt,
          user_id: own.data.id,
          role: own.data.role || 'user'
        };
        if (name && name !== own.data.name) {
          await supabaseClient.from('profiles').update({ name: name }).eq('id', user.id);
          finalUserData.name = name;
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

        var pr = await supabaseClient
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' })
          .select()
          .single();

        if (pr.error) {
          // Online-only: a phone number already in use is not proof of account ownership.
          // Never create a local-only session when the server rejects registration.
          throw pr.error;
        } else {
          finalUserData = {
            name: name,
            phone: phone,
            registeredAt: registeredAt,
            user_id: user.id
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
        await updateUserDisplay(finalUserData);
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
        showNotification('❌ ورود کاربر انجام نشد: ' + (e.message || e), 'error');
      }
    } finally {
      isRegistering = false;
    }
  };

  console.log('✅ registration-recovery fixed v2 (RLS-safe returning users) loaded');
})();
